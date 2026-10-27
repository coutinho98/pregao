import { Injectable } from '@nestjs/common';
import { ErrorCode, LedgerEntryType, type LedgerPage, type WalletSummary } from '@pregao/shared';
import type { Wallet } from '../../generated/prisma/client.js';
import { DomainError } from '../../common/errors/domain-error.js';
import { TransactionRunner, type Tx } from '../../common/prisma/transaction-runner.js';
import { toLedgerEntry, toWalletSummary } from './wallet.mapper.js';
import { applyMovement } from './wallet-rules.js';
import { type MovementRecord, WalletsRepository } from './wallets.repository.js';

const LEDGER_PAGE_SIZE = 20;

@Injectable()
export class WalletService {
  constructor(
    private readonly wallets: WalletsRepository,
    private readonly transactions: TransactionRunner,
  ) {}

  async getSummary(userId: string): Promise<WalletSummary> {
    return toWalletSummary(await this.findWallet(userId));
  }

  deposit(userId: string, amountCents: number): Promise<WalletSummary> {
    return this.transactions.run(async (tx) => {
      const [wallet] = await this.lockWallets(tx, [userId]);
      if (!wallet) throw new DomainError(ErrorCode.NOT_FOUND, 'Carteira não encontrada.');
      const updated = await this.move(tx, wallet, {
        type: LedgerEntryType.DEPOSIT,
        amountCents: BigInt(amountCents),
      });
      return toWalletSummary(updated);
    });
  }

  async getLedger(userId: string, cursor?: string): Promise<LedgerPage> {
    const wallet = await this.findWallet(userId);
    const rows = await this.wallets.findLedgerPage(wallet.id, LEDGER_PAGE_SIZE + 1, cursor);
    const entries = rows.slice(0, LEDGER_PAGE_SIZE).map(toLedgerEntry);
    const hasMore = rows.length > LEDGER_PAGE_SIZE;
    return { entries, nextCursor: hasMore ? (entries.at(-1)?.id ?? null) : null };
  }

  /** Locks wallets for a transaction that moves money; always in ascending id order. */
  lockWallets(tx: Tx, userIds: string[]): Promise<Wallet[]> {
    return this.wallets.lockByUserIds(tx, userIds);
  }

  /**
   * Applies a movement to a wallet the caller already locked in `tx`, writing the ledger
   * line in the same transaction. Used by deposits, bids and settlement.
   */
  move(tx: Tx, wallet: Wallet, movement: MovementRecord): Promise<Wallet> {
    const balances = applyMovement(wallet, movement.type, movement.amountCents);
    return this.wallets.saveMovement(tx, wallet, movement, balances);
  }

  private async findWallet(userId: string): Promise<Wallet> {
    const wallet = await this.wallets.findByUserId(userId);
    if (!wallet) throw new DomainError(ErrorCode.NOT_FOUND, 'Carteira não encontrada.');
    return wallet;
  }
}
