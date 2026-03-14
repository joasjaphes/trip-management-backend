import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreatePermitRegistrationDTO,
  PermitRegistrationModel,
} from './permit-registration.dto';
import { PermitRegistration } from './permit-registration.entity';
import { IssuingBody } from '../issuing-body/issuing-body.entity';

@Injectable()
export class PermitRegistrationService {
  constructor(
    @InjectRepository(PermitRegistration)
    private repository: Repository<PermitRegistration>,
    @InjectRepository(IssuingBody)
    private issuingBodyRepository: Repository<IssuingBody>,
  ) {}

  async createPermitRegistration(
    data: CreatePermitRegistrationDTO,
  ): Promise<PermitRegistrationModel> {
    try {
      const issuingBody = await this.issuingBodyRepository.findOne({
        where: { uid: data.issuingBodyId },
      });
      if (!issuingBody) {
        throw new BadRequestException(
          `Issuing body with ID ${data.issuingBodyId} not found`,
        );
      }

      const payload = this.repository.create({
        uid: data.id,
        name: data.name,
        issuingBodyUid: issuingBody.uid,
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

      if (data.issuingBodyId && data.issuingBodyId !== entity.issuingBodyUid) {
        const issuingBody = await this.issuingBodyRepository.findOne({
          where: { uid: data.issuingBodyId },
        });
        if (!issuingBody) {
          throw new BadRequestException(
            `Issuing body with ID ${data.issuingBodyId} not found`,
          );
        }
        entity.issuingBodyUid = issuingBody.uid;
      }

      entity.name = data.name || entity.name;
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
      const entities = await this.repository.find({relations: {issuingBody: true}});
      return entities.map((entity) => entity.toDTO({ eager: true }));
    } catch (e) {
      Logger.error('Failed to get permit registrations', e);
      throw e;
    }
  }

  async getPermitRegistrationById(id: string): Promise<PermitRegistrationModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id }, relations: ['issuingBody'] });
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
