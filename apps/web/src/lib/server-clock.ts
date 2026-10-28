import { useEffect, useState } from 'react';

/** Server clock minus browser clock. Countdowns use the server's time, not the user's. */
let offsetMs = 0;

export function syncServerClock(serverNowIso: string): void {
  offsetMs = new Date(serverNowIso).getTime() - Date.now();
}

function serverNow(): Date {
  return new Date(Date.now() + offsetMs);
}

/** Server-corrected "now", re-rendering every `intervalMs`. */
export function useServerNow(intervalMs = 1_000): Date {
  const [now, setNow] = useState(serverNow);
  useEffect(() => {
    const timer = setInterval(() => setNow(serverNow()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
