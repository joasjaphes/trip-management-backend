import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export enum ExpenseCategory {
  GENERAL = 'GENERAL',
  OTHER = 'OTHER',
}

export enum ExpenseType {
  TRIP = 'TRIP',
  OFFICE = 'OFFICE',
}

export interface ExpenseModel extends BaseAppModel {
  name: string;
  category: ExpenseCategory;
  parentId?: string;
  parent?: ExpenseModel;
  children?: ExpenseModel[];
  type: ExpenseType;
  description?: string;
  isActive: boolean;
}

export class CreateExpenseDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Fuel' })
  name: string;

  @IsEnum(ExpenseCategory)
  @ApiProperty({ enum: ExpenseCategory, example: ExpenseCategory.GENERAL })
  category: ExpenseCategory;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Fuel purchase at station', required: false })
  description?: string;

  @IsOptional()
  @IsEnum(ExpenseType)
  @ApiProperty({ enum: ExpenseType, example: ExpenseType.TRIP, required: false })
  type?: ExpenseType;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'parent-expense-uid-123', required: false })
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}
