import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CargoType } from './cargo-type.entity';
import { CargoTypeModel, CreateCargoTypeDTO } from './cargo-type.dto';

@Injectable()
export class CargoTypeService {
  constructor(
    @InjectRepository(CargoType)
    private repository: Repository<CargoType>,
  ) {}

  async createCargoType(data: CreateCargoTypeDTO): Promise<CargoTypeModel> {
    try {
      const payload = this.repository.create({
        uid: data.id,
        name: data.name,
        isActive: data.isActive ?? true,
      });
      const saved = await this.repository.save(payload);
      return saved.toDTO();
    } catch (e) {
      Logger.error('Failed to create cargo type', e);
      throw e;
    }
  }

  async updateCargoType(data: CreateCargoTypeDTO): Promise<CargoTypeModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: data.id } });
      if (!entity) {
        throw new NotFoundException(`Cargo type with ID ${data.id} does not exist`);
      }

      entity.name = data.name || entity.name;
      if (data.isActive !== undefined) {
        entity.isActive = data.isActive;
      }

      const updated = await this.repository.save(entity);
      return updated.toDTO();
    } catch (e) {
      Logger.error('Failed to update cargo type', e);
      throw e;
    }
  }

  async getAllCargoTypes(): Promise<CargoTypeModel[]> {
    try {
      const entities = await this.repository.find();
      return entities.map((entity) => entity.toDTO());
    } catch (e) {
      Logger.error('Failed to get cargo types', e);
      throw e;
    }
  }

  async getCargoTypeById(id: string): Promise<CargoTypeModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id } });
      if (!entity) {
        throw new NotFoundException(`Cargo type with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get cargo type by id', e);
      throw e;
    }
  }
}
