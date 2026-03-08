import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { VehiclePermitModel } from './vehicle-permit.dto';
import { Vehicle } from '../vehicle/vehicle.entity';

@Entity('vehicle_permits')
export class VehiclePermit extends BaseAppEntity<VehiclePermitModel> {
  @Column({ nullable: false, length: 180 })
  description: string;

  @Column({ type: 'date', nullable: false })
  startDate: Date;

  @Column({ type: 'date', nullable: false })
  endDate: Date;

  @Column({ nullable: true, type: 'text' })
  attachment?: string;

  @Column({ nullable: false })
  vehicleUid: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.permits, { nullable: false })
  @JoinColumn({ name: 'vehicleUid', referencedColumnName: 'uid' })
  vehicle: Vehicle;

  toDTO(options?: { eager: boolean }): VehiclePermitModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      description: this.description,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      attachment: this.attachment,
      vehicleId: this.vehicleUid,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
