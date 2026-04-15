import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface CompanyProfileModel extends BaseAppModel {
  companyName: string;
  tin?: string;
  vrn?: string;
  country?: string;
  logo?:string;
  region?: string;
  district?: string;
  street?: string;
  plot?: string;
  postalAddress?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankBranch?: string;
  description?: string;
  isActive?: boolean;
}

export class CreateCompanyProfileDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Monit Africa Logistics Ltd' })
  companyName: string;

  @IsString()
  @ApiProperty({ example: '123456789' })
  tin?: string;

  @IsString()
  @ApiProperty({ example: '40-123456-A' })
  vrn?: string;

  @IsString()
  @ApiProperty({ example: 'Tanzania' })
  country?: string;

  @IsString()
  @ApiProperty({ example: 'Dar es Salaam' })
  region?: string;

  @IsString()
  @ApiProperty({ example: 'Ilala' })
  district?: string;

  @IsString()
  @ApiProperty({ example: 'Nyerere Road' })
  street?: string;

  @IsString()
  @ApiProperty({ example: 'Plot 42' })
  plot?: string;

  @IsString()
  @ApiProperty({ example: 'P.O. Box 12345' })
  postalAddress?: string;


  @IsString()
  @ApiProperty({ example: '/uploads/company-logo.png' })
  logo?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Head office profile for permits and invoicing documents',
    required: false,
  })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'NMB Bank', required: false })
  bankName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '1234567890', required: false })
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Monit Africa Logistics Ltd', required: false })
  bankAccountName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'NMB Branch', required: false })
  bankBranch?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}
