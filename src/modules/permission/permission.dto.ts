import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface PermissionModel extends BaseAppModel {
  key: string;
  description?: string;
}

export class CreatePermissionDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'user.create' })
  key: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Allows creating users', required: false })
  description?: string;
}
