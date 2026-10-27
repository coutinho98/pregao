import { Clock } from '../../src/common/time/clock.js';

export class FakeClock extends Clock {
  private current: Date;

  constructor(start = '2026-10-27T12:00:00.000Z') {
    super();
    this.current = new Date(start);
  }

  override now(): Date {
    return new Date(this.current);
  }

  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}
