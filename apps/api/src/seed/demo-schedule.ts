/** Brasília has no daylight saving time, so its offset from UTC is fixed. */
const BRASILIA_OFFSET_MS = -3 * 60 * 60_000;
const HOUR_MS = 60 * 60_000;
const DAY_MS = 24 * HOUR_MS;
/** Two sessions a weekday, in Brasília time. */
const SESSION_HOURS = [10, 15];
const SESSION_LENGTH_MS = 3 * DAY_MS;

export interface Session {
  startsAt: Date;
  endsAt: Date;
}

/**
 * The upcoming sessions for the next `weekdays` weekdays after `now` (Brasília time): one at
 * 10:00 and one at 15:00 each day, each open for three days. Weekends are skipped.
 */
export function upcomingWeekdaySessions(now: Date, weekdays: number): Session[] {
  // Midnight of today in Brasília, as a UTC instant.
  const local = new Date(now.getTime() + BRASILIA_OFFSET_MS);
  const todayStart =
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - BRASILIA_OFFSET_MS;

  const sessions: Session[] = [];
  for (let day = 1, found = 0; found < weekdays; day++) {
    const dayStart = todayStart + day * DAY_MS;
    const weekday = new Date(dayStart + BRASILIA_OFFSET_MS).getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    found++;
    for (const hour of SESSION_HOURS) {
      const startsAt = new Date(dayStart + hour * HOUR_MS);
      sessions.push({ startsAt, endsAt: new Date(startsAt.getTime() + SESSION_LENGTH_MS) });
    }
  }
  return sessions;
}
