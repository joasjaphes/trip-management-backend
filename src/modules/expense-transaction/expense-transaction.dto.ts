import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface ExpenseTransactionModel extends BaseAppModel {
  expenseId: string;
  vendorName: string;
  vendorTIN: string;
  transactionAmount: number;
}

export class CreateExpenseTransactionDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'expense-uid-123' })
  expenseId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Petrol Station Ltd' })
  vendorName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'TIN-123456789' })
  vendorTIN: string;

  @IsNumber()
  @Min(0.01)
  @ApiProperty({ example: 250000 })
  transactionAmount: number;
}