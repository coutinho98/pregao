import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse, AuthUser, ErrorCode } from '@pregao/shared';
import type { User } from '../../generated/prisma/client.js';
import type { JwtPayload } from '../../common/auth/request-user.js';
import { hashPassword, verifyPassword } from '../../common/crypto/password.js';
import { DomainError } from '../../common/errors/domain-error.js';
import { isUniqueViolation } from '../../common/prisma/prisma-errors.js';
import { UsersRepository } from '../users/users.repository.js';
import { toAuthUser } from './auth.mapper.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly jwt: JwtService,
  ) {}

  async register({ name, email, password, role }: RegisterDto): Promise<AuthResponse> {
    const passwordHash = await hashPassword(password);
    try {
      const user = await this.users.createWithWallet({ name, email, passwordHash, role });
      return this.issueSession(user);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new DomainError(ErrorCode.EMAIL_TAKEN, 'Este e-mail já está cadastrado.');
      }
      throw error;
    }
  }

  async login({ email, password }: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findByEmail(email);
    const passwordMatches = await verifyPassword(password, user?.passwordHash ?? null);
    if (!user || !passwordMatches) {
      throw new DomainError(ErrorCode.INVALID_CREDENTIALS, 'E-mail ou senha incorretos.');
    }
    return this.issueSession(user);
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.users.findById(userId);
    if (!user) throw new DomainError(ErrorCode.UNAUTHORIZED, 'Faça login para continuar.');
    return toAuthUser(user);
  }

  private async issueSession(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    return { accessToken: await this.jwt.signAsync(payload), user: toAuthUser(user) };
  }
}
