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

        const nextPaidAmount = invoice.paidAmount + data.amount;
        if (nextPaidAmount > invoice.amount) {
          throw new BadRequestException(
            'Receipt amount would exceed invoice amount',
          );
        }

        const payload = receiptRepository.create({
          uid: data.id,
          invoiceUid: data.invoiceId,
          amount: data.amount,
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
        }
        await invoiceRepository.save(invoice);

        const trip = await tripRepository.findOne({ where: { uid: invoice.tripUid } });
        if (trip) {
          trip.paidAmount = nextPaidAmount;
          await tripRepository.save(trip);
        }

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
}
