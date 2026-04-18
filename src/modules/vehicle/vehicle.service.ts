import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { CreateVehicleDTO, VehicleModel } from './vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private repository: Repository<Vehicle>,
  ) {}

  async createVehicle(data: CreateVehicleDTO): Promise<VehicleModel> {
    try {
      const payload = this.repository.create({
        uid: data.id,
        registrationNo: data.registrationNo,
        model: data.model,
        type: data.type,
        trailerType: data.trailerType,
        trailerDimensions: data.trailerDimensions,
        trailerWeightLimits: data.trailerWeightLimits,
        trailerAxles: data.trailerAxles,
        trailerSuspension: data.trailerSuspension,
        registrationYear: data.registrationYear,
        tankCapacity: data.tankCapacity,
        mileagePerFullTank: data.mileagePerFullTank,
        isActive: data.isActive ?? true,
      });
      const saved = await this.repository.save(payload);
      return saved.toDTO();
    } catch (e) {
      Logger.error('Failed to create vehicle', e);
      throw e;
    }
  }

  async updateVehicle(data: CreateVehicleDTO): Promise<VehicleModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: data.id } });
      if (!entity) {
        throw new NotFoundException(`Vehicle with ID ${data.id} does not exist`);
      }

      entity.registrationNo = data.registrationNo || entity.registrationNo;
      entity.registrationYear = data.registrationYear ?? entity.registrationYear;
      entity.tankCapacity = data.tankCapacity ?? entity.tankCapacity;
      entity.mileagePerFullTank =
        data.mileagePerFullTank ?? entity.mileagePerFullTank;
      entity.model = data.model ?? entity.model;
      entity.type = data.type ?? entity.type;
      entity.trailerType = data.trailerType ?? entity.trailerType;
      entity.trailerDimensions =
        data.trailerDimensions ?? entity.trailerDimensions;
      entity.trailerWeightLimits =
        data.trailerWeightLimits ?? entity.trailerWeightLimits;
      entity.trailerAxles = data.trailerAxles ?? entity.trailerAxles;
      entity.trailerSuspension =
        data.trailerSuspension ?? entity.trailerSuspension;
      if (data.isActive !== undefined) {
        entity.isActive = data.isActive;
      }

      const updated = await this.repository.save(entity);
      return updated.toDTO();
    } catch (e) {
      Logger.error('Failed to update vehicle', e);
      throw e;
    }
  }

  async getAllVehicles(): Promise<VehicleModel[]> {
    try {
      const entities = await this.repository.find({ relations: { permits: true } });
      return entities.map((entity) => entity.toDTO({ eager: true }));
    } catch (e) {
      Logger.error('Failed to get vehicles', e);
      throw e;
    }
  }

  async getVehicleById(id: string): Promise<VehicleModel> {
    try {
      const entity = await this.repository.findOne({
        where: { uid: id },
        relations: { permits: true },
      });
      if (!entity) {
        throw new NotFoundException(`Vehicle with ID ${id} not found`);
      }
      return entity.toDTO({ eager: true });
    } catch (e) {
      Logger.error('Failed to get vehicle by id', e);
      throw e;
    }
  }
}
