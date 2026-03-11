import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface PermitRegistrationModel extends BaseAppModel {
  name: string;
  authorizingBody: string;
  isActive: boolean;
}

export class CreatePermitRegistrationDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Road License' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Tanzania Revenue Authority' })
  authorizingBody: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}
