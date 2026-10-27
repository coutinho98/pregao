import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorCode, Role } from '@pregao/shared';
import { DomainError } from '../errors/domain-error.js';
import type { AuthenticatedRequest } from './request-user.js';

const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowed = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!allowed?.length) return true;

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (user && allowed.includes(user.role)) return true;
    throw new DomainError(ErrorCode.FORBIDDEN, 'Seu perfil não tem acesso a esta ação.');
  }
}
