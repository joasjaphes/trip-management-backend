import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface OffloadingPlaceModel extends BaseAppModel {
  name: string;
  latitude?: number;
  longitude?: number;
}

export class CreateOffloadingPlaceDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Dar es Salaam Port' })
  name: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: -6.819, required: false })
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 39.289, required: false })
  longitude?: number;
}