import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { DriverModel } from './driver.dto';

@Entity('drivers')
export class Driver extends BaseAppEntity<DriverModel> {
  @Column({ nullable: false, length: 80 })
  firstName: string;

  @Column({ nullable: false, length: 80 })
  lastName: string;

  @Column({ nullable: true, length: 120 })
  email?: string;

  @Column({ nullable: false, length: 30 })
  phone: string;

  @Column({ nullable: true, type: 'text' })
  address?: string;

  @Column({ nullable: true, type: 'date' })
  dateOfBirth?: Date;

  @Column({ nullable: false, length: 80 })
  licenseNumber: string;

  @Column({ nullable: false, type: 'date' })
  licenseIssueDate: Date;

  @Column({ nullable: false, type: 'date' })
  licenseExpiryDate: Date;

  @Column({ nullable: true, length: 80 })
  passportNumber?: string;

  @Column({ nullable: true, type: 'date' })
  passportExpiryDate?: Date;

  @Column({ nullable: false, length: 40 })
  licenseClass: string;

  @Column({ nullable: true, type: 'text' })
  licenseFrontPagePhoto?: string;

  @Column({ nullable: true, type: 'text' })
  driverPhoto?: string;

  @Column({ default: true })
  isActive: boolean;

  toDTO(options?: { eager: boolean }): DriverModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      address: this.address,
      dateOfBirth: this.dateOfBirth ? new Date(this.dateOfBirth)?.toISOString() : '',
      licenseNumber: this.licenseNumber,
      licenseIssueDate: new Date(this.licenseIssueDate).toISOString(),
      licenseExpiryDate: new Date(this.licenseExpiryDate).toISOString(),
      passportNumber: this.passportNumber,
      passportExpiryDate: this.passportExpiryDate ? new Date(this.passportExpiryDate)?.toISOString() : '',
      licenseClass: this.licenseClass,
      licenseFrontPagePhoto: this.licenseFrontPagePhoto,
      driverPhoto: this.driverPhoto,
      isActive: this.isActive,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
