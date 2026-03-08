import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { CargoTypeModel } from './cargo-type.dto';

@Entity('cargo_types')
export class CargoType extends BaseAppEntity<CargoTypeModel> {
  @Column({ nullable: false, length: 120 })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  toDTO(options?: { eager: boolean }): CargoTypeModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      name: this.name,
      isActive: this.isActive,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
