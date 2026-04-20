import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import {
  CreateInvoiceDTO,
  InvoiceModel,
  InvoicePaymentStatus,
  InvoiceStatus,
} from './invoice.dto';
import { Trip } from '../trip/trip.entity';
import { Route } from '../route/route.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private repository: Repository<Invoice>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
  ) {}

  async generateInvoiceForTrip(data: CreateInvoiceDTO): Promise<InvoiceModel> {
    try {
      return await this.repository.manager.transaction(async (manager) => {
        const invoiceRepository = manager.getRepository(Invoice);
        const tripRepository = manager.getRepository(Trip);
        const routeRepository = manager.getRepository(Route);

        const trip = await tripRepository.findOne({
          where: { uid: data.tripId },
          relations: { route: true, customer: true },
        });
        if (!trip) {
          throw new BadRequestException(`Trip with ID ${data.tripId} not found`);
        }
        if (!trip.customerUid) {
          throw new BadRequestException(
            `Trip ${data.tripId} has no associated customer`,
          );
        }
        if (trip.invoiceUid) {
          throw new BadRequestException(
            `Trip ${data.tripId} is already linked to an invoice`,
          );
        }

        const paidAmount = data.paidAmount ?? trip.paidAmount ?? 0;
        if (paidAmount < 0 || paidAmount > trip.revenue) {
          throw new BadRequestException('paidAmount must be between 0 and trip revenue');
        }

        const routeName = trip.route?.name
          ?? (
            await routeRepository.findOne({ where: { uid: trip.routeUid } })
          )?.name
          ?? '';

        const existing = await invoiceRepository
          .createQueryBuilder('invoice')
          .innerJoin('invoice.trips', 'invoiceTrip')
          .where('invoice.customerUid = :customerUid', {
            customerUid: trip.customerUid,
          })
          .andWhere('invoiceTrip.routeUid = :routeUid', { routeUid: trip.routeUid })
          .andWhere('DATE(invoice.createdAt) = DATE(:creationDate)', {
            creationDate: new Date(),
          })
          .andWhere(
            'ABS((invoice.amount / NULLIF(invoice.quantity, 0)) - :invoiceAmount) < :epsilon',
            {
              invoiceAmount: trip.revenue,
              epsilon: 0.000001,
            },
          )
          .orderBy('invoice.createdAt', 'DESC')
          .getOne();

        if (data.paidAmount !== undefined) {
          trip.paidAmount = paidAmount;
        }

        if (existing) {
          trip.invoiceUid = existing.uid;
          await tripRepository.save(trip);
          await this.refreshInvoiceAggregates(invoiceRepository, tripRepository, existing.uid);

          const linkedInvoice = await invoiceRepository.findOne({
            where: { uid: existing.uid },
            relations: { customer: true, trips: true },
          });
          if (!linkedInvoice) {
            throw new NotFoundException('Failed to reload linked invoice');
          }
          return linkedInvoice.toDTO();
        }

        const payload = invoiceRepository.create({
          uid: data.id,
          invoiceNumber: `INV-${Date.now()}`,
          customerUid: trip.customerUid,
          amount: trip.revenue,
          subtotal: trip.subtotal ?? data.subtotal ?? 0,
          vatAmount: trip.vatAmount ?? data.vatAmount ?? 0,
          paidAmount,
          quantity: 1,
          paymentStatus: this.getPaymentStatus(trip.revenue, paidAmount),
          description: routeName,
          status: data.status ?? InvoiceStatus.DRAFT,
        });
        const createdInvoice = await invoiceRepository.save(payload);

        trip.invoiceUid = createdInvoice.uid;
        await tripRepository.save(trip);

        const savedInvoice = await invoiceRepository.findOne({
          where: { uid: createdInvoice.uid },
          relations: { customer: true, trips: true },
        });
        if (!savedInvoice) {
          throw new NotFoundException('Failed to load created invoice');
        }
        return savedInvoice.toDTO();
      });
    } catch (e) {
      Logger.error('Failed to generate invoice', e);
      throw e;
    }
  }

  async getAllInvoices(): Promise<InvoiceModel[]> {
    try {
      const entities = await this.repository.find({
        relations: { customer: true, trips: true },
      });
      return entities.map((e) => e.toDTO());
    } catch (e) {
      Logger.error('Failed to get invoices', e);
      throw e;
    }
  }

  async getInvoiceById(id: string): Promise<InvoiceModel> {
    try {
      const entity = await this.repository.findOne({
        where: { uid: id },
        relations: { customer: true, trips: true },
      });
      if (!entity) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get invoice by id', e);
      throw e;
    }
  }

  async getInvoiceByTripId(tripId: string): Promise<InvoiceModel> {
    try {
      const trip = await this.tripRepository.findOne({ where: { uid: tripId } });
      if (!trip?.invoiceUid) {
        throw new NotFoundException(`Invoice for trip ${tripId} not found`);
      }

      const entity = await this.repository.findOne({
        where: { uid: trip.invoiceUid },
        relations: { customer: true, trips: true },
      });
      if (!entity) {
        throw new NotFoundException(`Invoice for trip ${tripId} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get invoice by trip id', e);
      throw e;
    }
  }

  async updateInvoiceStatus(
    id: string,
    status: InvoiceStatus,
  ): Promise<InvoiceModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id } });
      if (!entity) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }
      entity.status = status;
      if (status === InvoiceStatus.ISSUED) {
        entity.issuedAt = new Date();
      }
      const updated = await this.repository.save(entity);
      return updated.toDTO();
    } catch (e) {
      Logger.error('Failed to update invoice status', e);
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

  private async refreshInvoiceAggregates(
    invoiceRepository: Repository<Invoice>,
    tripRepository: Repository<Trip>,
    invoiceUid: string,
  ): Promise<void> {
    const invoice = await invoiceRepository.findOne({ where: { uid: invoiceUid } });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceUid} not found`);
    }

    const trips = await tripRepository.find({
      where: { invoiceUid },
      relations: { route: true },
      order: { createdAt: 'ASC' },
    });
    if (trips.length === 0) {
      return;
    }

    invoice.amount = trips.reduce((sum, trip) => sum + Number(trip.revenue ?? 0), 0);
    invoice.subtotal = trips.reduce((sum, trip) => sum + Number(trip.subtotal ?? 0), 0);
    invoice.vatAmount = trips.reduce((sum, trip) => sum + Number(trip.vatAmount ?? 0), 0);
    invoice.paidAmount = trips.reduce((sum, trip) => sum + Number(trip.paidAmount ?? 0), 0);
    invoice.quantity = trips.length;
    invoice.description = Array.from(
      new Set(trips.map((trip) => trip.route?.name).filter(Boolean)),
    ).join(', ');
    invoice.paymentStatus = this.getPaymentStatus(invoice.amount, invoice.paidAmount);

    if (invoice.paymentStatus === InvoicePaymentStatus.FULL_PAID) {
      invoice.status = InvoiceStatus.PAID;
    } else if (invoice.status === InvoiceStatus.PAID) {
      invoice.status = InvoiceStatus.ISSUED;
    }

    await invoiceRepository.save(invoice);
  }
}
