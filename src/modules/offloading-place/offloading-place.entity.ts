import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { OffloadingPlaceModel } from './offloading-place.dto';

@Entity('offloading_places')
export class OffloadingPlace extends BaseAppEntity<OffloadingPlaceModel> {
  @Column({ nullable: false, length: 120, unique: true })
  name: string;

  @Column({ type: 'float', nullable: true })
  latitude?: number;

  @Column({ type: 'float', nullable: true })
  longitude?: number;

  toDTO(options?: { eager: boolean }): OffloadingPlaceModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      name: this.name,
      latitude: this.latitude,
      longitude: this.longitude,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}