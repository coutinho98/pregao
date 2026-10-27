import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorCode, Role } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { DomainError } from '../errors/domain-error.js';
import type { RequestUser } from './request-user.js';
import { RolesGuard } from './roles.guard.js';

function contextFor(allowed: Role[] | undefined, user?: RequestUser): ExecutionContext {
  const handler = () => undefined;
  if (allowed) Reflect.defineMetadata('roles', allowed, handler);
  return {
    getHandler: () => handler,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it('allows any authenticated user when no role is required', () => {
    expect(guard.canActivate(contextFor(undefined, { id: 'u1', role: Role.BIDDER }))).toBe(true);
  });

  it('allows a user with one of the required roles', () => {
    const context = contextFor([Role.AUCTIONEER], { id: 'u1', role: Role.AUCTIONEER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a user with another role with FORBIDDEN', () => {
    const context = contextFor([Role.AUCTIONEER], { id: 'u1', role: Role.BIDDER });
    expect(() => guard.canActivate(context)).toThrowError(
      expect.objectContaining({ code: ErrorCode.FORBIDDEN }) as DomainError,
    );
  });
});
