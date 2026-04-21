import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from '../trip/trip.entity';
import {
  InvoicePaymentStatus,
  InvoiceStatus,
} from '../invoice/invoice.dto';
import { Invoice } from '../invoice/invoice.entity';
import { CreateReceiptDTO, ReceiptModel } from './receipt.dto';
import { Receipt } from './receipt.entity';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(Receipt)
    private repository: Repository<Receipt>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
  ) {}

  async createReceipt(data: CreateReceiptDTO): Promise<ReceiptModel> {
    try {
      return await this.repository.manager.transaction(async (manager) => {
        const receiptRepository = manager.getRepository(Receipt);
        const invoiceRepository = manager.getRepository(Invoice);
        const tripRepository = manager.getRepository(Trip);

        const invoice = await invoiceRepository.findOne({
          where: { uid: data.invoiceId },
        });
        if (!invoice) {
          throw new BadRequestException(`Invoice with ID ${data.invoiceId} not found`);
        }

        const amount = Number(data.amount);
        const nextPaidAmount = invoice.paidAmount + amount;
        if (nextPaidAmount > invoice.amount) {
          throw new BadRequestException(
            'Receipt amount would exceed invoice amount',
          );
        }

        const payload = receiptRepository.create({
          uid: data.id,
          invoiceUid: data.invoiceId,
          amount,
          paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
          reference: data.reference,
          notes: data.notes,
          attachment: data.attachment,
        });

        const saved = await receiptRepository.save(payload);

        invoice.paidAmount = nextPaidAmount;
        invoice.paymentStatus = this.getPaymentStatus(
          invoice.amount,
          invoice.paidAmount,
        );
        if (invoice.paymentStatus === InvoicePaymentStatus.FULL_PAID) {
          invoice.status = InvoiceStatus.PAID;
        } else if (invoice.status === InvoiceStatus.PAID) {
          invoice.status = InvoiceStatus.ISSUED;
        }
        await invoiceRepository.save(invoice);

        await this.syncTripsByInvoicePaymentStatus(tripRepository, invoice);

        const entity = await receiptRepository.findOne({
          where: { uid: saved.uid },
          relations: { invoice: true },
        });

        return (entity ?? saved).toDTO();
      });
    } catch (e) {
      Logger.error('Failed to create receipt', e);
      throw e;
    }
  }

  async updateReceipt(data: CreateReceiptDTO): Promise<ReceiptModel> {
    try {
      return await this.repository.manager.transaction(async (manager) => {
        const receiptRepository = manager.getRepository(Receipt);
        const invoiceRepository = manager.getRepository(Invoice);
        const tripRepository = manager.getRepository(Trip);

        const existing = await receiptRepository.findOne({
          where: { uid: data.id },
        });
        if (!existing) {
          throw new NotFoundException(`Receipt with ID ${data.id} not found`);
        }

        const oldInvoice = await invoiceRepository.findOne({
          where: { uid: existing.invoiceUid },
        });
        if (!oldInvoice) {
          throw new BadRequestException(
            `Invoice with ID ${existing.invoiceUid} not found`,
          );
        }

        const targetInvoiceUid = data.invoiceId || existing.invoiceUid;
        const targetAmount = data.amount !== undefined ? Number(data.amount) : existing.amount;
        const targetInvoice = await invoiceRepository.findOne({
          where: { uid: targetInvoiceUid },
        });
        if (!targetInvoice) {
          throw new BadRequestException(`Invoice with ID ${targetInvoiceUid} not found`);
        }

        if (oldInvoice.uid === targetInvoice.uid) {
          const recalculatedPaidAmount =
            oldInvoice.paidAmount - existing.amount + targetAmount;
          if (recalculatedPaidAmount > oldInvoice.amount) {
            throw new BadRequestException(
              'Receipt amount would exceed invoice amount',
            );
          }
          if (recalculatedPaidAmount < 0) {
            throw new BadRequestException('Invoice paid amount cannot be negative');
          }

          oldInvoice.paidAmount = recalculatedPaidAmount;
          oldInvoice.paymentStatus = this.getPaymentStatus(
            oldInvoice.amount,
            oldInvoice.paidAmount,
          );
          if (oldInvoice.paymentStatus === InvoicePaymentStatus.FULL_PAID) {
            oldInvoice.status = InvoiceStatus.PAID;
          } else if (oldInvoice.status === InvoiceStatus.PAID) {
            oldInvoice.status = InvoiceStatus.ISSUED;
          }
          await invoiceRepository.save(oldInvoice);

          await this.syncTripsByInvoicePaymentStatus(tripRepository, oldInvoice);
        } else {
          const oldInvoicePaidAmount = oldInvoice.paidAmount - existing.amount;
          if (oldInvoicePaidAmount < 0) {
            throw new BadRequestException('Invoice paid amount cannot be negative');
          }

          const targetInvoicePaidAmount = targetInvoice.paidAmount + targetAmount;
          if (targetInvoicePaidAmount > targetInvoice.amount) {
            throw new BadRequestException(
              'Receipt amount would exceed invoice amount',
            );
          }

          oldInvoice.paidAmount = oldInvoicePaidAmount;
          oldInvoice.paymentStatus = this.getPaymentStatus(
            oldInvoice.amount,
            oldInvoice.paidAmount,
          );
          if (oldInvoice.paymentStatus === InvoicePaymentStatus.FULL_PAID) {
            oldInvoice.status = InvoiceStatus.PAID;
          } else if (oldInvoice.status === InvoiceStatus.PAID) {
            oldInvoice.status = InvoiceStatus.ISSUED;
          }

          targetInvoice.paidAmount = targetInvoicePaidAmount;
          targetInvoice.paymentStatus = this.getPaymentStatus(
            targetInvoice.amount,
            targetInvoice.paidAmount,
          );
          if (targetInvoice.paymentStatus === InvoicePaymentStatus.FULL_PAID) {
            targetInvoice.status = InvoiceStatus.PAID;
          } else if (targetInvoice.status === InvoiceStatus.PAID) {
            targetInvoice.status = InvoiceStatus.ISSUED;
          }

          await invoiceRepository.save(oldInvoice);
          await invoiceRepository.save(targetInvoice);

          await this.syncTripsByInvoicePaymentStatus(tripRepository, oldInvoice);
          await this.syncTripsByInvoicePaymentStatus(tripRepository, targetInvoice);
        }

        existing.invoiceUid = targetInvoiceUid;
        existing.amount = targetAmount;
        existing.paidAt = data.paidAt ? new Date(data.paidAt) : existing.paidAt;
        existing.reference = data.reference ?? existing.reference;
        existing.notes = data.notes ?? existing.notes;
        existing.attachment = data.attachment ?? existing.attachment;

        const updated = await receiptRepository.save(existing);

        const entity = await receiptRepository.findOne({
          where: { uid: updated.uid },
          relations: { invoice: true },
        });

        return (entity ?? updated).toDTO();
      });
    } catch (e) {
      Logger.error('Failed to update receipt', e);
      throw e;
    }
  }

  async getAllReceipts(): Promise<ReceiptModel[]> {
    try {
      const entities = await this.repository.find({ relations: { invoice: true } });
      return entities.map((entity) => entity.toDTO());
    } catch (e) {
      Logger.error('Failed to get receipts', e);
      throw e;
    }
  }

  async getReceiptById(id: string): Promise<ReceiptModel> {
    try {
      const entity = await this.repository.findOne({
        where: { uid: id },
        relations: { invoice: true },
      });
      if (!entity) {
        throw new NotFoundException(`Receipt with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get receipt by id', e);
      throw e;
    }
  }

  private getPaymentStatus(
    amount: number,
    paidAmount: number,
  ): InvoicePaymentStatus {
    if (paidAmount <= 0) {
      return InvoicePaymentStatus.UNPAID;
    }
    if (paidAmount >= amount) {
      return InvoicePaymentStatus.FULL_PAID;
    }
    return InvoicePaymentStatus.PARTIALLY_PAID;
  }

  private async syncTripsByInvoicePaymentStatus(
    tripRepository: Repository<Trip>,
    invoice: Invoice,
  ): Promise<void> {
    if (invoice.paymentStatus !== InvoicePaymentStatus.FULL_PAID) {
      return;
    }

    const linkedTrips = await tripRepository.find({
      where: { invoiceUid: invoice.uid },
    });

    if (!linkedTrips.length) {
      return;
    }

    for (const trip of linkedTrips) {
      trip.paidAmount = trip.revenue;
    }

    await tripRepository.save(linkedTrips);
  }
}
