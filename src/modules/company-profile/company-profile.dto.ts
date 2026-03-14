import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface CompanyProfileModel extends BaseAppModel {
  companyName: string;
  tin: string;
  vrn: string;
  country: string;
  region: string;
  district: string;
  street: string;
  plot: string;
  postalAddress: string;
  description?: string;
  isActive: boolean;
}

export class CreateCompanyProfileDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Monit Africa Logistics Ltd' })
  companyName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '123456789' })
  tin: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '40-123456-A' })
  vrn: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Tanzania' })
  country: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Dar es Salaam' })
  region: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Ilala' })
  district: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Nyerere Road' })
  street: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Plot 42' })
  plot: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'P.O. Box 12345' })
  postalAddress: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Head office profile for permits and invoicing documents',
    required: false,
  })
  description?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}
