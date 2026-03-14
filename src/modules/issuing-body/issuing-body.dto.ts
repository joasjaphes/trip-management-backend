import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface IssuingBodyModel extends BaseAppModel {
  name: string;
  description?: string;
  isActive: boolean;
}

export class CreateIssuingBodyDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Tanzania Revenue Authority' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Government authority responsible for permit issuance', required: false })
  description?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}
