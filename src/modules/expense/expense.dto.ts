import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export enum ExpenseCategory {
  GENERAL = 'GENERAL',
  OTHER = 'OTHER',
}

export interface ExpenseModel extends BaseAppModel {
  name: string;
  category: ExpenseCategory;
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
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}
