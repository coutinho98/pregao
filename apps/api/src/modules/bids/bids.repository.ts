import { Injectable } from '@nestjs/common';
import type { Bid, Lot, Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import type { Tx } from '../../common/prisma/transaction-runner.js';
import type { LotWithSnapshot } from '../lots/lots.repository.js';
import type { BidderHighest } from './bid-rules.js';

export type LotWithReceipt = Prisma.LotGetPayload<{
  include: { itemSnapshot: true; receipt: { select: { publicToken: true; winnerId: true } } };
}>;

export interface LotAfterBid {
  currentBidCents: bigint;
  leaderId: string;
  bidCount: number;
  lastHash: string;
  headSignature: string;
  endsAt: Date;
}

@Injectable()
export class BidsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Row lock on the lot: every bid on it (and its settlement) waits here, one at a time. */
  async lockLot(tx: Tx, lotId: string): Promise<Lot | null> {
    await tx.$queryRaw`SELECT id FROM lots WHERE id = ${lotId}::uuid FOR UPDATE`;
    return tx.lot.findUnique({ where: { id: lotId } });
  }

  createBid(tx: Tx, bid: Prisma.BidUncheckedCreateInput): Promise<Bid> {
    return tx.bid.create({ data: bid });
  }

  updateLotAfterBid(tx: Tx, lotId: string, changes: LotAfterBid): Promise<LotWithSnapshot> {
    return tx.lot.update({
      where: { id: lotId },
      data: changes,
      include: { itemSnapshot: true },
    });
  }

  findByLot(lotId: string): Promise<Bid[]> {
    return this.prisma.bid.findMany({ where: { lotId }, orderBy: { seq: 'desc' } });
  }

  /** The lot's current leader (null without bids), or undefined when the lot does not exist. */
  async findLeaderId(lotId: string): Promise<string | null | undefined> {
    const lot = await this.prisma.lot.findUnique({
      where: { id: lotId },
      select: { leaderId: true },
    });
    return lot ? lot.leaderId : undefined;
  }

  async findHighestBidPerBidder(lotId: string): Promise<BidderHighest[]> {
    const rows = await this.prisma.bid.groupBy({
      by: ['bidderId'],
      where: { lotId },
      _max: { amountCents: true },
    });
    return rows.map((row) => ({ bidderId: row.bidderId, amountCents: row._max.amountCents ?? 0n }));
  }

  async findReceiptToken(lotId: string, winnerId: string): Promise<string | null> {
    const receipt = await this.prisma.receipt.findFirst({
      where: { lotId, winnerId },
      select: { publicToken: true },
    });
    return receipt?.publicToken ?? null;
  }

  /** Lots the user bid on, newest end first, with the receipt when there is one. */
  findLotsBidBy(bidderId: string): Promise<LotWithReceipt[]> {
    return this.prisma.lot.findMany({
      where: { bids: { some: { bidderId } } },
      include: { itemSnapshot: true, receipt: { select: { publicToken: true, winnerId: true } } },
      orderBy: { endsAt: 'desc' },
    });
  }

  async findHighestBidPerLot(bidderId: string): Promise<Map<string, bigint>> {
    const rows = await this.prisma.bid.groupBy({
      by: ['lotId'],
      where: { bidderId },
      _max: { amountCents: true },
    });
    return new Map(rows.map((row) => [row.lotId, row._max.amountCents ?? 0n]));
  }

  async lotExists(lotId: string): Promise<boolean> {
    return (await this.prisma.lot.count({ where: { id: lotId } })) > 0;
  }
}
