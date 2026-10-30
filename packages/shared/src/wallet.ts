import { MAX_PRICE_CENTS } from './lot-rules';

export const LedgerEntryType = {
  DEPOSIT: 'DEPOSIT',
  HOLD: 'HOLD',
  RELEASE: 'RELEASE',
  DEBIT: 'DEBIT',
  CREDIT: 'CREDIT',
  REFUND: 'REFUND',
} as const;

export type LedgerEntryType = (typeof LedgerEntryType)[keyof typeof LedgerEntryType];

/** R$ 1,00 to R$ 1.000.000,00 per simulated deposit. */
export const MIN_DEPOSIT_CENTS = 100;
export const MAX_DEPOSIT_CENTS = 100_000_000;
/**
 * A bidder's total balance tops out at the highest bid a lot accepts (R$ 100.000.000,00):
 * more could never be spent, and an unbounded total would eventually outgrow what a JSON
 * number carries exactly.
 */
export const MAX_BALANCE_CENTS = MAX_PRICE_CENTS;

export interface WalletSummary {
  totalCents: number;
  committedCents: number;
  availableCents: number;
}

export interface LedgerEntry {
  id: string;
  type: LedgerEntryType;
  amountCents: number;
  totalAfterCents: number;
  committedAfterCents: number;
  lotId: string | null;
  lotNumber: number | null;
  lotTitle: string | null;
  createdAt: string;
}

export interface LedgerPage {
  entries: LedgerEntry[];
  /** Pass back as `cursor` to load older entries; null when there are no more. */
  nextCursor: string | null;
}

export interface DepositInput {
  amountCents: number;
}
