import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ed from '@noble/ed25519';
import { Env } from '../config/env.js';

/** Ed25519 signatures over the canonical audit messages (UTF-8), hex encoded. */
@Injectable()
export class AuditSigner {
  private readonly secretKey: Uint8Array;

  constructor(config: ConfigService<Env, true>) {
    this.secretKey = Buffer.from(config.get('AUDIT_PRIVATE_KEY', { infer: true }), 'hex');
  }

  async sign(message: string): Promise<string> {
    const signature = await ed.signAsync(Buffer.from(message, 'utf8'), this.secretKey);
    return Buffer.from(signature).toString('hex');
  }

  async publicKeyHex(): Promise<string> {
    return Buffer.from(await ed.getPublicKeyAsync(this.secretKey)).toString('hex');
  }
}
