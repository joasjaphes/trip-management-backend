import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OffloadingPlace } from './offloading-place.entity';
import {
  CreateOffloadingPlaceDTO,
  OffloadingPlaceModel,
} from './offloading-place.dto';

@Injectable()
export class OffloadingPlaceService {
  constructor(
    @InjectRepository(OffloadingPlace)
    private repository: Repository<OffloadingPlace>,
  ) {}

  async createOffloadingPlace(
    data: CreateOffloadingPlaceDTO,
  ): Promise<OffloadingPlaceModel> {
    try {
      const existing = await this.repository.findOne({
        where: { name: data.name },
      });
      if (existing) {
        throw new ConflictException(
          `Offloading place with name [${data.name}] already exists`,
        );
      }

      const payload = this.repository.create({
        uid: data.id,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
      });
      const saved = await this.repository.save(payload);
      return saved.toDTO();
    } catch (e) {
      if ((e as { code?: string }).code === '23505') {
        throw new ConflictException(
          `Offloading place with name [${data.name}] already exists`,
        );
      }
      Logger.error('Failed to create offloading place', e);
      throw e;
    }
  }

  async updateOffloadingPlace(
    data: CreateOffloadingPlaceDTO,
  ): Promise<OffloadingPlaceModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: data.id } });
      if (!entity) {
        throw new NotFoundException(
          `Offloading place with ID ${data.id} does not exist`,
        );
      }

      if (data.name && data.name !== entity.name) {
        const existing = await this.repository.findOne({
          where: { name: data.name },
        });
        if (existing && existing.uid !== entity.uid) {
          throw new ConflictException(
            `Offloading place with name [${data.name}] already exists`,
          );
        }
      }

      entity.name = data.name || entity.name;
      entity.latitude = data.latitude ?? entity.latitude;
      entity.longitude = data.longitude ?? entity.longitude;

      const updated = await this.repository.save(entity);
      return updated.toDTO();
    } catch (e) {
      if ((e as { code?: string }).code === '23505') {
        throw new ConflictException(
          `Offloading place with name [${data.name}] already exists`,
        );
      }
      Logger.error('Failed to update offloading place', e);
      throw e;
    }
  }

  async getAllOffloadingPlaces(): Promise<OffloadingPlaceModel[]> {
    try {
      const entities = await this.repository.find();
      return entities.map((entity) => entity.toDTO());
    } catch (e) {
      Logger.error('Failed to get offloading places', e);
      throw e;
    }
  }

  async getOffloadingPlaceById(id: string): Promise<OffloadingPlaceModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id } });
      if (!entity) {
        throw new NotFoundException(`Offloading place with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get offloading place by id', e);
      throw e;
    }
  }
}