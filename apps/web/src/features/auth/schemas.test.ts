import { Role } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './schemas';

describe('auth schemas', () => {
  it('normalizes the e-mail on login', () => {
    const parsed = loginSchema.parse({ email: '  Ana@Exemplo.com ', password: 'x' });
    expect(parsed.email).toBe('ana@exemplo.com');
  });

  it('accepts a valid registration', () => {
    const result = registerSchema.safeParse({
      name: 'Ana',
      email: 'ana@exemplo.com',
      password: 'segredo123',
      role: Role.BIDDER,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a short password and an unknown role', () => {
    const result = registerSchema.safeParse({
      name: 'Ana',
      email: 'ana@exemplo.com',
      password: '123',
      role: 'ADMIN',
    });
    const fields = result.error?.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(expect.arrayContaining(['password', 'role']));
  });
});
