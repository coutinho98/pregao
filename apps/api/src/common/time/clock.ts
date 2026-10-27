import { Injectable } from '@nestjs/common';

/** Source of "now". Injected so tests can move time (lot phases, anti-sniping). */
@Injectable()
export class Clock {
  now(): Date {
    return new Date();
  }
}
