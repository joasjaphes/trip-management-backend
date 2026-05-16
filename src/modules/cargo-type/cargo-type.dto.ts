import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface CargoTypeModel extends BaseAppModel {
  name: string;
  unitOfMeasure?: string;
  allowableLoss?: number;
  isActive: boolean;
}

export class CreateCargoTypeDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Perishable' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'kg', required: false })
  unitOfMeasure?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 5, required: false })
  allowableLoss?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}
