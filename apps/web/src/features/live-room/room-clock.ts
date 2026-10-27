import { ANTI_SNIPING_WINDOW_MS, type LotDetail, LotPhase } from '@pregao/shared';
import { formatCountdown } from '@/utils/date';

type TimedLot = Pick<LotDetail, 'phase' | 'startsAt' | 'endsAt'>;

/**
 * The phase as of the server-corrected clock: a lot fetched while live becomes ended in the
 * browser the moment its end passes, without waiting for a refetch.
 */
export function livePhase(lot: TimedLot, now: Date): LotPhase {
  if (lot.phase === LotPhase.CANCELLED || lot.phase === LotPhase.ENDED) return lot.phase;
  if (now < new Date(lot.startsAt)) return LotPhase.SCHEDULED;
  if (now < new Date(lot.endsAt)) return LotPhase.LIVE;
  return LotPhase.ENDED;
}

export interface CountdownView {
  label: string;
  remaining: string;
  /** Share of the bar still filled, 0..1. */
  fraction: number;
  /** Inside the anti-sniping window: the bar measures those 2 minutes and turns wax red. */
  finalStretch: boolean;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function countdownView(lot: TimedLot, phase: LotPhase, now: Date): CountdownView | null {
  const startsAt = new Date(lot.startsAt).getTime();
  const endsAt = new Date(lot.endsAt).getTime();

  if (phase === LotPhase.SCHEDULED) {
    return {
      label: 'Abre em',
      remaining: formatCountdown(startsAt - now.getTime()),
      fraction: 1,
      finalStretch: false,
    };
  }
  if (phase !== LotPhase.LIVE) return null;

  const remainingMs = endsAt - now.getTime();
  const finalStretch = remainingMs <= ANTI_SNIPING_WINDOW_MS;
  const span = finalStretch ? ANTI_SNIPING_WINDOW_MS : endsAt - startsAt;
  return {
    label: finalStretch ? 'Últimos 2 minutos' : 'Encerra em',
    remaining: formatCountdown(remainingMs),
    fraction: clamp(remainingMs / span),
    finalStretch,
  };
}
