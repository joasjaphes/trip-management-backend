import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { PermitRegistrationModel } from './permit-registration.dto';
import { IssuingBody } from '../issuing-body/issuing-body.entity';

@Entity('permit_registrations')
export class PermitRegistration extends BaseAppEntity<PermitRegistrationModel> {
  @Column({ nullable: false, length: 120 })
  name: string;

  @Column({ nullable: true })
  issuingBodyUid: string;

  @ManyToOne(
    () => IssuingBody,
    (issuingBody) => issuingBody.permitRegistrations,
    { nullable: true },
  )
  @JoinColumn({ name: 'issuingBodyUid', referencedColumnName: 'uid' })
  issuingBody: IssuingBody;

  @Column({ default: true })
  isActive: boolean;

  toDTO(options?: { eager: boolean }): PermitRegistrationModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      name: this.name,
      issuingBodyId: this.issuingBodyUid,
      issuingBody: options?.eager && this.issuingBody ? this.issuingBody.toDTO({ eager: false }) : undefined,
      isActive: this.isActive,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    };
  }
}
