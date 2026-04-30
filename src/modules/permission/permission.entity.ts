import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { PermissionModel } from './permission.dto';

@Entity('permissions')
export class Permission extends BaseAppEntity<PermissionModel> {
  @Column({ nullable: false, length: 120, unique: true })
  key: string;

  @Column({ nullable: true, length: 250 })
  description?: string;

  toDTO(): PermissionModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      key: this.key,
      description: this.description,
      active: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    } as PermissionModel;
  }
}
