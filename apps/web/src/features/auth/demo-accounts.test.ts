import { DEMO_ACCOUNTS, Role } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { demoAccounts } from './demo-accounts';

describe('demoAccounts', () => {
  it('offers every account the seed creates, each with a hint', () => {
    expect(demoAccounts.map((account) => account.email)).toEqual(
      Object.values(DEMO_ACCOUNTS).map((account) => account.email),
    );
    expect(demoAccounts.every((account) => account.hint.length > 0)).toBe(true);
  });

  it('includes one auctioneer and the bidders', () => {
    expect(demoAccounts.filter((account) => account.role === Role.AUCTIONEER)).toHaveLength(1);
    expect(demoAccounts.filter((account) => account.role === Role.BIDDER)).toHaveLength(2);
  });
});
