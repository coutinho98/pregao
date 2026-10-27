import { describe, expect, it } from 'vitest';
import { formatDayTime, formatWhen } from './date';

describe('date formatting (America/Sao_Paulo)', () => {
  it('formats day and time in Brasília time', () => {
    expect(formatDayTime('2026-10-28T17:00:00Z')).toBe('28/10, 14:00');
  });

  it('shows only the time for today', () => {
    const now = new Date('2026-10-28T15:00:00Z');
    expect(formatWhen('2026-10-28T20:30:00Z', now)).toBe('17:30');
    expect(formatWhen('2026-10-29T20:30:00Z', now)).toBe('29/10, 17:30');
  });
});
