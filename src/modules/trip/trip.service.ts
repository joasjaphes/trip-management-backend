import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Trip } from './trip.entity';
import { CreateTripDTO, TripModel } from './trip.dto';
import { Vehicle } from '../vehicle/vehicle.entity';
import { Driver } from '../driver/driver.entity';
import { Route } from '../route/route.entity';
import { CargoType } from '../cargo-type/cargo-type.entity';
import { Customer } from '../customer/customer.entity';
import { Invoice } from '../invoice/invoice.entity';
import { InvoicePaymentStatus, InvoiceStatus } from '../invoice/invoice.dto';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip)
    private repository: Repository<Trip>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(CargoType)
    private cargoTypeRepository: Repository<CargoType>,
  ) {}

  async createTrip(data: CreateTripDTO): Promise<TripModel> {
    try {
      return await this.repository.manager.transaction(async (manager) => {
        const tripRepository = manager.getRepository(Trip);
        const customerRepository = manager.getRepository(Customer);
        const invoiceRepository = manager.getRepository(Invoice);
        const vehicleRepository = manager.getRepository(Vehicle);
        const driverRepository = manager.getRepository(Driver);
        const routeRepository = manager.getRepository(Route);
        const cargoTypeRepository = manager.getRepository(CargoType);

        const { route } = await this.validateReferences(data, {
          vehicleRepository,
          driverRepository,
          routeRepository,
          cargoTypeRepository,
        });

        let customer = await customerRepository.findOne({
          where: { tin: data.customerTIN },
        });

        if (!customer) {
          customer = customerRepository.create({
            uid: randomUUID(),
            name: data.customerName,
            tin: data.customerTIN,
            phone: data.customerPhone,
          });
          customer = await customerRepository.save(customer);
        }

        const paidAmount = data.paidAmount ?? 0;
        if (paidAmount < 0 || paidAmount > data.revenue) {
          throw new BadRequestException('paidAmount must be between 0 and revenue');
        }

        const tripReferenceNumber = `TRP-${Date.now()}`;

        const payload = tripRepository.create({
          uid: data.id,
          tripReferenceNumber,
          tripDate: new Date(data.tripDate),
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          vehicleUid: data.vehicleId,
          driverUid: data.driverId,
          routeUid: data.routeId,
          cargoTypeUid: data.cargoTypeId,
          revenue: data.revenue,
          paidAmount,
          income: data.income,
          status: data.status,
          customerUid: customer.uid,
        });
        const saved = await tripRepository.save(payload);

        const invoice = invoiceRepository.create({
          uid: randomUUID(),
          invoiceNumber: `INV-${Date.now()}`,
          tripUid: saved.uid,
          customerUid: customer.uid,
          amount: saved.revenue,
          paidAmount,
          paymentStatus:
            paidAmount <= 0
              ? InvoicePaymentStatus.UNPAID
              : paidAmount >= saved.revenue
                ? InvoicePaymentStatus.FULL_PAID
                : InvoicePaymentStatus.PARTIALLY_PAID,
          description: route.name,
          status: InvoiceStatus.DRAFT,
        });
        await invoiceRepository.save(invoice);

        return saved.toDTO();
      });
    } catch (e) {
      if ((e as { code?: string }).code === '23505') {
        throw new ConflictException('A record with the same unique value already exists');
      }
      Logger.error('Failed to create trip', e);
      throw e;
    }
  }

  async updateTrip(data: CreateTripDTO): Promise<TripModel> {
    try {
      return await this.repository.manager.transaction(async (manager) => {
        const tripRepository = manager.getRepository(Trip);
        const customerRepository = manager.getRepository(Customer);
        const invoiceRepository = manager.getRepository(Invoice);
        const vehicleRepository = manager.getRepository(Vehicle);
        const driverRepository = manager.getRepository(Driver);
        const routeRepository = manager.getRepository(Route);
        const cargoTypeRepository = manager.getRepository(CargoType);

        const entity = await tripRepository.findOne({ where: { uid: data.id } });
        if (!entity) {
          throw new NotFoundException(`Trip with ID ${data.id} does not exist`);
        }

        await this.validateReferences(data, {
          vehicleRepository,
          driverRepository,
          routeRepository,
          cargoTypeRepository,
        });

        let customerUid = entity.customerUid;
        if (data.customerTIN) {
          let customer = await customerRepository.findOne({
            where: { tin: data.customerTIN },
          });

          if (!customer) {
            if (!data.customerName) {
              throw new BadRequestException(
                'customerName is required when assigning a new customerTIN',
              );
            }
            customer = customerRepository.create({
              uid: randomUUID(),
              name: data.customerName,
              tin: data.customerTIN,
              phone: data.customerPhone,
            });
            customer = await customerRepository.save(customer);
          } else {
            let shouldUpdateCustomer = false;
            if (data.customerName && data.customerName !== customer.name) {
              customer.name = data.customerName;
              shouldUpdateCustomer = true;
            }
            if (
              data.customerPhone !== undefined &&
              data.customerPhone !== customer.phone
            ) {
              customer.phone = data.customerPhone;
              shouldUpdateCustomer = true;
            }
            if (shouldUpdateCustomer) {
              customer = await customerRepository.save(customer);
            }
          }

          customerUid = customer.uid;
        }

        const nextPaidAmount = data.paidAmount ?? entity.paidAmount;
        const nextRevenue = data.revenue ?? entity.revenue;
        if (nextPaidAmount < 0 || nextPaidAmount > nextRevenue) {
          throw new BadRequestException('paidAmount must be between 0 and revenue');
        }

        entity.tripDate = data.tripDate ? new Date(data.tripDate) : entity.tripDate;
        entity.endDate = data.endDate ? new Date(data.endDate) : entity.endDate;
        entity.vehicleUid = data.vehicleId || entity.vehicleUid;
        entity.driverUid = data.driverId || entity.driverUid;
        entity.routeUid = data.routeId || entity.routeUid;
        entity.cargoTypeUid = data.cargoTypeId || entity.cargoTypeUid;
        entity.revenue = nextRevenue;
        entity.paidAmount = nextPaidAmount;
        entity.income = data.income ?? entity.income;
        entity.status = data.status || entity.status;
        entity.customerUid = customerUid;

        const updated = await tripRepository.save(entity);

        const invoice = await invoiceRepository.findOne({ where: { tripUid: entity.uid } });
        if (invoice) {
          if (invoice.paidAmount > updated.revenue) {
            throw new BadRequestException(
              'Trip revenue cannot be lower than already paid invoice amount',
            );
          }

          invoice.customerUid = customerUid ?? invoice.customerUid;
          invoice.amount = updated.revenue;
          invoice.paymentStatus =
            invoice.paidAmount <= 0
              ? InvoicePaymentStatus.UNPAID
              : invoice.paidAmount >= invoice.amount
                ? InvoicePaymentStatus.FULL_PAID
                : InvoicePaymentStatus.PARTIALLY_PAID;

          if (invoice.paymentStatus === InvoicePaymentStatus.FULL_PAID) {
            invoice.status = InvoiceStatus.PAID;
          } else if (invoice.status === InvoiceStatus.PAID) {
            invoice.status = InvoiceStatus.ISSUED;
          }

          await invoiceRepository.save(invoice);
        }

        return updated.toDTO();
      });
    } catch (e) {
      Logger.error('Failed to update trip', e);
      throw e;
    }
  }

  async getAllTrips(): Promise<TripModel[]> {
    try {
      const entities = await this.repository.find({ relations: { expenses: true, vehicle: true, driver: true, route: true, cargoType: true, customer: true } });
      return entities.map((entity) => entity.toDTO({ eager: true }));
    } catch (e) {
      Logger.error('Failed to get trips', e);
      throw e;
    }
  }

  async getTripById(id: string): Promise<TripModel> {
    try {
      const entity = await this.repository.findOne({
        where: { uid: id },
        relations: { expenses: true, customer: true },
      });
      if (!entity) {
        throw new NotFoundException(`Trip with ID ${id} not found`);
      }
      return entity.toDTO({ eager: true });
    } catch (e) {
      Logger.error('Failed to get trip by id', e);
      throw e;
    }
  }

  private async validateReferences(
    data: CreateTripDTO,
    repositories?: {
      vehicleRepository: Repository<Vehicle>;
      driverRepository: Repository<Driver>;
      routeRepository: Repository<Route>;
      cargoTypeRepository: Repository<CargoType>;
    },
  ): Promise<{ vehicle: Vehicle; driver: Driver; route: Route; cargoType: CargoType }> {
    const vehicleRepository = repositories?.vehicleRepository ?? this.vehicleRepository;
    const driverRepository = repositories?.driverRepository ?? this.driverRepository;
    const routeRepository = repositories?.routeRepository ?? this.routeRepository;
    const cargoTypeRepository = repositories?.cargoTypeRepository ?? this.cargoTypeRepository;

    const [vehicle, driver, route, cargoType] = await Promise.all([
      vehicleRepository.findOne({ where: { uid: data.vehicleId } }),
      driverRepository.findOne({ where: { uid: data.driverId } }),
      routeRepository.findOne({ where: { uid: data.routeId } }),
      cargoTypeRepository.findOne({ where: { uid: data.cargoTypeId } }),
    ]);

    if (!vehicle) {
      throw new BadRequestException(`Vehicle with ID ${data.vehicleId} not found`);
    }
    if (!driver) {
      throw new BadRequestException(`Driver with ID ${data.driverId} not found`);
    }
    if (!route) {
      throw new BadRequestException(`Route with ID ${data.routeId} not found`);
    }
    if (!cargoType) {
      throw new BadRequestException(
        `Cargo type with ID ${data.cargoTypeId} not found`,
      );
    }
    return { vehicle, driver, route, cargoType };
  }
}
