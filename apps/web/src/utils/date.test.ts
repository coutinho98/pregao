import { describe, expect, it } from 'vitest';
import { formatCountdown, formatDayTime, formatWhen, greeting } from './date';

describe('greeting', () => {
  it.each([
    ['2026-10-28T06:00:00Z', 'Boa madrugada'],
    ['2026-10-28T12:00:00Z', 'Bom dia'],
    ['2026-10-28T18:00:00Z', 'Boa tarde'],
    ['2026-10-28T23:00:00Z', 'Boa noite'],
  ])('greets %s (UTC) as %s in Brasília', (iso, expected) => {
    expect(greeting(new Date(iso))).toBe(expected);
  });
});

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

describe('formatCountdown', () => {
  it.each([
    [131_000, '02:11'],
    [3_731_000, '1:02:11'],
    [3 * 86_400_000 + 4 * 3_600_000, '3d 04h'],
    [-5_000, '00:00'],
  ])('formats %d ms as %s', (ms, expected) => {
    expect(formatCountdown(ms)).toBe(expected);
  });
});
