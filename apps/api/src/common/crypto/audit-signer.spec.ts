import type { ConfigService } from '@nestjs/config';
import * as ed from '@noble/ed25519';
import { describe, expect, it } from 'vitest';
import type { Env } from '../config/env.js';
import { AuditSigner } from './audit-signer.js';

const config = { get: () => '11'.repeat(32) } as unknown as ConfigService<Env, true>;

describe('AuditSigner', () => {
  it('produces signatures that verify with the published public key', async () => {
    const signer = new AuditSigner(config);
    const message = 'HEAD|lot-1|0|abc';
    const signature = await signer.sign(message);
    const valid = await ed.verifyAsync(
      Buffer.from(signature, 'hex'),
      Buffer.from(message, 'utf8'),
      Buffer.from(await signer.publicKeyHex(), 'hex'),
    );
    expect(valid).toBe(true);
  });

  it('does not verify a different message', async () => {
    const signer = new AuditSigner(config);
    const signature = await signer.sign('HEAD|lot-1|0|abc');
    const valid = await ed.verifyAsync(
      Buffer.from(signature, 'hex'),
      Buffer.from('HEAD|lot-1|1|abc', 'utf8'),
      Buffer.from(await signer.publicKeyHex(), 'hex'),
    );
    expect(valid).toBe(false);
  });
});
