import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';
import { InvoiceModel } from '../invoice/invoice.dto';

export interface ReceiptModel extends BaseAppModel {
  invoiceId: string;
  invoice?: InvoiceModel;
  amount: number;
  paidAt: string;
  reference?: string;
  notes?: string;
  attachment?: string;
}

export class CreateReceiptDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'invoice-uid-123' })
  invoiceId: string;

  @IsNumber()
  @Min(0.01)
  @ApiProperty({ example: 100000 })
  amount: number;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2026-03-10T12:00:00.000Z', required: false })
  paidAt?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'M-PESA-TX-123', required: false })
  reference?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'First installment', required: false })
  notes?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '/uploads/receipt-123.jpg', required: false })
  attachment?: string;
}
