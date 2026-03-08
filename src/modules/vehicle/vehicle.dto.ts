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
import { VehiclePermitModel } from '../vehicle-permit/vehicle-permit.dto';

export interface VehicleModel extends BaseAppModel {
  registrationNo: string;
  registrationYear?: number;
  tankCapacity: number;
  mileagePerFullTank: number;
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

  @IsNumber()
  @ApiProperty({ example: 400 })
  tankCapacity: number;

  @IsNumber()
  @ApiProperty({ example: 1200 })
  mileagePerFullTank: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}
