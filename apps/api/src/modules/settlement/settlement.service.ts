import { Injectable, Logger } from '@nestjs/common';
import { LedgerEntryType, LotStatus as SharedLotStatus } from '@pregao/shared';
import { randomBytes } from 'node:crypto';
import { type Lot, LotStatus, type Prisma } from '../../generated/prisma/client.js';
import { Pseudonyms } from '../../common/crypto/pseudonyms.js';
import { centsToNumber } from '../../common/money.js';
import { TransactionRunner, type Tx } from '../../common/prisma/transaction-runner.js';
import { Clock } from '../../common/time/clock.js';
import { RealtimeGateway } from '../realtime/realtime.gateway.js';
import { WalletService } from '../wallet/wallet.service.js';
import { settlementProblem } from './settlement-rules.js';
import { SettlementRepository } from './settlement.repository.js';

interface ClosedLot {
  lotId: string;
  winnerPseudonym: string | null;
  finalPriceCents: number | null;
}

/** Each settlement run handles at most this many lots, so one tick never runs for long. */
const BATCH_LIMIT = 50;

/**
 * Closes lots whose time is up, idempotently: the lot row is locked and re-read inside the
 * transaction, and only an ACTIVE lot past its end is touched. The winner pays (total and
 * committed go down), the auctioneer is credited, and a receipt with a random public token
 * is issued. Lots without bids just become SETTLED.
 */
@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);
  /** Lots already reported as unsafe to charge, so each one is logged once, not every tick. */
  private readonly reported = new Set<string>();

  constructor(
    private readonly settlement: SettlementRepository,
    private readonly wallet: WalletService,
    private readonly pseudonyms: Pseudonyms,
    private readonly realtime: RealtimeGateway,
    private readonly transactions: TransactionRunner,
    private readonly clock: Clock,
  ) {}

  /** Settles every lot past its end, one transaction per lot. Returns how many were closed. */
  async settleDue(): Promise<number> {
    const skipped: string[] = [];
    let closedCount = 0;
    while (closedCount < BATCH_LIMIT) {
      const outcome = await this.transactions.run(async (tx) => {
        const lot = await this.settlement.lockNextDueLot(tx, this.clock.now(), skipped);
        if (!lot) return null;
        // Re-checked on the locked row: a last-second bid may have pushed the end out.
        return { lot, closed: this.isDue(lot) ? await this.close(tx, lot) : null };
      });
      if (!outcome) break;
      if (!outcome.closed) {
        skipped.push(outcome.lot.id);
        continue;
      }
      this.announce(outcome.closed);
      closedCount += 1;
    }
    return closedCount;
  }

  /** Settles one lot right away if its time is up (readers call this before answering). */
  async settleIfDue(lotId: string): Promise<void> {
    const closed = await this.transactions.run(async (tx) => {
      const lot = await this.settlement.lockLot(tx, lotId);
      if (!lot || !this.isDue(lot)) return null;
      return this.close(tx, lot);
    });
    if (closed) this.announce(closed);
  }

  /** Settles the ended lots among the ones matching `where` (e.g. a user's own lots). */
  async settleDueWhere(where: Prisma.LotWhereInput): Promise<void> {
    const ids = await this.settlement.findDueLotIds(where, this.clock.now());
    for (const id of ids) await this.settleIfDue(id);
  }

  private isDue(lot: Lot): boolean {
    return lot.status === LotStatus.ACTIVE && lot.endsAt <= this.clock.now();
  }

  /** Null when the lot cannot be charged safely; the lot stays ACTIVE and is logged. */
  private async close(tx: Tx, lot: Lot): Promise<ClosedLot | null> {
    const now = this.clock.now();
    if (!lot.leaderId || lot.currentBidCents === null) {
      await this.settlement.markSettled(tx, lot.id, now);
      return { lotId: lot.id, winnerPseudonym: null, finalPriceCents: null };
    }

    const lastBid = await this.settlement.findBid(tx, lot.id, lot.bidCount);
    const problem = settlementProblem(lot, lastBid, this.pseudonyms.forLot(lot.leaderId, lot.id));
    if (problem || !lastBid) {
      this.reportOnce(lot.id, problem ?? 'last bid is missing');
      return null;
    }

    const wallets = await this.wallet.lockWallets(tx, [lot.leaderId, lot.auctioneerId]);
    const winnerWallet = wallets.find((wallet) => wallet.userId === lot.leaderId);
    const auctioneerWallet = wallets.find((wallet) => wallet.userId === lot.auctioneerId);
    if (!winnerWallet || !auctioneerWallet) {
      this.reportOnce(lot.id, 'wallet missing');
      return null;
    }
    const amountCents = lot.currentBidCents;
    await this.wallet.move(tx, winnerWallet, {
      type: LedgerEntryType.DEBIT,
      amountCents,
      lotId: lot.id,
    });
    await this.wallet.move(tx, auctioneerWallet, {
      type: LedgerEntryType.CREDIT,
      amountCents,
      lotId: lot.id,
    });
    await this.settlement.createReceipt(tx, {
      lotId: lot.id,
      winnerId: lot.leaderId,
      winnerPseudonym: lastBid.bidderPseudonym,
      amountCents,
      bidCount: lot.bidCount,
      finalHash: lot.lastHash,
      publicToken: randomBytes(24).toString('base64url'),
    });
    await this.settlement.markSettled(tx, lot.id, now);
    return {
      lotId: lot.id,
      winnerPseudonym: lastBid.bidderPseudonym,
      finalPriceCents: centsToNumber(amountCents),
    };
  }

  private reportOnce(lotId: string, problem: string): void {
    if (this.reported.has(lotId)) return;
    this.reported.add(lotId);
    this.logger.error(`Lot ${lotId} not settled: ${problem}`);
  }

  /** Runs after the commit, like every realtime event. */
  private announce({ lotId, winnerPseudonym, finalPriceCents }: ClosedLot): void {
    this.realtime.publishClosed({
      lotId,
      status: SharedLotStatus.SETTLED,
      winnerPseudonym,
      finalPriceCents,
      serverNow: this.clock.now().toISOString(),
    });
  }
}
