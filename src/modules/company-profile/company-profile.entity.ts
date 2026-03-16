import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { CompanyProfileModel } from './company-profile.dto';

@Entity('company_profiles')
export class CompanyProfile extends BaseAppEntity<CompanyProfileModel> {
  @Column({ nullable: false, length: 180 })
  companyName: string;

  @Column({ nullable: true, unique: true, length: 50 })
  tin: string;

  @Column({ nullable: true, unique: true, length: 50 })
  vrn: string;

  @Column({ nullable: true, length: 120 })
  country: string;

  @Column({ nullable: true, length: 120 })
  region: string;

  @Column({ nullable: true, length: 120 })
  district: string;

  @Column({ nullable: true, length: 180 })
  street: string;

  @Column({ nullable: true, length: 100 })
  plot: string;

  @Column({ nullable: true, length: 120 })
  postalAddress: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ nullable: true, length: 255 })
  logo?: string;

  @Column({ default: true })
  isActive: boolean;

  toDTO(options?: { eager: boolean }): CompanyProfileModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      companyName: this.companyName,
      tin: this.tin,
      vrn: this.vrn,
      country: this.country,
      region: this.region,
      district: this.district,
      street: this.street,
      plot: this.plot,
      postalAddress: this.postalAddress,
      description: this.description,
      isActive: this.isActive,
      logo: this.logo,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
