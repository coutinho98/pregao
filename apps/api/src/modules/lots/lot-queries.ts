import { LotPhase, LotSort, parseLotNumber, type PublicLotPhase } from '@pregao/shared';
import { LotStatus, type Prisma } from '../../generated/prisma/client.js';

/** Prisma filters and orderings for the showcase: phase, search and sort. */
export function phaseFilter(phase: PublicLotPhase, now: Date): Prisma.LotWhereInput {
  const filters: Record<PublicLotPhase, Prisma.LotWhereInput> = {
    [LotPhase.LIVE]: { status: LotStatus.ACTIVE, startsAt: { lte: now }, endsAt: { gt: now } },
    [LotPhase.SCHEDULED]: { status: LotStatus.ACTIVE, startsAt: { gt: now } },
    [LotPhase.ENDED]: {
      OR: [{ status: LotStatus.SETTLED }, { status: LotStatus.ACTIVE, endsAt: { lte: now } }],
    },
  };
  return filters[phase];
}

const phaseOrder: Record<PublicLotPhase, Prisma.LotOrderByWithRelationInput> = {
  [LotPhase.LIVE]: { endsAt: 'asc' },
  [LotPhase.SCHEDULED]: { startsAt: 'asc' },
  [LotPhase.ENDED]: { endsAt: 'desc' },
};

export function sortOrder(
  sort: LotSort,
  phase: PublicLotPhase,
): Prisma.LotOrderByWithRelationInput[] {
  const orders: Record<LotSort, Prisma.LotOrderByWithRelationInput[]> = {
    [LotSort.SOON]: [phaseOrder[phase]],
    [LotSort.NEWEST]: [{ createdAt: 'desc' }],
    [LotSort.MOST_BIDS]: [{ bidCount: 'desc' }, phaseOrder[phase]],
    [LotSort.HIGHEST_BID]: [
      { currentBidCents: { sort: 'desc', nulls: 'last' } },
      phaseOrder[phase],
    ],
  };
  return [...orders[sort], { number: 'asc' }];
}

/** Title, artist or the lot number ("7", "lote 007"). */
export function searchFilter(q: string): Prisma.LotWhereInput {
  const lotNumber = parseLotNumber(q);
  return {
    OR: [
      { itemSnapshot: { title: { contains: q, mode: 'insensitive' } } },
      { itemSnapshot: { artist: { contains: q, mode: 'insensitive' } } },
      ...(lotNumber === null ? [] : [{ number: lotNumber }]),
    ],
  };
}
