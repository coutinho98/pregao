import { ApiProperty } from '@nestjs/swagger';
import { AuthResponse, AuthUser, Role, ROLES } from '@pregao/shared';

export class AuthUserDto implements AuthUser {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Ana Souza' })
  name: string;

  @ApiProperty({ example: 'ana@exemplo.com' })
  email: string;

  @ApiProperty({ enum: ROLES })
  role: Role;
}

export class AuthResponseDto implements AuthResponse {
  @ApiProperty({ description: 'JWT para o header Authorization: Bearer <token>.' })
  accessToken: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
