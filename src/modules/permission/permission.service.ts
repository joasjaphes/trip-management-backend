import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';
import { makeId } from '../../shared/constants';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission) private repository: Repository<Permission>,
  ) {}

  async findByKey(key: string): Promise<Permission | null> {
    return await this.repository.findOne({ where: { key } });
  }

  async findOrCreateByKey(key: string, description?: string) {
    try {
      let permission = await this.findByKey(key);
      if (!permission) {
        permission = this.repository.create();
        permission.key = key;
        permission.uid = makeId();
        permission.description = description;
        permission = await this.repository.save(permission);
        Logger.log(`Created permission ${key}`);
      }
      return permission;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
