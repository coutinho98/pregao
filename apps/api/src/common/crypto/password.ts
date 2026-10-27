import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const SCHEME = 'scrypt';
const SALT_BYTES = 16;
const KEY_BYTES = 64;
// Used when the user does not exist, so login takes the same time either way.
const DUMMY_SALT = Buffer.alloc(SALT_BYTES);

interface StoredHash {
  salt: Buffer;
  key: Buffer;
}

function parseStoredHash(stored: string): StoredHash | null {
  const [scheme, salt, key] = stored.split('$');
  if (scheme !== SCHEME || !salt || !key) return null;
  return { salt: Buffer.from(salt, 'base64'), key: Buffer.from(key, 'base64') };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await scryptAsync(password, salt, KEY_BYTES);
  return [SCHEME, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  const parsed = stored ? parseStoredHash(stored) : null;
  const actual = await scryptAsync(password, parsed?.salt ?? DUMMY_SALT, KEY_BYTES);
  return parsed !== null && timingSafeEqual(actual, parsed.key);
}
