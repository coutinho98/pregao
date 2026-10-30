import { LedgerEntryType, MAX_BALANCE_CENTS } from '@pregao/shared';

export interface Balances {
  totalCents: bigint;
  committedCents: bigint;
}

type Sign = -1n | 0n | 1n;

/** How each ledger entry type moves the total and the committed balances. */
const EFFECTS: Record<LedgerEntryType, { total: Sign; committed: Sign }> = {
  [LedgerEntryType.DEPOSIT]: { total: 1n, committed: 0n },
  [LedgerEntryType.HOLD]: { total: 0n, committed: 1n },
  [LedgerEntryType.RELEASE]: { total: 0n, committed: -1n },
  [LedgerEntryType.DEBIT]: { total: -1n, committed: -1n },
  [LedgerEntryType.CREDIT]: { total: 1n, committed: 0n },
  [LedgerEntryType.REFUND]: { total: 0n, committed: -1n },
};

/** How much more a deposit may add before the total reaches MAX_BALANCE_CENTS. */
export function depositRoomCents({ totalCents }: Balances): bigint {
  const room = BigInt(MAX_BALANCE_CENTS) - totalCents;
  return room > 0n ? room : 0n;
}

export function availableCents({ totalCents, committedCents }: Balances): bigint {
  return totalCents - committedCents;
}

/**
 * Balances after a movement. Throws when the result would break the wallet invariant
 * (0 <= committed <= total): callers must have validated the movement before.
 */
export function applyMovement(
  balances: Balances,
  type: LedgerEntryType,
  amountCents: bigint,
): Balances {
  if (amountCents <= 0n) throw new RangeError(`Movement amount must be positive: ${amountCents}`);
  const effect = EFFECTS[type];
  const next = {
    totalCents: balances.totalCents + effect.total * amountCents,
    committedCents: balances.committedCents + effect.committed * amountCents,
  };
  if (next.committedCents < 0n || next.totalCents < next.committedCents) {
    throw new RangeError(`${type} of ${amountCents} breaks the wallet invariant`);
  }
  return next;
}
