import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehiclePermit } from './vehicle-permit.entity';
import {
  CreateVehiclePermitDTO,
  VehiclePermitModel,
} from './vehicle-permit.dto';
import { Vehicle } from '../vehicle/vehicle.entity';

@Injectable()
export class VehiclePermitService {
  constructor(
    @InjectRepository(VehiclePermit)
    private repository: Repository<VehiclePermit>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async createVehiclePermit(data: CreateVehiclePermitDTO): Promise<VehiclePermitModel> {
    try {
      const vehicle = await this.vehicleRepository.findOne({
        where: { uid: data.vehicleId },
      });
      if (!vehicle) {
        throw new BadRequestException(`Vehicle with ID ${data.vehicleId} not found`);
      }

      const payload = this.repository.create({
        uid: data.id,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        attachment: data.attachment,
        vehicleUid: vehicle.uid,
      });
      const saved = await this.repository.save(payload);
      return saved.toDTO();
    } catch (e) {
      Logger.error('Failed to create vehicle permit', e);
      throw e;
    }
  }

  async updateVehiclePermit(data: CreateVehiclePermitDTO): Promise<VehiclePermitModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: data.id } });
      if (!entity) {
        throw new NotFoundException(`Vehicle permit with ID ${data.id} does not exist`);
      }

      if (data.vehicleId && data.vehicleId !== entity.vehicleUid) {
        const vehicle = await this.vehicleRepository.findOne({
          where: { uid: data.vehicleId },
        });
        if (!vehicle) {
          throw new BadRequestException(`Vehicle with ID ${data.vehicleId} not found`);
        }
        entity.vehicleUid = vehicle.uid;
      }

      entity.description = data.description || entity.description;
      entity.startDate = data.startDate
        ? new Date(data.startDate)
        : entity.startDate;
      entity.endDate = data.endDate ? new Date(data.endDate) : entity.endDate;
      entity.attachment = data.attachment ?? entity.attachment;

      const updated = await this.repository.save(entity);
      return updated.toDTO();
    } catch (e) {
      Logger.error('Failed to update vehicle permit', e);
      throw e;
    }
  }

  async getAllVehiclePermits(): Promise<VehiclePermitModel[]> {
    try {
      const entities = await this.repository.find();
      return entities.map((entity) => entity.toDTO());
    } catch (e) {
      Logger.error('Failed to get vehicle permits', e);
      throw e;
    }
  }

  async getVehiclePermitById(id: string): Promise<VehiclePermitModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id } });
      if (!entity) {
        throw new NotFoundException(`Vehicle permit with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get vehicle permit by id', e);
      throw e;
    }
  }

  async deleteVehiclePermit(id: string): Promise<void> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id } });
      if (!entity) {
        throw new NotFoundException(`Vehicle permit with ID ${id} not found`);
      }
      await this.repository.remove(entity);
    } catch (e) {
      Logger.error('Failed to delete vehicle permit', e);
      throw e;
    }
  }
}
