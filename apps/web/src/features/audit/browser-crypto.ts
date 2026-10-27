import * as ed from '@noble/ed25519';
import type { AuditCrypto } from '@pregao/shared';

const utf8 = (text: string) => new TextEncoder().encode(text);

const toHex = (bytes: ArrayBuffer) =>
  Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');

const fromHex = (hex: string) =>
  Uint8Array.from(hex.match(/../g) ?? [], (pair) => Number.parseInt(pair, 16));

/** SHA-256 from WebCrypto and Ed25519 from @noble: the check runs entirely in the browser. */
export const browserCrypto: AuditCrypto = {
  sha256Hex: async (message) => toHex(await crypto.subtle.digest('SHA-256', utf8(message))),
  verify: async (signature, message, publicKey) => {
    try {
      return await ed.verifyAsync(fromHex(signature), utf8(message), fromHex(publicKey));
    } catch {
      // Malformed signature or key: as invalid as a wrong one.
      return false;
    }
  },
};
