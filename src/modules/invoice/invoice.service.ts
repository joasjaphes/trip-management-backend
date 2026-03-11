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
      const trip = await this.tripRepository.findOne({
        where: { uid: data.tripId },
        relations: { vehicle: true, driver: true, route: true, cargoType: true, customer: true },
      });
      if (!trip) {
        throw new BadRequestException(`Trip with ID ${data.tripId} not found`);
      }
      if (!trip.customerUid) {
        throw new BadRequestException(
          `Trip ${data.tripId} has no associated customer`,
        );
      }

      const existing = await this.repository.findOne({
        where: { tripUid: data.tripId },
      });
      if (existing) {
        throw new BadRequestException(
          `An invoice already exists for trip ${data.tripId}`,
        );
      }

      const invoiceNumber = `INV-${Date.now()}`;
      const paidAmount = data.paidAmount ?? 0;
      if (paidAmount < 0 || paidAmount > trip.revenue) {
        throw new BadRequestException('paidAmount must be between 0 and trip revenue');
      }

      const payload = this.repository.create({
        uid: data.id,
        invoiceNumber,
        tripUid: trip.uid,
        customerUid: trip.customerUid,
        amount: trip.revenue,
        paidAmount,
        paymentStatus: this.getPaymentStatus(trip.revenue, paidAmount),
        description: trip.route?.name,
        status: data.status ?? InvoiceStatus.DRAFT,
      });
      const saved = await this.repository.save(payload);
      return saved.toDTO();
    } catch (e) {
      Logger.error('Failed to generate invoice', e);
      throw e;
    }
  }

  async getAllInvoices(): Promise<InvoiceModel[]> {
    try {
      const entities = await this.repository.find({
        relations: { customer: true, trip: true },
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
        relations: { customer: true, trip: true },
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
      const entity = await this.repository.findOne({
        where: { tripUid: tripId },
        relations: { customer: true, trip: true },
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
}
