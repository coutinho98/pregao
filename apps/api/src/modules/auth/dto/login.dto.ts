import { ApiProperty } from '@nestjs/swagger';
import { PASSWORD_MAX_LENGTH } from '@pregao/shared';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';
import { normalizeEmail } from './transforms.js';

export class LoginDto {
  @ApiProperty({ example: 'ana@exemplo.com' })
  @Transform(normalizeEmail)
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;
}
