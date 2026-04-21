import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface ExpenseTransactionModel extends BaseAppModel {
  expenseId: string;
  vendorName?: string;
  vendorTIN?: string;
  transactionAmount: number;
  transactionDate: string;
  unitPrice: number;
  quantity: number;
  attachment?: string;
}

export class CreateExpenseTransactionDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'expense-uid-123' })
  expenseId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Petrol Station Ltd' })
  vendorName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'TIN-123456789' })
  vendorTIN?: string;

  @IsNumber()
  @Min(0.01)
  @ApiProperty({ example: 250000 })
  transactionAmount: number;

  @IsDateString()
  @ApiProperty({ example: '2026-04-21T09:30:00.000Z' })
  transactionDate: string;

  @IsNumber()
  @Min(0.01)
  @ApiProperty({ example: 2500 })
  unitPrice: number;

  @IsNumber()
  @Min(0.01)
  @ApiProperty({ example: 100 })
  quantity: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '/uploads/expense-transaction-123.jpg', required: false })
  attachment?: string;
}