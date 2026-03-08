import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from './route.entity';
import { CreateRouteDTO, RouteModel } from './route.dto';

@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(Route)
    private repository: Repository<Route>,
  ) {}

  async createRoute(data: CreateRouteDTO): Promise<RouteModel> {
    try {
      const payload = this.repository.create({
        uid: data.id,
        name: data.name,
        mileage: data.mileage,
        startLocation: data.startLocation,
        endLocation: data.endLocation,
        estimatedDuration: data.estimatedDuration,
        isActive: data.isActive ?? true,
      });
      const saved = await this.repository.save(payload);
      return saved.toDTO();
    } catch (e) {
      Logger.error('Failed to create route', e);
      throw e;
    }
  }

  async updateRoute(data: CreateRouteDTO): Promise<RouteModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: data.id } });
      if (!entity) {
        throw new NotFoundException(`Route with ID ${data.id} does not exist`);
      }

      entity.name = data.name || entity.name;
      entity.mileage = data.mileage ?? entity.mileage;
      entity.startLocation = data.startLocation ?? entity.startLocation;
      entity.endLocation = data.endLocation ?? entity.endLocation;
      entity.estimatedDuration = data.estimatedDuration ?? entity.estimatedDuration;
      if (data.isActive !== undefined) {
        entity.isActive = data.isActive;
      }

      const updated = await this.repository.save(entity);
      return updated.toDTO();
    } catch (e) {
      Logger.error('Failed to update route', e);
      throw e;
    }
  }

  async getAllRoutes(): Promise<RouteModel[]> {
    try {
      const entities = await this.repository.find();
      return entities.map((entity) => entity.toDTO());
    } catch (e) {
      Logger.error('Failed to get routes', e);
      throw e;
    }
  }

  async getRouteById(id: string): Promise<RouteModel> {
    try {
      const entity = await this.repository.findOne({ where: { uid: id } });
      if (!entity) {
        throw new NotFoundException(`Route with ID ${id} not found`);
      }
      return entity.toDTO();
    } catch (e) {
      Logger.error('Failed to get route by id', e);
      throw e;
    }
  }
}
