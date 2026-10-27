import * as ed from '@noble/ed25519';
import { describe, expect, it } from 'vitest';
import { browserCrypto } from './browser-crypto';

const secretKey = new Uint8Array(32).fill(3);
const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

describe('browserCrypto', () => {
  it('computes SHA-256 like the server', async () => {
    expect(await browserCrypto.sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('verifies a signature made with the matching key and rejects anything else', async () => {
    const message = 'HEAD|lot|1|abc';
    const signature = hex(await ed.signAsync(new TextEncoder().encode(message), secretKey));
    const publicKey = hex(await ed.getPublicKeyAsync(secretKey));

    expect(await browserCrypto.verify(signature, message, publicKey)).toBe(true);
    expect(await browserCrypto.verify(signature, 'HEAD|lot|2|abc', publicKey)).toBe(false);
    expect(await browserCrypto.verify('zz', message, publicKey)).toBe(false);
  });
});
