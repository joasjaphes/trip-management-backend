import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface CustomerModel extends BaseAppModel {
  name: string;
  tin: string;
  phone?: string;
}

export class CreateCustomerDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Acme Corporation' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '123456789' })
  tin: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '+255700000000', required: false })
  phone?: string;
}
