import { LedgerEntryType } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { applyMovement, availableCents } from './wallet-rules.js';

const wallet = { totalCents: 10_000n, committedCents: 3_000n };

describe('applyMovement', () => {
  it.each([
    [LedgerEntryType.DEPOSIT, { totalCents: 11_000n, committedCents: 3_000n }],
    [LedgerEntryType.HOLD, { totalCents: 10_000n, committedCents: 4_000n }],
    [LedgerEntryType.RELEASE, { totalCents: 10_000n, committedCents: 2_000n }],
    [LedgerEntryType.DEBIT, { totalCents: 9_000n, committedCents: 2_000n }],
    [LedgerEntryType.CREDIT, { totalCents: 11_000n, committedCents: 3_000n }],
    [LedgerEntryType.REFUND, { totalCents: 10_000n, committedCents: 2_000n }],
  ])('applies %s', (type, expected) => {
    expect(applyMovement(wallet, type, 1_000n)).toEqual(expected);
  });

  it('refuses to hold more than is available', () => {
    expect(() => applyMovement(wallet, LedgerEntryType.HOLD, 7_001n)).toThrow(RangeError);
  });

  it('refuses to release more than is committed', () => {
    expect(() => applyMovement(wallet, LedgerEntryType.RELEASE, 3_001n)).toThrow(RangeError);
  });

  it('refuses non-positive amounts', () => {
    expect(() => applyMovement(wallet, LedgerEntryType.DEPOSIT, 0n)).toThrow(RangeError);
  });

  it('computes the available balance', () => {
    expect(availableCents(wallet)).toBe(7_000n);
  });
});
