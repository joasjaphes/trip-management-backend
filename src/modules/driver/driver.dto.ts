import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';

export interface DriverModel extends BaseAppModel {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  licenseNumber: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  licenseClass: string;
  licenseFrontPagePhoto?: string;
  driverPhoto?: string;
  isActive: boolean;
}

export class CreateDriverDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Amina' })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Mollel' })
  lastName: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ example: 'amina@example.com', required: false })
  email?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '+255700000001' })
  phone: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Dar es Salaam', required: false })
  address?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '1990-02-01', required: false })
  dateOfBirth?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'DLN-12345' })
  licenseNumber: string;

  @IsDateString()
  @ApiProperty({ example: '2021-01-01' })
  licenseIssueDate: string;

  @IsDateString()
  @ApiProperty({ example: '2029-01-01' })
  licenseExpiryDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Class C' })
  licenseClass: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '/uploads/license-front.jpg', required: false })
  licenseFrontPagePhoto?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '/uploads/driver-photo.jpg', required: false })
  driverPhoto?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}
