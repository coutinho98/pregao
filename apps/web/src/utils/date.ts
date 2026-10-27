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
