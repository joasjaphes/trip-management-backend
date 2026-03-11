import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface TripExpenseModel extends BaseAppModel {
  tripId: string;
  expenseId: string;
  expenseDescription?: string;
  amount: number;
  receiptAttachment?: string;
  date: string;
}

export class CreateTripExpenseDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'trip-uid-123' })
  tripId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'expense-uid-123' })
  expenseId: string;

  @IsNumber()
  @ApiProperty({ example: 150000 })
  amount: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '/uploads/receipt.jpg', required: false })
  receiptAttachment?: string;

  @IsDateString()
  @ApiProperty({ example: '2026-03-07T11:00:00.000Z' })
  date?: string;
}
