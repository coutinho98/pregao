import { Injectable } from '@nestjs/common';
import type { LedgerEntryType } from '@pregao/shared';
import type { Prisma, Wallet } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import type { Tx } from '../../common/prisma/transaction-runner.js';
import type { Balances } from './wallet-rules.js';

export interface MovementRecord {
  type: LedgerEntryType;
  amountCents: bigint;
  lotId?: string;
  bidId?: string;
}

export type LedgerEntryWithLot = Prisma.WalletLedgerGetPayload<{
  include: { lot: { select: { number: true; itemSnapshot: { select: { title: true } } } } };
}>;

@Injectable()
export class WalletsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({ where: { userId } });
  }

  /**
   * Locks the users' wallets (SELECT ... FOR UPDATE) in ascending wallet id order, the one
   * order every transaction uses, so two transactions never wait on each other in a cycle.
   */
  async lockByUserIds(tx: Tx, userIds: string[]): Promise<Wallet[]> {
    const ids = [...new Set(userIds)];
    await tx.$queryRaw`
      SELECT id FROM wallets WHERE "userId" = ANY(${ids}::uuid[]) ORDER BY id FOR UPDATE`;
    return tx.wallet.findMany({ where: { userId: { in: ids } } });
  }

  /** Persists new balances together with the ledger line that explains them. */
  async saveMovement(
    tx: Tx,
    wallet: Wallet,
    movement: MovementRecord,
    balances: Balances,
  ): Promise<Wallet> {
    await tx.walletLedger.create({
      data: {
        walletId: wallet.id,
        type: movement.type,
        amountCents: movement.amountCents,
        totalAfterCents: balances.totalCents,
        committedAfterCents: balances.committedCents,
        lotId: movement.lotId,
        bidId: movement.bidId,
      },
    });
    return tx.wallet.update({ where: { id: wallet.id }, data: balances });
  }

  findLedgerPage(walletId: string, take: number, cursor?: string): Promise<LedgerEntryWithLot[]> {
    return this.prisma.walletLedger.findMany({
      where: { walletId },
      include: { lot: { select: { number: true, itemSnapshot: { select: { title: true } } } } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });
  }
}
