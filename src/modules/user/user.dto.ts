import { ApiProperty } from '@nestjs/swagger';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import {
  passwordRegex,
  passwordRegexFailedMessage,
} from '../../shared/constants';

export interface UserModel extends BaseAppModel {
  firstName: string;
  surname: string;
  email: string | null;
  phoneNumber: string;
  username: string;
  password?: string;
  roles?: string[];
  roleName?: string;
  permissions?: string[];
  isActive?: boolean;
}

export class CreateUserDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'John',
    required: true,
  })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Doe',
    required: true,
  })
  surname: string;

  @ValidateIf((_, value) => !!value)
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '255712345678',
    required: true,
  })
  phoneNumber: string;

  
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '255712345678',
    required: false,
  })
  username: string;
  

  @IsString()
  @IsNotEmpty()
  @Matches(passwordRegex, {
    message: passwordRegexFailedMessage,
  })
  @ApiProperty({
    example: 'StrongPassword123!',
    required: true,
  })
  password: string;

  @ValidateIf((_, value) => !!value)
  @IsEmail(undefined, {
    message: 'Email must be a valid email address.',
  })
  @ApiProperty({
    example: 'user@example.com',
    required: false,
  })
  email?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({
    example: ['role-uid-123', 'role-uid-456'],
    required: false,
    description: 'Array of role UIDs to assign to the user',
  })
  roles?: string[];

  @IsOptional()
  @ApiProperty({
    example: true,
    required: false,
    default: true,
    description: 'Whether the user should be active upon creation',
  })
  isActive?: boolean;
}

export class UpdateUserDTO extends BaseCreateAppDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'John',
    required: true,
  })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Doe',
    required: true,
  })
  surname: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '255712345678',
    required: true,
  })
  phoneNumber: string;

  @ValidateIf((_, value) => !!value)
  @IsEmail()
  @ApiProperty({
    example: 'user@example.com',
    required: false,
  })
  email?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({
    example: ['role-uid-123', 'role-uid-456'],
    required: false,
    description: 'Array of role UIDs to assign to the user',
  })
  roles?: string[];

  @IsOptional()
  @ApiProperty({
    example: true,
    required: false,
    default: true,
    description: 'Whether the user should be active',
  })
  isActive?: boolean;
}

export class ResetPasswordDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'lskjdflskjl-123123-12312-asdasd',
    required: true,
  })
  referenceNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123456',
    required: true,
  })
  otp: string;

  @IsString()
  @IsNotEmpty()
  @Matches(passwordRegex, {
    message: passwordRegexFailedMessage,
  })
  @ApiProperty({
    example: 'StrongPassword123!',
    required: true,
  })
  password: string;
}

export class ChangePasswordDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'OldPassword123!',
    required: true,
  })
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @Matches(passwordRegex, {
    message: passwordRegexFailedMessage,
  })
  @ApiProperty({
    example: 'StrongPassword123!',
    required: true,
  })
  newPassword: string;
}
