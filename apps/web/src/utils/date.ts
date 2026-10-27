const TIME_ZONE = 'America/Sao_Paulo';

const dayAndTime = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});
const timeOnly = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});
const calendarDay = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE });
const timeWithSeconds = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** "19:02:41" in Brasília time, for bid timestamps. */
export function formatClockTime(value: string | Date): string {
  return timeWithSeconds.format(new Date(value));
}

/** "28/10, 14:00" in Brasília time. */
export function formatDayTime(value: string | Date): string {
  return dayAndTime.format(new Date(value));
}

/** "14:00" when the date is today in Brasília, otherwise "28/10, 14:00". */
export function formatWhen(value: string | Date, now: Date = new Date()): string {
  const date = new Date(value);
  return calendarDay.format(date) === calendarDay.format(now)
    ? timeOnly.format(date)
    : dayAndTime.format(date);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Value for <input type="datetime-local"> in the browser's time zone. */
export function toDateTimeLocal(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Reads <input type="datetime-local"> (browser time zone) as an ISO instant. */
export function fromDateTimeLocal(value: string): string {
  return new Date(value).toISOString();
}

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** "02:11", "1:02:11" or "3d 04h" for a remaining duration. Never negative. */
export function formatCountdown(remainingMs: number): string {
  const ms = Math.max(0, remainingMs);
  if (ms >= DAY_MS) {
    return `${Math.floor(ms / DAY_MS)}d ${pad(Math.floor((ms % DAY_MS) / HOUR_MS))}h`;
  }
  const hours = Math.floor(ms / HOUR_MS);
  const minutes = Math.floor((ms % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((ms % MINUTE_MS) / SECOND_MS);
  const clock = `${pad(minutes)}:${pad(seconds)}`;
  return hours > 0 ? `${hours}:${clock}` : clock;
}
