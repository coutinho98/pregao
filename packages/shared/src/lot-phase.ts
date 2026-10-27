export const LotStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  SETTLED: 'SETTLED',
} as const;

export type LotStatus = (typeof LotStatus)[keyof typeof LotStatus];

/** What the public sees. Only `status` is stored; the phase comes from the clock. */
export const LotPhase = {
  SCHEDULED: 'SCHEDULED',
  LIVE: 'LIVE',
  ENDED: 'ENDED',
  CANCELLED: 'CANCELLED',
} as const;

export type LotPhase = (typeof LotPhase)[keyof typeof LotPhase];

export const PUBLIC_LOT_PHASES = [LotPhase.LIVE, LotPhase.SCHEDULED, LotPhase.ENDED] as const;
export type PublicLotPhase = (typeof PUBLIC_LOT_PHASES)[number];

interface LotTiming {
  status: LotStatus;
  startsAt: Date;
  endsAt: Date;
}

export function deriveLotPhase({ status, startsAt, endsAt }: LotTiming, now: Date): LotPhase {
  if (status === LotStatus.CANCELLED) return LotPhase.CANCELLED;
  if (status === LotStatus.SETTLED) return LotPhase.ENDED;
  if (now < startsAt) return LotPhase.SCHEDULED;
  if (now < endsAt) return LotPhase.LIVE;
  return LotPhase.ENDED;
}
