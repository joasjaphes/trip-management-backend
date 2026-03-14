import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IssuingBody } from './issuing-body.entity';
import { CreateIssuingBodyDTO, IssuingBodyModel } from './issuing-body.dto';

@Injectable()
export class IssuingBodyService {
  constructor(
    @InjectRepository(IssuingBody)
    private repository: Repository<IssuingBody>,
  ) {}

  async createIssuingBody(data: CreateIssuingBodyDTO): Promise<IssuingBodyModel> {
    try {
      const payload = this.repository.create({
        uid: data.id,
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true,
      });
      const saved = await this.repository.save(payload);
      return saved.toDTO();
    } catch (e) {
      Logger.error('Failed to create issuing body', e);
      throw e;
    }
  }

  async updateIssuingBody(data: CreateIssuingBodyDTO): Promise<IssuingBodyModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: data.id } });
      if (!entity) {
        throw new NotFoundException(`Issuing body with ID ${data.id} does not exist`);
      }

      entity.name = data.name || entity.name;
      entity.description = data.description ?? entity.description;
      if (data.isActive !== undefined) {
        entity.isActive = data.isActive;
      }

      const updated = await this.repository.save(entity);
      return updated.toDTO();
    } catch (e) {
      Logger.error('Failed to update issuing body', e);
      throw e;
    }
  }

  async getAllIssuingBodies(): Promise<IssuingBodyModel[]> {
    try {
      const entities = await this.repository.find();
      return entities.map((entity) => entity.toDTO());
    } catch (e) {
      Logger.error('Failed to get issuing bodies', e);
      throw e;
    }
  }

  async getIssuingBodyById(id: string): Promise<IssuingBodyModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id } });
      if (!entity) {
        throw new NotFoundException(`Issuing body with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get issuing body by id', e);
      throw e;
    }
  }
}
