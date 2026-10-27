import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';

describe('password hashing', () => {
  it('verifies the original password', async () => {
    const stored = await hashPassword('correct horse');
    expect(await verifyPassword('correct horse', stored)).toBe(true);
  });

  it('rejects a different password', async () => {
    const stored = await hashPassword('correct horse');
    expect(await verifyPassword('wrong horse', stored)).toBe(false);
  });

  it('salts each hash', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'));
  });

  it('rejects when there is no stored hash', async () => {
    expect(await verifyPassword('anything', null)).toBe(false);
  });

  it('rejects a malformed stored hash', async () => {
    expect(await verifyPassword('anything', 'plain-text')).toBe(false);
  });
});
