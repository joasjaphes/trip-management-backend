import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { CustomerModel } from './customer.dto';

@Entity('customers')
export class Customer extends BaseAppEntity<CustomerModel> {
  @Column({ nullable: false, length: 120 })
  name: string;

  @Column({ nullable: false, unique: true, length: 50 })
  tin: string;

  @Column({ nullable: true, length: 30 })
  phone?: string;

  toDTO(options?: { eager: boolean }): CustomerModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      name: this.name,
      tin: this.tin,
      phone: this.phone,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
