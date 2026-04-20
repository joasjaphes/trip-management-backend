import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';
import { TripExpenseModel } from '../trip-expense/trip-expense.dto';
import { DriverModel } from '../driver/driver.dto';
import { RouteModel } from '../route/route.dto';
import { VehicleModel } from '../vehicle/vehicle.dto';
import { CargoTypeModel } from '../cargo-type/cargo-type.dto';
import { CustomerModel } from '../customer/customer.dto';
import { OffloadingPlaceModel } from '../offloading-place/offloading-place.dto';

export enum TripStatus {
  PENDING = 'Pending payment',
  IN_PROGRESS = 'Inprogress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface TripModel extends BaseAppModel {
  tripReferenceNumber: string;
  tripDate: string;
  endDate?: string;
  vehicleId: string;
  trailerId?: string;
  driverId: string;
  driver?: DriverModel;
  route?: RouteModel;
  vehicle?: VehicleModel;
  trailer?: VehicleModel;
  cargoType?: CargoTypeModel;
  cargoQuantity?: number;
  docNumber?: string;
  tripDocument?: string;
  completionDocument?: string;
  routeId: string;
  cargoTypeId: string;
  customerId?: string;
  customer?: CustomerModel;
  offloadingPlaceId?: string;
  offloadingPlace?: OffloadingPlaceModel;
  offloadingPlaceName?: string;
  revenue: number;
  vatAmount?: number;
  subtotal?: number;
  paidAmount: number;
  income: number;
  expenses: TripExpenseModel[];
  status: TripStatus;
  notes?: string;
}

export class CreateTripDTO extends BaseCreateAppDTO {
  @IsDateString()
  @ApiProperty({ example: '2026-03-07T10:00:00.000Z' })
  tripDate: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2026-03-08T10:00:00.000Z', required: false })
  endDate?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'vehicle-uid-123' })
  vehicleId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'driver-uid-123' })
  driverId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'route-uid-123' })
  routeId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'cargo-type-uid-123' })
  cargoTypeId: string;

  @IsNumber()
  @ApiProperty({ example: 1500000 })
  revenue: number;



  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 0, required: false })
  vatAmount?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 0, required: false })
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 0, required: false })
  paidAmount?: number;

  @IsNumber()
  @ApiProperty({ example: 1200000 })
  income: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Acme Corporation', required: false })
  customerName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '123456789', required: false })
  customerTIN?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '+255700000000', required: false })
  customerPhone?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Dar es Salaam Port', required: false })
  offloadingPlaceName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'trailer-uid-123', required: false })
  trailerId?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'cargo-uid-123', required: false })
  cargoId?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ example: 1000, required: false })
  cargoQuantity?: number;

  @IsString() 
  @IsOptional()
  @ApiProperty({ example: 'DOC-12345', required: false })
  docNumber?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '/uploads/trip-documents/doc-12345.pdf', required: false })
  tripDocument?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '/uploads/trip-documents/completion-doc-12345.pdf', required: false })
  completionDocument?: string;


  @IsEnum(TripStatus)
  @ApiProperty({ enum: TripStatus, example: TripStatus.PENDING })
  status: TripStatus;
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Urgent delivery, handle with care', required: false })
  notes?: string;
}
