import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDTO } from './role.dto';

@ApiTags('roles')
@Controller('roles')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Post()
  async create(@Body() dto: CreateRoleDTO) {
    return await this.roleService.createRole(dto);
  }

  @Put(':id')
  async update(@Body() dto: CreateRoleDTO) {
    return await this.roleService.updateRole(dto);
  }

  @Get()
  async list() {
    return await this.roleService.getAll();
  }
}
