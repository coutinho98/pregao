import { Injectable } from '@nestjs/common';
import { LotPhase, LotSort, parseLotNumber, type PublicLotPhase } from '@pregao/shared';
import { type Lot, LotStatus, type Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { lockLotRow } from '../../common/prisma/row-locks.js';
import type { Tx } from '../../common/prisma/transaction-runner.js';

export type LotWithSnapshot = Prisma.LotGetPayload<{ include: { itemSnapshot: true } }>;

export type ImageSize = 'full' | 'thumb';

export interface NewLot {
  lot: {
    id: string;
    auctioneerId: string;
    startingPriceCents: bigint;
    minIncrementCents: bigint;
    startsAt: Date;
    endsAt: Date;
    originalEndsAt: Date;
    genesisHash: string;
    lastHash: string;
    headSignature: string;
  };
  snapshot: Omit<Prisma.ItemSnapshotCreateWithoutLotInput, 'image'>;
  image: Prisma.ItemImageCreateWithoutSnapshotInput;
}

export interface LotPageQuery {
  phase: PublicLotPhase;
  q?: string;
  sort: LotSort;
  page: number;
  pageSize: number;
  now: Date;
}

const withSnapshot = { itemSnapshot: true } as const;

function phaseFilter(phase: PublicLotPhase, now: Date): Prisma.LotWhereInput {
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

function sortOrder(sort: LotSort, phase: PublicLotPhase): Prisma.LotOrderByWithRelationInput[] {
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
function searchFilter(q: string): Prisma.LotWhereInput {
  const lotNumber = parseLotNumber(q);
  return {
    OR: [
      { itemSnapshot: { title: { contains: q, mode: 'insensitive' } } },
      { itemSnapshot: { artist: { contains: q, mode: 'insensitive' } } },
      ...(lotNumber === null ? [] : [{ number: lotNumber }]),
    ],
  };
}

@Injectable()
export class LotsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Serializes lot creation per artwork so two auctioneers cannot list it at once. */
  async lockArtwork(tx: Tx, source: string, externalId: string): Promise<void> {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`${source}:${externalId}`}))::text`;
  }

  /** Open = live or scheduled. */
  countOpenLotsForArtwork(source: string, externalId: string, now: Date, tx?: Tx): Promise<number> {
    return (tx ?? this.prisma).lot.count({
      where: {
        status: LotStatus.ACTIVE,
        endsAt: { gt: now },
        itemSnapshot: { source, externalId },
      },
    });
  }

  createWithSnapshot(tx: Tx, { lot, snapshot, image }: NewLot): Promise<LotWithSnapshot> {
    const { auctioneerId, ...fields } = lot;
    return tx.lot.create({
      data: {
        ...fields,
        auctioneer: { connect: { id: auctioneerId } },
        itemSnapshot: { create: { ...snapshot, image: { create: image } } },
      },
      include: withSnapshot,
    });
  }

  async findPage({ phase, q, sort, page, pageSize, now }: LotPageQuery) {
    const where: Prisma.LotWhereInput = q
      ? { AND: [phaseFilter(phase, now), searchFilter(q)] }
      : phaseFilter(phase, now);
    const [lots, total] = await this.prisma.$transaction([
      this.prisma.lot.findMany({
        where,
        include: withSnapshot,
        orderBy: sortOrder(sort, phase),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.lot.count({ where }),
    ]);
    return { lots, total };
  }

  findById(id: string): Promise<LotWithSnapshot | null> {
    return this.prisma.lot.findUnique({ where: { id }, include: withSnapshot });
  }

  findByAuctioneer(auctioneerId: string): Promise<LotWithSnapshot[]> {
    return this.prisma.lot.findMany({
      where: { auctioneerId },
      include: withSnapshot,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findImage(
    snapshotId: string,
    size: ImageSize,
  ): Promise<{ mime: string; bytes: Uint8Array } | null> {
    const image = await this.prisma.itemImage.findUnique({
      where: { snapshotId },
      select: { imageMime: true, imageBytes: size === 'full', thumbBytes: size === 'thumb' },
    });
    if (!image) return null;
    const bytes = size === 'full' ? image.imageBytes : image.thumbBytes;
    return bytes ? { mime: image.imageMime, bytes } : null;
  }

  lockLot(tx: Tx, lotId: string): Promise<Lot | null> {
    return lockLotRow(tx, lotId);
  }

  markCancelled(tx: Tx, lotId: string, cancelledAt: Date): Promise<LotWithSnapshot> {
    return tx.lot.update({
      where: { id: lotId },
      data: { status: LotStatus.CANCELLED, cancelledAt },
      include: withSnapshot,
    });
  }
}
