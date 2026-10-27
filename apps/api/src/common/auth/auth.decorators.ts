import { applyDecorators, createParamDecorator, ExecutionContext, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ErrorCode, Role } from '@pregao/shared';
import { ApiDomainErrors } from '../openapi/api-domain-errors.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { AuthenticatedRequest, RequestUser } from './request-user.js';
import { Roles, RolesGuard } from './roles.guard.js';

/** Requires a valid Bearer token and, when roles are given, one of those roles. */
export function Auth(...roles: Role[]) {
  const errors = roles.length
    ? [ErrorCode.UNAUTHORIZED, ErrorCode.FORBIDDEN]
    : [ErrorCode.UNAUTHORIZED];
  return applyDecorators(
    Roles(...roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiDomainErrors(...errors),
  );
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestUser | undefined =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
