import { BaseEntity, JoinColumn, ManyToOne } from 'typeorm';

export abstract class BaseCreatedAndUpdatedEntity extends BaseEntity {
  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  createdBy: any;

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: any;

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'deletedBy' })
  deletedBy: any;
}
