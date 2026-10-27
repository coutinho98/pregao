import { createHash } from 'node:crypto';

export function sha256Hex(message: string): string {
  return createHash('sha256').update(message, 'utf8').digest('hex');
}
