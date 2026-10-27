import type { ConfigService } from '@nestjs/config';
import { describe, expect, it } from 'vitest';
import type { Env } from '../config/env.js';
import { Pseudonyms } from './pseudonyms.js';

const withSecret = (secret: string) =>
  new Pseudonyms({ get: () => secret } as unknown as ConfigService<Env, true>);

describe('Pseudonyms', () => {
  const pseudonyms = withSecret('a'.repeat(32));

  it('formats a paddle number with 6 uppercase hex characters', () => {
    expect(pseudonyms.forLot('user-1', 'lot-1')).toMatch(/^Licitante #[0-9A-F]{6}$/);
  });

  it('is stable for the same user in the same lot', () => {
    expect(pseudonyms.forLot('user-1', 'lot-1')).toBe(pseudonyms.forLot('user-1', 'lot-1'));
  });

  it('changes across lots, so bidders cannot be tracked between lots', () => {
    expect(pseudonyms.forLot('user-1', 'lot-1')).not.toBe(pseudonyms.forLot('user-1', 'lot-2'));
  });

  it('depends on the server secret', () => {
    expect(withSecret('b'.repeat(32)).forLot('user-1', 'lot-1')).not.toBe(
      pseudonyms.forLot('user-1', 'lot-1'),
    );
  });
});
