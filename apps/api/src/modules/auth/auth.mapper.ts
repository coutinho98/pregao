import type { AuthUser } from '@pregao/shared';
import type { User } from '../../generated/prisma/client.js';

export function toAuthUser(user: User): AuthUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
