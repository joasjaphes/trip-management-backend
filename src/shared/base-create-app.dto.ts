import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { MaximumIdLength, MinimumIdLength } from './constants';

export abstract class BaseCreateAppDTO {
  @IsString()
  @Length(MinimumIdLength, MaximumIdLength, {
    message: 'Id must be 11 to 36 characters.',
  })
  @ApiProperty({
    example: 'abcDEFG1234',
  })
  @IsNotEmpty()
  id: string;
}
