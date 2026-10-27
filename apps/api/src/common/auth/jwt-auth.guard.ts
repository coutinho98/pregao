import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ErrorCode } from '@pregao/shared';
import { DomainError } from '../errors/domain-error.js';
import type { AuthenticatedRequest, JwtPayload } from './request-user.js';

export function extractBearerToken(header: string | undefined): string | null {
  const [scheme, token] = header?.split(' ') ?? [];
  return scheme === 'Bearer' && token ? token : null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request.headers.authorization);
    if (!token) throw new DomainError(ErrorCode.UNAUTHORIZED, 'Faça login para continuar.');

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      request.user = { id: payload.sub, role: payload.role };
      return true;
    } catch {
      throw new DomainError(ErrorCode.UNAUTHORIZED, 'Sua sessão expirou. Faça login novamente.');
    }
  }
}
