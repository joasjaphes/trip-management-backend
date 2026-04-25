import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';
import { CustomerModel } from '../customer/customer.dto';
import { TripModel } from '../trip/trip.dto';

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum InvoicePaymentStatus {
  UNPAID = 'unpaid',
  PARTIALLY_PAID = 'partially_paid',
  FULL_PAID = 'full_paid',
}

export interface InvoiceModel extends BaseAppModel {
  invoiceNumber: string;
  tripIds: string[];
  tripReferenceNumber?:string;
  customerId: string;
  customer?: CustomerModel;
  trips?: TripModel[];
  trucks?: string;
  amount: number;
  subtotal: number;
  vatAmount?: number;
  paidAmount: number;
  paymentStatus: InvoicePaymentStatus;
  quantity: number;
  description?: string;
  currency?: 'USD' | 'TZS';
  status: InvoiceStatus;
  issuedAt?: string;
  rate?: number;
}

export class CreateInvoiceDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'trip-uid-123' })
  tripId: string;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  @ApiProperty({ enum: InvoiceStatus, example: InvoiceStatus.DRAFT, required: false })
  status?: InvoiceStatus;

  @IsOptional()
  @ApiProperty({ example: 0, required: false })
  paidAmount?: number;

  @IsOptional()
  @ApiProperty({ example: 0, required: false })
  subtotal?: number;

  @IsOptional()
  @ApiProperty({ example: 0, required: false })
  vatAmount?: number;
  
  @IsOptional()
  @ApiProperty({ example: 'USD', required: false })
  currency?: 'USD' | 'TZS';
}
