import { describe, expect, it } from 'vitest';
import { lotScheduleProblem } from './lot-rules.js';

const now = new Date('2026-10-27T12:00:00Z');
const minutes = (n: number) => new Date(now.getTime() + n * 60_000);

describe('lotScheduleProblem', () => {
  it('accepts a lot starting now and lasting at least 5 minutes', () => {
    expect(lotScheduleProblem(now, minutes(5), now)).toBeNull();
  });

  it('tolerates a start up to one minute in the past', () => {
    expect(lotScheduleProblem(minutes(-1), minutes(10), now)).toBeNull();
    expect(lotScheduleProblem(minutes(-2), minutes(10), now)).toMatch(/passado/);
  });

  it('rejects lots shorter than 5 minutes or ending before they start', () => {
    expect(lotScheduleProblem(minutes(10), minutes(14), now)).toMatch(/5 minutos/);
    expect(lotScheduleProblem(minutes(10), minutes(5), now)).toMatch(/5 minutos/);
  });

  it('rejects lots longer than 60 days', () => {
    expect(lotScheduleProblem(now, minutes(60 * 24 * 60 + 1), now)).toMatch(/60 dias/);
  });
});
