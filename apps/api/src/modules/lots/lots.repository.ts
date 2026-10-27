import { Injectable } from '@nestjs/common';
import { LotPhase, type PublicLotPhase } from '@pregao/shared';
import { LotStatus, type Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
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

  async findPage({ phase, q, page, pageSize, now }: LotPageQuery) {
    const where: Prisma.LotWhereInput = { ...phaseFilter(phase, now) };
    if (q) {
      where.itemSnapshot = {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { artist: { contains: q, mode: 'insensitive' } },
        ],
      };
    }
    const [lots, total] = await this.prisma.$transaction([
      this.prisma.lot.findMany({
        where,
        include: withSnapshot,
        orderBy: [phaseOrder[phase], { number: 'asc' }],
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
}
