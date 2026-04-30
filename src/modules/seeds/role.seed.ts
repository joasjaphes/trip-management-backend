import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../role/role.entity';
import { Permission } from '../permission/permission.entity';
import { makeId } from '../../shared/constants';

@Injectable()
export class RoleSeed {
  private readonly logger = new Logger(RoleSeed.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async run() {
    const defaultName = 'Admin';
    const permissionKey = 'ALL';

    const existingRole = await this.roleRepository.findOne({
      where: { name: defaultName },
      relations: ['permissions'],
    });

    if (existingRole) {
      this.logger.log(`Default role already exists: ${defaultName}`);
      return existingRole;
    }

    const permission = await this.permissionRepository.findOne({
      where: { key: permissionKey },
    });

    if (!permission) {
      throw new Error(`Required permission not found: ${permissionKey}`);
    }

    const role = this.roleRepository.create({
      uid: makeId(),
      name: defaultName,
      permissions: [permission],
    });

    await this.roleRepository.save(role);

    this.logger.log(`Default role created: ${defaultName}`);

    return role;
  }
}