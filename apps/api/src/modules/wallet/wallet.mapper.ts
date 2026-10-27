import type { LedgerEntry, WalletSummary } from '@pregao/shared';
import type { Wallet } from '../../generated/prisma/client.js';
import { centsToNumber } from '../../common/money.js';
import { availableCents } from './wallet-rules.js';
import type { LedgerEntryWithLot } from './wallets.repository.js';

export function toWalletSummary(wallet: Wallet): WalletSummary {
  return {
    totalCents: centsToNumber(wallet.totalCents),
    committedCents: centsToNumber(wallet.committedCents),
    availableCents: centsToNumber(availableCents(wallet)),
  };
}

export function toLedgerEntry(entry: LedgerEntryWithLot): LedgerEntry {
  return {
    id: entry.id,
    type: entry.type,
    amountCents: centsToNumber(entry.amountCents),
    totalAfterCents: centsToNumber(entry.totalAfterCents),
    committedAfterCents: centsToNumber(entry.committedAfterCents),
    lotId: entry.lotId,
    lotNumber: entry.lot?.number ?? null,
    lotTitle: entry.lot?.itemSnapshot.title ?? null,
    createdAt: entry.createdAt.toISOString(),
  };
}
