import type { Role } from '@pregao/shared';
import type { Request } from 'express';

export interface RequestUser {
  id: string;
  role: Role;
}

export interface JwtPayload {
  sub: string;
  role: Role;
}

export type AuthenticatedRequest = Request & { user?: RequestUser };
