import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './trip.entity';
import { CreateTripDTO, TripModel } from './trip.dto';
import { Vehicle } from '../vehicle/vehicle.entity';
import { Driver } from '../driver/driver.entity';
import { Route } from '../route/route.entity';
import { CargoType } from '../cargo-type/cargo-type.entity';

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
      await this.validateReferences(data);

      const payload = this.repository.create({
        uid: data.id,
        tripDate: new Date(data.tripDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        vehicleUid: data.vehicleId,
        driverUid: data.driverId,
        routeUid: data.routeId,
        cargoTypeUid: data.cargoTypeId,
        revenue: data.revenue,
        income: data.income,
        status: data.status,
      });
      const saved = await this.repository.save(payload);
      return saved.toDTO();
    } catch (e) {
      Logger.error('Failed to create trip', e);
      throw e;
    }
  }

  async updateTrip(data: CreateTripDTO): Promise<TripModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: data.id } });
      if (!entity) {
        throw new NotFoundException(`Trip with ID ${data.id} does not exist`);
      }

      await this.validateReferences(data);

      entity.tripDate = data.tripDate ? new Date(data.tripDate) : entity.tripDate;
      entity.endDate = data.endDate ? new Date(data.endDate) : entity.endDate;
      entity.vehicleUid = data.vehicleId || entity.vehicleUid;
      entity.driverUid = data.driverId || entity.driverUid;
      entity.routeUid = data.routeId || entity.routeUid;
      entity.cargoTypeUid = data.cargoTypeId || entity.cargoTypeUid;
      entity.revenue = data.revenue ?? entity.revenue;
      entity.income = data.income ?? entity.income;
      entity.status = data.status || entity.status;

      const updated = await this.repository.save(entity);
      return updated.toDTO();
    } catch (e) {
      Logger.error('Failed to update trip', e);
      throw e;
    }
  }

  async getAllTrips(): Promise<TripModel[]> {
    try {
      const entities = await this.repository.find({ relations: { expenses: true } });
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
        relations: { expenses: true },
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

  private async validateReferences(data: CreateTripDTO): Promise<void> {
    const [vehicle, driver, route, cargoType] = await Promise.all([
      this.vehicleRepository.findOne({ where: { uid: data.vehicleId } }),
      this.driverRepository.findOne({ where: { uid: data.driverId } }),
      this.routeRepository.findOne({ where: { uid: data.routeId } }),
      this.cargoTypeRepository.findOne({ where: { uid: data.cargoTypeId } }),
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
  }
}
