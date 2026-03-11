import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreatePermitRegistrationDTO,
  PermitRegistrationModel,
} from './permit-registration.dto';
import { PermitRegistration } from './permit-registration.entity';

@Injectable()
export class PermitRegistrationService {
  constructor(
    @InjectRepository(PermitRegistration)
    private repository: Repository<PermitRegistration>,
  ) {}

  async createPermitRegistration(
    data: CreatePermitRegistrationDTO,
  ): Promise<PermitRegistrationModel> {
    try {
      const payload = this.repository.create({
        uid: data.id,
        name: data.name,
        authorizingBody: data.authorizingBody,
        isActive: data.isActive ?? true,
      });
      const saved = await this.repository.save(payload);
      return saved.toDTO();
    } catch (e) {
      Logger.error('Failed to create permit registration', e);
      throw e;
    }
  }

  async updatePermitRegistration(
    data: CreatePermitRegistrationDTO,
  ): Promise<PermitRegistrationModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: data.id } });
      if (!entity) {
        throw new NotFoundException(
          `Permit registration with ID ${data.id} does not exist`,
        );
      }

      entity.name = data.name || entity.name;
      entity.authorizingBody = data.authorizingBody || entity.authorizingBody;
      if (data.isActive !== undefined) {
        entity.isActive = data.isActive;
      }

      const updated = await this.repository.save(entity);
      return updated.toDTO();
    } catch (e) {
      Logger.error('Failed to update permit registration', e);
      throw e;
    }
  }

  async getAllPermitRegistrations(): Promise<PermitRegistrationModel[]> {
    try {
      const entities = await this.repository.find();
      return entities.map((entity) => entity.toDTO());
    } catch (e) {
      Logger.error('Failed to get permit registrations', e);
      throw e;
    }
  }

  async getPermitRegistrationById(id: string): Promise<PermitRegistrationModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id } });
      if (!entity) {
        throw new NotFoundException(`Permit registration with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get permit registration by id', e);
      throw e;
    }
  }
}
