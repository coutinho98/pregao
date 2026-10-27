import { ApiProperty } from '@nestjs/swagger';
import {
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  Role,
  ROLES,
} from '@pregao/shared';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsString, Length, MaxLength } from 'class-validator';
import { normalizeEmail, trim } from '../../../common/validation/transforms.js';

export class RegisterDto {
  @ApiProperty({ example: 'Ana Souza', maxLength: NAME_MAX_LENGTH })
  @Transform(trim)
  @IsString()
  @Length(2, NAME_MAX_LENGTH)
  name: string;

  @ApiProperty({ example: 'ana@exemplo.com' })
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ minLength: PASSWORD_MIN_LENGTH, maxLength: PASSWORD_MAX_LENGTH })
  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  password: string;

  @ApiProperty({ enum: ROLES, description: 'AUCTIONEER cria lotes; BIDDER deposita e dá lances.' })
  @IsIn(ROLES)
  role: Role;
}
