import { type AuctioneerLot, LotPhase, LotResult } from '@pregao/shared';
import { countLabel } from '@/utils/plural';

export interface LotNote {
  text: string;
  tone: string;
}

const resultNote: Record<LotResult, LotNote> = {
  [LotResult.SOLD]: { text: 'Arrematado', tone: 'text-up' },
  [LotResult.UNSOLD]: { text: 'Sem lances', tone: 'text-ink-3' },
};

/** The small line under the amount in the auctioneer's list. */
export function lotNote(lot: AuctioneerLot): LotNote {
  if (lot.result) return resultNote[lot.result];
  if (lot.phase === LotPhase.SCHEDULED) return { text: 'inicial', tone: 'text-ink-3' };
  return { text: countLabel(lot.bidCount, 'lance', 'lances'), tone: 'text-ink-3' };
}

/** Scheduled or live lots can still be cancelled by their auctioneer. */
export function canCancel(lot: AuctioneerLot): boolean {
  return lot.phase === LotPhase.SCHEDULED || lot.phase === LotPhase.LIVE;
}

export interface LotTotals {
  live: number;
  scheduled: number;
  sold: number;
  unsold: number;
}

/** How the auctioneer's lots are spread: running now, waiting to open, and their results. */
export function lotTotals(lots: AuctioneerLot[]): LotTotals {
  const count = (matches: (lot: AuctioneerLot) => boolean) => lots.filter(matches).length;
  return {
    live: count((lot) => lot.phase === LotPhase.LIVE),
    scheduled: count((lot) => lot.phase === LotPhase.SCHEDULED),
    sold: count((lot) => lot.result === LotResult.SOLD),
    unsold: count((lot) => lot.result === LotResult.UNSOLD),
  };
}
