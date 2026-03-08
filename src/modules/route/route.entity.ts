import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { RouteModel } from './route.dto';

@Entity('routes')
export class Route extends BaseAppEntity<RouteModel> {
  @Column({ nullable: false, length: 120 })
  name: string;

  @Column({ type: 'float', nullable: false })
  mileage: number;

  @Column({ nullable: true, length: 120 })
  startLocation?: string;

  @Column({ nullable: true, length: 120 })
  endLocation?: string;

  @Column({ type: 'float', nullable: true })
  estimatedDuration?: number;

  @Column({ default: true })
  isActive: boolean;

  toDTO(options?: { eager: boolean }): RouteModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      name: this.name,
      mileage: this.mileage,
      startLocation: this.startLocation,
      endLocation: this.endLocation,
      estimatedDuration: this.estimatedDuration,
      isActive: this.isActive,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
