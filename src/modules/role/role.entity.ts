import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseAppEntity } from '../../shared/base-app-entity';
import { RoleModel } from './role.dto';
import { Permission } from '../permission/permission.entity';

@Entity('roles')
export class Role extends BaseAppEntity<RoleModel> {
  @Column({ nullable: false, length: 120, unique: true })
  name: string;

  @ManyToMany(() => Permission, { cascade: false, eager: true })
  @JoinTable({ name: 'role_permissions' })
  permissions: Permission[];

  toDTO(options?: { eager: boolean }): RoleModel {
    return {
      id: this.uid,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      name: this.name,
      permissions: this.permissions.map((p) => p.key),
      isActive: this.active,
      deleted: this.deleted,
      deletedAt: this.deletedAt?.toISOString(),
    } as RoleModel;
  }
}
