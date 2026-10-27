import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';
import { Env } from '../config/env.js';

/**
 * The paddle number a bidder holds in one lot: stable within the lot, different across
 * lots, and impossible to link back to the user without the server secret.
 */
@Injectable()
export class Pseudonyms {
  private readonly secret: string;

  constructor(config: ConfigService<Env, true>) {
    this.secret = config.get('PSEUDONYM_SECRET', { infer: true });
  }

  forLot(userId: string, lotId: string): string {
    const digest = createHmac('sha256', this.secret).update(`${userId}|${lotId}`).digest('hex');
    return `Licitante #${digest.slice(0, 6).toUpperCase()}`;
  }
}
