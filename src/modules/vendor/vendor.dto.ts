import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface VendorModel extends BaseAppModel {
  vendorName: string;
  vendorTIN?: string;
  vendorContact?: string;
  vendorAddress?: string;
}

export class CreateVendorDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Petrol Station Ltd' })
  vendorName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'TIN-123456789', required: false })
  vendorTIN?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '+255700000000', required: false })
  vendorContact?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Dar es Salaam, Tanzania', required: false })
  vendorAddress?: string;
}