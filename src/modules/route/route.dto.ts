import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface RouteModel extends BaseAppModel {
  name: string;
  mileage: number;
  startLocation?: string;
  endLocation?: string;
  estimatedDuration?: number;
  isVATZeroRated?: boolean;
  vatPercentage?: number;
  routeCurrency?: 'USD' | 'TZS';
  isActive: boolean;
}

export class CreateRouteDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'DSM - Arusha' })
  name: string;

  @IsNumber()
  @ApiProperty({ example: 640 })
  mileage: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Dar es Salaam', required: false })
  startLocation?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Arusha', required: false })
  endLocation?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 10, required: false })
  estimatedDuration?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isVATZeroRated?: boolean;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 18, required: false })
  vatPercentage?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'USD', required: false })
  routeCurrency?: 'USD' | 'TZS';
}
