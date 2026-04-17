import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { CargoTypeModel } from './cargo-type.dto';

@Entity('cargo_types')
export class CargoType extends BaseAppEntity<CargoTypeModel> {
  @Column({ nullable: false, length: 120 })
  name: string;

  @Column({ nullable: true, length: 20, default: 'Tons' })
  unitOfMeasure?: string;

  @Column({ default: true })
  isActive: boolean;


  toDTO(options?: { eager: boolean }): CargoTypeModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      name: this.name,
      unitOfMeasure: this.unitOfMeasure,
      isActive: this.isActive,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
