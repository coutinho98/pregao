import { Injectable } from '@nestjs/common';
import { LotStatus, type Bid, type Lot, type Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import type { Tx } from '../../common/prisma/transaction-runner.js';

@Injectable()
export class SettlementRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Locks one lot whose time is up, skipping lots another transaction already holds (a bid
   * still going through, or another settlement) and the ones in `skip`.
   */
  async lockNextDueLot(tx: Tx, now: Date, skip: string[]): Promise<Lot | null> {
    const rows = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM lots
      WHERE status = 'ACTIVE' AND "endsAt" <= ${now} AND NOT (id = ANY(${skip}::uuid[]))
      ORDER BY "endsAt"
      LIMIT 1
      FOR UPDATE SKIP LOCKED`;
    const id = rows[0]?.id;
    return id ? tx.lot.findUnique({ where: { id } }) : null;
  }

  /** Waits for the lot's row lock: used when a reader needs this lot settled now. */
  async lockLot(tx: Tx, lotId: string): Promise<Lot | null> {
    await tx.$queryRaw`SELECT id FROM lots WHERE id = ${lotId}::uuid FOR UPDATE`;
    return tx.lot.findUnique({ where: { id: lotId } });
  }

  /** Ids of ended lots still waiting for settlement, among the ones matching `where`. */
  async findDueLotIds(where: Prisma.LotWhereInput, now: Date): Promise<string[]> {
    const lots = await this.prisma.lot.findMany({
      where: { ...where, status: LotStatus.ACTIVE, endsAt: { lte: now } },
      select: { id: true },
    });
    return lots.map(({ id }) => id);
  }

  findBid(tx: Tx, lotId: string, seq: number): Promise<Bid | null> {
    return tx.bid.findUnique({ where: { lotId_seq: { lotId, seq } } });
  }

  async markSettled(tx: Tx, lotId: string, settledAt: Date): Promise<void> {
    await tx.lot.update({ where: { id: lotId }, data: { status: LotStatus.SETTLED, settledAt } });
  }

  async createReceipt(tx: Tx, receipt: Prisma.ReceiptUncheckedCreateInput): Promise<void> {
    await tx.receipt.create({ data: receipt });
  }
}
