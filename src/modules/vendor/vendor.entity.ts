import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { VendorModel } from './vendor.dto';

@Entity('vendors')
export class Vendor extends BaseAppEntity<VendorModel> {
  @Column({ nullable: false, length: 120 })
  vendorName: string;

  @Column({ nullable: true, unique: true, length: 60 })
  vendorTIN?: string;

  @Column({ nullable: true, length: 60 })
  vendorContact?: string;

  @Column({ nullable: true, type: 'text' })
  vendorAddress?: string;

  toDTO(options?: { eager: boolean }): VendorModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      vendorName: this.vendorName,
      vendorTIN: this.vendorTIN,
      vendorContact: this.vendorContact,
      vendorAddress: this.vendorAddress,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}