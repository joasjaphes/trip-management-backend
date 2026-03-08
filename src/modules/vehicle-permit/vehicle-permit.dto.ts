import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface VehiclePermitModel extends BaseAppModel {
  description: string;
  startDate: string;
  endDate: string;
  attachment?: string;
  vehicleId: string;
}

export class CreateVehiclePermitDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Road license' })
  description: string;

  @IsDateString()
  @ApiProperty({ example: '2025-01-01' })
  startDate: string;

  @IsDateString()
  @ApiProperty({ example: '2025-12-31' })
  endDate: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '/uploads/permit.pdf', required: false })
  attachment?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'vehicle-uid-123' })
  vehicleId: string;
}
