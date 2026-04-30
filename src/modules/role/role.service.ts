import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { CreateRoleDTO, RoleModel } from './role.dto';
import { PermissionService } from '../permission/permission.service';
import { Permission } from '../permission/permission.entity';
import { makeId } from '../../shared/constants';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private repository: Repository<Role>,
    private permissionService: PermissionService,
  ) {}

  async createRole(dto: CreateRoleDTO): Promise<Role> {
    const role = this.repository.create();
    role.name = dto.name;
    role.uid = dto.id || makeId();

    // resolve permissions: create if not exists
    if (dto.permissions && dto.permissions.length > 0) {
      const perms: Permission[] = [];
      for (const key of dto.permissions) {
        const p = await this.permissionService.findOrCreateByKey(key);
        perms.push(p);
      }
      role.permissions = perms;
    }

    return await this.repository.save(role);
  }

  async updateRole(dto: CreateRoleDTO): Promise<Role> {
    if (!dto.id) {
      throw new Error('Role ID is required for update');
    }

    const role = await this.repository.findOne({
      where: { uid: dto.id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new Error('Role not found');
    }

    role.name = dto.name;

    // resolve permissions: create if not exists
    if (dto.permissions && dto.permissions.length > 0) {
      const perms: Permission[] = [];
      for (const key of dto.permissions) {
        const p = await this.permissionService.findOrCreateByKey(key);
        perms.push(p);
      }
      role.permissions = perms;
    } else {
      role.permissions = [];
    }

    return await this.repository.save(role);
  }

  async getAll(): Promise<RoleModel[]> {
    const roles = await this.repository.find({ relations: ['permissions'] });
    return roles.map((r) => r.toDTO({ eager: true }));
  }
}
