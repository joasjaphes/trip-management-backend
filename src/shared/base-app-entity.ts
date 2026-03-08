import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseCreatedAndUpdatedEntity } from './base-created_updated_by';

export abstract class BaseAppEntity<T> extends BaseCreatedAndUpdatedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  uid: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  deleted: boolean;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;

  abstract toDTO(options?: { eager: boolean }): T;
}
