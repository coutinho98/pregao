import { describe, expect, it } from 'vitest';
import { upcomingWeekdaySessions } from './demo-schedule.js';

// Wednesday 28 Oct 2026, 09:00 in Brasília.
const wednesday = new Date('2026-10-28T12:00:00.000Z');

describe('upcomingWeekdaySessions', () => {
  const sessions = upcomingWeekdaySessions(wednesday, 7);

  it('opens two sessions a day from tomorrow to the Friday of next week', () => {
    expect(sessions).toHaveLength(14);
    expect(sessions[0]?.startsAt.toISOString()).toBe('2026-10-29T13:00:00.000Z');
    expect(sessions.at(-1)?.startsAt.toISOString()).toBe('2026-11-06T18:00:00.000Z');
  });

  it('skips the weekend', () => {
    const days = sessions.map(({ startsAt }) => startsAt.toISOString().slice(0, 10));
    expect(days).not.toContain('2026-10-31');
    expect(days).not.toContain('2026-11-01');
  });

  it('runs every session at 10:00 and 15:00 Brasília time, for three days', () => {
    const hours = new Set(sessions.map(({ startsAt }) => startsAt.getUTCHours()));
    expect([...hours]).toEqual([13, 18]);
    for (const { startsAt, endsAt } of sessions) {
      expect(endsAt.getTime() - startsAt.getTime()).toBe(3 * 24 * 60 * 60_000);
    }
  });

  it('starts on Monday when run on a Friday evening', () => {
    const friday = new Date('2026-10-30T23:00:00.000Z');
    expect(upcomingWeekdaySessions(friday, 1)[0]?.startsAt.toISOString()).toBe(
      '2026-11-02T13:00:00.000Z',
    );
  });
});
