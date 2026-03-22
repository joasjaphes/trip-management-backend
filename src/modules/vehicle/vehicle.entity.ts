import { Column, Entity, OneToMany } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { VehicleModel } from './vehicle.dto';
import { VehiclePermit } from '../vehicle-permit/vehicle-permit.entity';
import { Trip } from '../trip/trip.entity';

@Entity('vehicles')
export class Vehicle extends BaseAppEntity<VehicleModel> {
  @Column({ nullable: false, length: 40, unique: true })
  registrationNo: string;

  @Column({ nullable: true, type: 'int' })
  registrationYear?: number;

  @Column({ type: 'float', nullable: false })
  tankCapacity: number;

  @Column({ type: 'float', nullable: false })
  mileagePerFullTank: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  model: string;

  @OneToMany(() => VehiclePermit, (permit) => permit.vehicle)
  permits: VehiclePermit[];

  @OneToMany(() => Trip, (trip) => trip.vehicle)
  trips: Trip[];

  toDTO(options?: { eager: boolean }): VehicleModel {
    const { eager = false } = options ?? {};

    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      registrationNo: this.registrationNo,
      registrationYear: this.registrationYear,
      tankCapacity: this.tankCapacity,
      mileagePerFullTank: this.mileagePerFullTank,
      model: this.model,
      permits: eager ? (this.permits ?? []).map((permit) => permit.toDTO()) : [],
      isActive: this.isActive,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
