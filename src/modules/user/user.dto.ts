import { ApiProperty } from '@nestjs/swagger';
import { BaseAppModel } from '../../shared/base-app-dto';
import { BaseCreateAppDTO } from '../../shared/base-create-app.dto';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
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

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '255712345678',
    required: true,
  })
  phoneNumber: string;

  /*
  @IsString()
  @IsEmpty()
  @ApiProperty({
    example: '255712345678',
    required: false,
  })
  username?: string;
  */

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

  @IsEmail()
  @IsOptional()
  @ApiProperty({
    example: 'user@example.com',
    required: false,
  })
  email?: string;
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
