import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface RoleModel extends BaseAppModel {
  name: string;
  permissions?: string[];
}

export class CreateRoleDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'admin' })
  name: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({ example: ['user.create', 'user.delete'], required: false })
  permissions?: string[];
}
