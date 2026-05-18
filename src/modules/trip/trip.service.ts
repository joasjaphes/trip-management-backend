import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Trip } from './trip.entity';
import {
  CreateTripDTO,
  TripModel,
  TripStatus,
  TripSummaryQueryDTO,
  TripSummaryStats,
} from './trip.dto';
import { Vehicle } from '../vehicle/vehicle.entity';
import { Driver } from '../driver/driver.entity';
import { Route } from '../route/route.entity';
import { CargoType } from '../cargo-type/cargo-type.entity';
import { Customer } from '../customer/customer.entity';
import { OffloadingPlace } from '../offloading-place/offloading-place.entity';
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
    @InjectRepository(OffloadingPlace)
    private offloadingPlaceRepository: Repository<OffloadingPlace>,
  ) { }

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

        const revenue = Number(data.revenue);
        const income = Number(data.income);
        const ratePerUnit = data.ratePerUnit !== undefined ? Number(data.ratePerUnit) : undefined;
        const loadedQuantity = data.loadedQuantity !== undefined ? Number(data.loadedQuantity) : undefined;
        const offloadedQuantity = data.offloadedQuantity !== undefined ? Number(data.offloadedQuantity) : undefined;
        const lossQuantity = data.lossQuantity !== undefined ? Number(data.lossQuantity) : undefined;
        const allowableLoss = data.allowableLoss !== undefined ? Number(data.allowableLoss) : undefined;
        const exchangeRate = data.exchangeRate !== undefined ? Number(data.exchangeRate) : 1;
        const equivalentAmount = revenue * exchangeRate;
        const cargoQuantity =
          data.cargoQuantity !== undefined ? Number(data.cargoQuantity) : undefined;

        // Calculate loss based on quantities and rate
        let adjustedRevenue = revenue;
        if (ratePerUnit !== undefined && loadedQuantity !== undefined && offloadedQuantity !== undefined && allowableLoss !== undefined) {
          const loss = ratePerUnit * ((offloadedQuantity - loadedQuantity) + allowableLoss) / 1000;
          // Apply loss to revenue if loss is negative (actual loss reduces revenue)
          if (loss < 0) {
            adjustedRevenue = revenue + loss; // Adding negative loss reduces revenue
          }
        }

        let vatAmount = 0;
        let subtotal = adjustedRevenue;
        if (!route.isVATZeroRated) {
          const vatPercentage = Number(route.vatPercentage) ?? 18;
          const vatFactor = 1 + (vatPercentage / 100);
          subtotal = adjustedRevenue / Number(vatFactor);
          vatAmount = adjustedRevenue - subtotal;
        }

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

        const paidAmount = data.paidAmount !== undefined ? Number(data.paidAmount) : 0;
        if (paidAmount < 0 || paidAmount > revenue) {
          throw new BadRequestException('paidAmount must be between 0 and revenue');
        }

        const tripReferenceNumber = `TRP-${Date.now()}`;

        let offloadingPlaceUid: string | undefined;
        if (data.offloadingPlaceName) {
          let offloadingPlace = await manager.getRepository(OffloadingPlace).findOne({
            where: { name: data.offloadingPlaceName },
          });
          if (!offloadingPlace) {
            offloadingPlace = manager.getRepository(OffloadingPlace).create({
              uid: randomUUID(),
              name: data.offloadingPlaceName,
            });
            offloadingPlace = await manager.getRepository(OffloadingPlace).save(offloadingPlace);
          }
          offloadingPlaceUid = offloadingPlace.uid;
        }


        const cargoType = await cargoTypeRepository.findOne({ where: { uid: data.cargoTypeId } });

        const payload = tripRepository.create({
          uid: data.id,
          tripReferenceNumber,
          tripDate: new Date(data.tripDate),
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          vehicleUid: data.vehicleId,
          trailerUid: data.trailerId,
          docNumber: data.docNumber,
          cargoQuantity,
          loadedQuantity,
          offloadedQuantity,
          lossQuantity,
          ratePerUnit,
          allowableLoss: data.allowableLoss ? (allowableLoss) : Number(cargoType?.allowableLoss) ?? 0,
          driverUid: data.driverId,
          routeUid: data.routeId,
          cargoTypeUid: data.cargoTypeId,
          revenue: adjustedRevenue,
          paidAmount,
          subtotal,
          vatAmount,
          income,
          exchangeRate,
          equivalentAmount: adjustedRevenue * exchangeRate,
          status: data.status,
          notes: data.notes,
          tripDocument: data.tripDocument,
          completionDocument: data.completionDocument,
          customerUid: customer.uid,
          offloadingPlaceUid,
        });
        const saved = await tripRepository.save(payload);


        const matchingInvoice = await this.findMatchingInvoiceForTrip(
          customer.uid,
          cargoType?.unitOfMeasure,
        );

        if (matchingInvoice) {
          saved.invoiceUid = matchingInvoice.uid;
          await tripRepository.save(saved);
          await this.refreshInvoiceAggregates(
            tripRepository,
            invoiceRepository,
            matchingInvoice,
          );
        } else {
          const invoice = invoiceRepository.create({
            uid: randomUUID(),
            invoiceNumber: `INV-${Date.now()}`,
            customerUid: customer.uid,
            amount: saved.revenue,
            exchangeRate: saved.exchangeRate,
            equivalentAmount: saved.equivalentAmount,
            paidAmount,
            subtotal,
            vatAmount,
            quantity: 1,
            currency: route.routeCurrency ?? 'TZS',
            paymentStatus:
              paidAmount <= 0
                ? InvoicePaymentStatus.UNPAID
                : paidAmount >= saved.revenue
                  ? InvoicePaymentStatus.FULL_PAID
                  : InvoicePaymentStatus.PARTIALLY_PAID,
            description: route.name,
            status: InvoiceStatus.DRAFT,
          });
          const createdInvoice = await invoiceRepository.save(invoice);
          saved.invoiceUid = createdInvoice.uid;
          await tripRepository.save(saved);
        }

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

        const { vehicle, driver, route, cargoType } = await this.validateReferences(data, {
          vehicleRepository,
          driverRepository,
          routeRepository,
          cargoTypeRepository,
        });

        let trailer: Vehicle | undefined;
        if (data.trailerId !== undefined) {
          trailer = (await vehicleRepository.findOne({ where: { uid: data.trailerId } })) ?? undefined;
          if (!trailer) {
            throw new BadRequestException(`Trailer with ID ${data.trailerId} not found`);
          }
        }

        let customer: Customer | undefined;
        let offloadingPlace: OffloadingPlace | undefined;

        if (data.offloadingPlaceName) {
          offloadingPlace = (await manager.getRepository(OffloadingPlace).findOne({
            where: { name: data.offloadingPlaceName },
          })) ?? undefined;
          if (!offloadingPlace) {
            offloadingPlace = manager.getRepository(OffloadingPlace).create({
              uid: randomUUID(),
              name: data.offloadingPlaceName,

            });
            offloadingPlace = await manager.getRepository(OffloadingPlace).save(offloadingPlace);
          }

          entity.offloadingPlaceUid = offloadingPlace.uid;
        }

        if (data.customerTIN) {
          customer = (await customerRepository.findOne({
            where: { tin: data.customerTIN },
          })) ?? undefined;

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
        }

        const nextPaidAmount =
          data.paidAmount !== undefined
            ? Number(data.paidAmount)
            : Number(entity.paidAmount ?? 0);
        let nextRevenue =
          data.revenue !== undefined
            ? Number(data.revenue)
            : Number(entity.revenue ?? 0);
        const nextExchangeRate =
          data.exchangeRate !== undefined
            ? Number(data.exchangeRate)
            : Number(entity.exchangeRate ?? 1);

        // Calculate loss based on quantities and rate
        const nextRatePerUnit = data.ratePerUnit !== undefined ? Number(data.ratePerUnit) : Number(entity.ratePerUnit ?? 0);
        const nextLoadedQuantity = data.loadedQuantity !== undefined ? Number(data.loadedQuantity) : Number(entity.loadedQuantity ?? 0);
        const nextOffloadedQuantity = data.offloadedQuantity !== undefined ? Number(data.offloadedQuantity) : Number(entity.offloadedQuantity ?? 0);
        const nextAllowableLoss = data.allowableLoss !== undefined ? Number(data.allowableLoss) : Number(entity.allowableLoss ? entity.allowableLoss : entity?.cargoType?.allowableLoss ?? 0);

        const loss = nextOffloadedQuantity ?   (nextRatePerUnit * ((nextOffloadedQuantity - nextLoadedQuantity) + nextAllowableLoss) / 1000) : 0;

        // Apply loss to revenue if loss is negative (actual loss reduces revenue)
        if ( loss < 0) {
          nextRevenue = nextRevenue + loss; // Adding negative loss reduces revenue
        }

        if (nextPaidAmount < 0 || nextPaidAmount > nextRevenue) {
          throw new BadRequestException('paidAmount must be between 0 and revenue');
        }

        let nextVatAmount = Number(entity.vatAmount ?? 0);
        let nextSubtotal = Number(entity.subtotal ?? nextRevenue);
        if (route && !route.isVATZeroRated) {
          const vatPercentage = Number(route.vatPercentage) ?? 18;
          const vatFactor = 1 + vatPercentage / 100;
          nextSubtotal = nextRevenue / Number(vatFactor);
          nextVatAmount = nextRevenue - nextSubtotal;
        } else {
          nextSubtotal = nextRevenue;
          nextVatAmount = 0;
        }


        const oldCustomerUid = entity.customerUid;
        const newCustomerUid = customer?.uid ?? entity.customerUid;
        const customerChanged = oldCustomerUid !== newCustomerUid;

        entity.tripDate = data.tripDate ? new Date(data.tripDate) : entity.tripDate;
        entity.endDate = data.endDate ? new Date(data.endDate) : entity.endDate;
        entity.vehicleUid = data.vehicleId ?? entity.vehicleUid;
        entity.vehicle = vehicle;
        entity.trailerUid = data.trailerId ?? entity.trailerUid;
        entity.trailer = trailer ?? entity.trailer;
        entity.docNumber = data.docNumber ?? entity.docNumber;
        entity.driverUid = data.driverId ?? entity.driverUid;
        entity.driver = driver;
        entity.routeUid = data.routeId ?? entity.routeUid;
        entity.route = route;
        entity.cargoTypeUid = data.cargoTypeId ?? entity.cargoTypeUid;
        entity.cargoType = cargoType;
        entity.cargoQuantity =
          data.cargoQuantity !== undefined ? Number(data.cargoQuantity) : entity.cargoQuantity;
        entity.revenue = nextRevenue;
        entity.paidAmount = nextPaidAmount;
        entity.income = data.income !== undefined ? Number(data.income) : entity.income;
        entity.status = data.status ?? entity.status;
        entity.ratePerUnit = data.ratePerUnit !== undefined ? Number(data.ratePerUnit) : entity.ratePerUnit;
        entity.loadedQuantity = data.loadedQuantity !== undefined ? Number(data.loadedQuantity) : entity.loadedQuantity;
        entity.offloadedQuantity = data.offloadedQuantity !== undefined ? Number(data.offloadedQuantity) : entity.offloadedQuantity;
        entity.lossQuantity = data.lossQuantity !== undefined ? Number(data.lossQuantity) : entity.lossQuantity;
        entity.allowableLoss = data.allowableLoss !== undefined ? Number(data.allowableLoss) : entity.allowableLoss;
        entity.notes = data.notes ?? entity.notes;
        entity.tripDocument = data.tripDocument ?? entity.tripDocument;
        entity.completionDocument = data.completionDocument ?? entity.completionDocument;
        entity.exchangeRate = nextExchangeRate;
        entity.subtotal = nextSubtotal;
        entity.vatAmount = nextVatAmount;
        entity.equivalentAmount = entity.revenue * nextExchangeRate;
        entity.customerUid = customer?.uid ?? entity.customerUid;
        entity.customer = customer ?? entity.customer;
        entity.offloadingPlaceUid = offloadingPlace?.uid ?? entity.offloadingPlaceUid;
        entity.offloadingPlace = offloadingPlace ?? entity.offloadingPlace;
        const updated = await tripRepository.save(entity);

        // Handle invoice management when customer changes

        if (updated.invoiceUid) {
          const oldInvoice = await invoiceRepository.findOne({
            where: { uid: updated.invoiceUid },
          });
          if (oldInvoice && customerChanged) {
            // Get all trips linked to the old invoice
            const tripsInOldInvoice = await tripRepository.find({
              where: { invoiceUid: oldInvoice.uid },
            });

            if (tripsInOldInvoice.length > 1) {
              // Multiple trips in old invoice - need to move this trip to new invoice
     

              // Find or create invoice for new customer
              const matchingInvoice = await tripRepository
                .createQueryBuilder('trip')
                .leftJoinAndSelect('trip.invoice', 'invoice')
                .leftJoinAndSelect('trip.customer', 'customer')
                .where('customer.uid = :customerUid', { customerUid: newCustomerUid })
                .andWhere('trip.uid != :tripId', { tripId: updated.uid })
                .andWhere('trip.status = :status', { status: TripStatus.IN_PROGRESS })
                .andWhere('trip.invoiceUid IS NOT NULL')
                .andWhere('invoice.paymentStatus = :paymentStatus', { paymentStatus: InvoicePaymentStatus.UNPAID })
                .andWhere('invoice.status = :invoiceStatus', { invoiceStatus: InvoiceStatus.DRAFT })
                .orderBy('trip.createdAt', 'DESC')
                .getOne();
              let newInvoice: Invoice;
              if (matchingInvoice?.invoice) {
                // Use existing invoice for new customer
                newInvoice = matchingInvoice.invoice;
              } else {
                // Create new invoice for new customer
                newInvoice = invoiceRepository.create({
                  uid: randomUUID(),
                  invoiceNumber: `INV-${Date.now()}`,
                  customerUid: newCustomerUid,
                  amount: updated.revenue,
                  exchangeRate: updated.exchangeRate,
                  equivalentAmount: updated.equivalentAmount,
                  paidAmount: updated.paidAmount,
                  subtotal: updated.subtotal,
                  vatAmount: updated.vatAmount,
                  quantity: 1,
                  currency: route.routeCurrency ?? 'TZS',
                  paymentStatus:
                    updated.paidAmount <= 0
                      ? InvoicePaymentStatus.UNPAID
                      : updated.paidAmount >= updated.revenue
                        ? InvoicePaymentStatus.FULL_PAID
                        : InvoicePaymentStatus.PARTIALLY_PAID,
                  description: route.name,
                  status: InvoiceStatus.DRAFT,
                });
                newInvoice = await invoiceRepository.save(newInvoice);
              }

              // Attach trip to new invoice and refresh aggregates
              updated.invoiceUid = newInvoice.uid;
              updated.invoice = newInvoice;
              await tripRepository.save(updated);

              // Refresh old invoice aggregates (without this trip)
              await this.refreshInvoiceAggregates(
                tripRepository,
                invoiceRepository,
                oldInvoice,
              );
              await this.refreshInvoiceAggregates(
                tripRepository,
                invoiceRepository,
                newInvoice,
              );
            } else {
              const unitOfMeasure = cargoType?.unitOfMeasure ?? null;
              const matchingTripForCustomerAndUom = await tripRepository
                .createQueryBuilder('trip')
                .leftJoinAndSelect('trip.invoice', 'invoice')
                .leftJoinAndSelect('trip.customer', 'customer')
                .leftJoinAndSelect('trip.cargoType', 'tripCargoType')
                .where('customer.uid = :customerUid', { customerUid: newCustomerUid })
                .andWhere('trip.uid != :tripId', { tripId: updated.uid })
                .andWhere('trip.status = :status', { status: TripStatus.IN_PROGRESS })
                .andWhere('trip.invoiceUid IS NOT NULL')
                .andWhere('invoice.paymentStatus = :paymentStatus', {
                  paymentStatus: InvoicePaymentStatus.UNPAID,
                })
                  .andWhere('invoice.status = :invoiceStatus', {
                  invoiceStatus: InvoiceStatus.DRAFT,
                })
                .andWhere("COALESCE(tripCargoType.unitOfMeasure, '') = COALESCE(:unitOfMeasure, '')", {
                  unitOfMeasure,
                })
                .orderBy('trip.createdAt', 'DESC')
                .getOne();

              if (matchingTripForCustomerAndUom?.invoice) {
                // Move this trip to an existing unpaid invoice with matching unit of measure.
                updated.invoiceUid = matchingTripForCustomerAndUom.invoice.uid;
                updated.invoice = matchingTripForCustomerAndUom.invoice;
                await tripRepository.save(updated);
                await this.refreshInvoiceAggregates(
                  tripRepository,
                  invoiceRepository,
                  matchingTripForCustomerAndUom.invoice,
                );
                await invoiceRepository.delete(oldInvoice.id);
              } else {
                // Keep current behavior when no matching invoice exists.
                oldInvoice.customerUid = newCustomerUid!;
                await this.refreshInvoiceAggregates(
                  tripRepository,
                  invoiceRepository,
                  oldInvoice,
                );
              }
            }
          } else if (oldInvoice && !customerChanged) {
            // Customer didn't change, just refresh invoice aggregates
            await this.refreshInvoiceAggregates(
              tripRepository,
              invoiceRepository,
              oldInvoice,
            );
          }
        }

        const refreshed = await tripRepository.findOne({
          where: { uid: updated.uid },
          relations: {
            expenses: true,
            vehicle: true,
            driver: true,
            route: true,
            cargoType: true,
            customer: true,
            offloadingPlace: true,
            trailer: true,
          },
        });

        if (!refreshed) {
          throw new NotFoundException(`Trip with ID ${data.id} does not exist`);
        }

        return refreshed.toDTO({ eager: true });
      });
    } catch (e) {
      Logger.error('Failed to update trip', e);
      throw e;
    }
  }

  async updateTripActualPosition(
    tripId: string,
    tripActualPosition: string,
  ): Promise<TripModel> {
    try {
      const entity = await this.repository.findOne({
        where: { uid: tripId },
        relations: { expenses: true, customer: true, offloadingPlace: true, trailer: true, vehicle: true, driver: true, route: true, cargoType: true },
      });
      if (!entity) {
        throw new NotFoundException(`Trip with ID ${tripId} not found`);
      }

      entity.tripActualPosition = tripActualPosition;
      const updated = await this.repository.save(entity);
      return updated.toDTO({ eager: true });
    } catch (e) {
      Logger.error('Failed to update trip actual position', e);
      throw e;
    }
  }

  async getAllTrips(): Promise<TripModel[]> {
    try {
      const entities = await this.repository.find({ relations: { expenses: true, vehicle: true, driver: true, route: true, cargoType: true, customer: true, offloadingPlace: true, trailer: true } });
      return entities.map((entity) => entity.toDTO({ eager: true }));
    } catch (e) {
      Logger.error('Failed to get trips', e);
      throw e;
    }
  }

  async getInprogressTripsCount(): Promise<{ count: number }> {
    try {
      const count = await this.repository.count({ where: { status: TripStatus.IN_PROGRESS } });
      return { count };
    } catch (e) {
      Logger.error('Failed to get in-progress trips count', e);
      throw e;
    }
  }

  async getTripSummaryStats(query: TripSummaryQueryDTO): Promise<TripSummaryStats> {
    try {
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);

      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        throw new BadRequestException('startDate and endDate must be valid date strings');
      }

      if (startDate > endDate) {
        throw new BadRequestException('startDate cannot be later than endDate');
      }

      const tripsInRange = await this.repository
        .createQueryBuilder('trip')
        .where('trip.tripDate >= :startDate', { startDate })
        .andWhere('trip.tripDate <= :endDate', { endDate })
        .getMany();

      const totalTrips = tripsInRange.length;
      const totalRevenue = tripsInRange.reduce(
        (sum, trip) => sum + (Number(trip.revenue ?? 0) * Number(trip.exchangeRate ?? 1)),
        0,
      );
      const inProgressTrips = tripsInRange.filter(
        (trip) => trip.status === TripStatus.IN_PROGRESS,
      ).length;
      const completedTrips = tripsInRange.filter(
        (trip) => trip.status === TripStatus.COMPLETED,
      ).length;
      const overStayedTrips = tripsInRange.filter(
        (trip) => trip.isOverstayed && trip.status === TripStatus.IN_PROGRESS,
      ).length;
      const outstandingAmount = tripsInRange.reduce((sum, trip) => {
        const revenue = Number(trip.revenue ?? 0) * Number(trip.exchangeRate ?? 1);
        const paidAmount = Number(trip.paidAmount ?? 0) * Number(trip.exchangeRate ?? 1);
        return sum + Math.max(revenue - paidAmount, 0);
      }, 0);

      const recentTripsEntities = await this.repository.find({
        where: { status: TripStatus.IN_PROGRESS },
        relations: {
          expenses: true,
          vehicle: true,
          driver: true,
          route: true,
          cargoType: true,
          customer: true,
          offloadingPlace: true,
          trailer: true,
        },
        order: { tripDate: 'DESC' },
        take: 5,
      });

      return {
        totalRevenue,
        totalTrips,
        activeTrips: inProgressTrips,
        outstandingAmount,
        completedTrips,
        inProgressTrips: inProgressTrips - overStayedTrips,
        overStayedTrips,
        recentTrips: recentTripsEntities.map((trip) => trip.toDTO({ eager: true })),
      };
    } catch (e) {
      Logger.error('Failed to get trip summary stats', e);
      throw e;
    }
  }

  async getTripById(id: string): Promise<TripModel> {
    try {
      const entity = await this.repository.findOne({
        where: { uid: id },
        relations: { expenses: true, customer: true, offloadingPlace: true, trailer: true, vehicle: true, driver: true, route: true, cargoType: true },
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

  private async findMatchingInvoiceForTrip(
    customerUid: string,
    unitOfMeasure = 'Litres',
  ): Promise<Invoice | null> {
    const status = TripStatus.IN_PROGRESS;
    const paymentStatus = InvoicePaymentStatus.UNPAID;
    const matchedTrip = await this.repository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.invoice', 'invoice')
      .leftJoinAndSelect('trip.cargoType', 'cargoType')
      .where('trip.customerUid = :customerUid', { customerUid })
      .andWhere('trip.status = :status', { status })
      .andWhere('trip.invoiceUid IS NOT NULL')
      .andWhere('invoice.paymentStatus = :paymentStatus', { paymentStatus })
      .andWhere('invoice.status = :invoiceStatus', { invoiceStatus: InvoiceStatus.DRAFT })
      .andWhere('cargoType.unitOfMeasure = :unit', { unit: unitOfMeasure })
      .orderBy('trip.createdAt', 'DESC')
      .getOne();
    return matchedTrip?.invoice ?? null;
  }

  private async refreshInvoiceAggregates(
    tripRepository: Repository<Trip>,
    invoiceRepository: Repository<Invoice>,
    invoice: Invoice,
  ): Promise<void> {
    const linkedTrips = await tripRepository.find({
      where: { invoiceUid: invoice.uid },
      relations: { route: true },
      order: { createdAt: 'ASC' },
    });

    if (linkedTrips.length === 0) {
      return;
    }

    invoice.amount = linkedTrips.reduce(
      (sum, trip) => sum + Number(trip.revenue ?? 0),
      0,
    );
    invoice.subtotal = linkedTrips.reduce(
      (sum, trip) => sum + Number(trip.subtotal ?? 0),
      0,
    );
    invoice.vatAmount = linkedTrips.reduce(
      (sum, trip) => sum + Number(trip.vatAmount ?? 0),
      0,
    );
    invoice.paidAmount = linkedTrips.reduce(
      (sum, trip) => sum + Number(trip.paidAmount ?? 0),
      0,
    );
    // invoice.quantity = linkedTrips.length;

    invoice.exchangeRate = linkedTrips[0]?.exchangeRate;
    invoice.equivalentAmount = linkedTrips.reduce(
      (sum, trip) => sum + Number(trip.equivalentAmount ?? 0),
      0,
    );

    const routeNames = Array.from(
      new Set(linkedTrips.map((trip) => trip.route?.name).filter(Boolean)),
    ) as string[];
    invoice.description = routeNames.join(', ');

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
}
