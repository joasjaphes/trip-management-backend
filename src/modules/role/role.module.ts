import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleController } from './role.controller';
import { Role } from './role.entity';
import { RoleService } from './role.service';
import { Permission } from '../permission/permission.entity';
import { PermissionService } from '../permission/permission.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [RoleController],
  providers: [RoleService, PermissionService],
  exports: [RoleService, PermissionService],
})
export class RoleModule {}
