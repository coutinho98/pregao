import { Injectable } from '@nestjs/common';
import type { Bid, Lot, Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import type { Tx } from '../../common/prisma/transaction-runner.js';
import type { LotWithSnapshot } from '../lots/lots.repository.js';

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

  async lotExists(lotId: string): Promise<boolean> {
    return (await this.prisma.lot.count({ where: { id: lotId } })) > 0;
  }
}
