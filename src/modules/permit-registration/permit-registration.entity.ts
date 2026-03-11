import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { PermitRegistrationModel } from './permit-registration.dto';

@Entity('permit_registrations')
export class PermitRegistration extends BaseAppEntity<PermitRegistrationModel> {
  @Column({ nullable: false, length: 120 })
  name: string;

  @Column({ nullable: false, length: 180 })
  authorizingBody: string;

  @Column({ default: true })
  isActive: boolean;

  toDTO(options?: { eager: boolean }): PermitRegistrationModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      name: this.name,
      authorizingBody: this.authorizingBody,
      isActive: this.isActive,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
