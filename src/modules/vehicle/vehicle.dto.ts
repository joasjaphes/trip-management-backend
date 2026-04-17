import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';
import { VehiclePermitModel } from '../vehicle-permit/vehicle-permit.dto';

export enum VehicleType {
  TRUCK = 'TRUCK',
  TRAILER = 'TRAILER',
}

export interface VehicleModel extends BaseAppModel {
  registrationNo: string;
  model?: string;
  registrationYear?: number;
  tankCapacity?: number;
  type: VehicleType;
  mileagePerFullTank?: number;
  permits: VehiclePermitModel[];
  isActive: boolean;
}

export class CreateVehicleDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'T123 ABC' })
  registrationNo: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 2022, required: false })
  registrationYear?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 400, required: false })
  tankCapacity?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Toyota Camry', required: false })
  model?: string;

  @IsEnum(VehicleType)
  @ApiProperty({ enum: VehicleType, example: VehicleType.TRUCK })
  type: VehicleType;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 1200, required: false })
  mileagePerFullTank?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}
