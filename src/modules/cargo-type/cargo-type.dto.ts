import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface CargoTypeModel extends BaseAppModel {
  name: string;
  isActive: boolean;
}

export class CreateCargoTypeDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Perishable' })
  name: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}
