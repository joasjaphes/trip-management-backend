import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';
import { IssuingBodyModel } from '../issuing-body/issuing-body.dto';

export interface PermitRegistrationModel extends BaseAppModel {
  name: string;
  issuingBodyId: string;
  issuingBody?: IssuingBodyModel; // This will hold the DTO of the related IssuingBody when eager loading is used
  isActive: boolean;
}

export class CreatePermitRegistrationDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Road License' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'issuing-body-uid-123' })
  issuingBodyId: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}
