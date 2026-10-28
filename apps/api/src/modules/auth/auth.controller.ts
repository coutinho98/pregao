import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthResponse, AuthUser, ErrorCode } from '@pregao/shared';
import { Auth, CurrentUser } from '../../common/auth/auth.decorators.js';
import { AuthThrottlerGuard } from '../../common/auth/auth-throttler.guard.js';
import type { RequestUser } from '../../common/auth/request-user.js';
import { ApiDomainErrors } from '../../common/openapi/api-domain-errors.decorator.js';
import { AuthService } from './auth.service.js';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @UseGuards(AuthThrottlerGuard)
  @ApiOperation({ summary: 'Cria uma conta (leiloeiro ou licitante) e a carteira do usuário' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiDomainErrors(ErrorCode.VALIDATION_FAILED, ErrorCode.EMAIL_TAKEN, ErrorCode.TOO_MANY_REQUESTS)
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.auth.register(dto);
  }

  @Post('login')
  @UseGuards(AuthThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica com e-mail e senha e devolve um JWT' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiDomainErrors(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.INVALID_CREDENTIALS,
    ErrorCode.TOO_MANY_REQUESTS,
  )
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.auth.login(dto);
  }

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'Dados do usuário autenticado' })
  @ApiOkResponse({ type: AuthUserDto })
  me(@CurrentUser() user: RequestUser): Promise<AuthUser> {
    return this.auth.me(user.id);
  }
}
