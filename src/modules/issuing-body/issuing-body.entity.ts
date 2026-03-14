import { Column, Entity, OneToMany } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { IssuingBodyModel } from './issuing-body.dto';
import { PermitRegistration } from '../permit-registration/permit-registration.entity';

@Entity('issuing_bodies')
export class IssuingBody extends BaseAppEntity<IssuingBodyModel> {
  @Column({ nullable: false, length: 180, unique: true })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(
    () => PermitRegistration,
    (permitRegistration) => permitRegistration.issuingBody,
  )
  permitRegistrations: PermitRegistration[];

  toDTO(options?: { eager: boolean }): IssuingBodyModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      name: this.name,
      description: this.description,
      isActive: this.isActive,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
