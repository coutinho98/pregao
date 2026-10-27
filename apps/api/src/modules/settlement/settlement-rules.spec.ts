import { describe, expect, it } from 'vitest';
import { settlementProblem } from './settlement-rules.js';

const lot = { leaderId: 'ana', currentBidCents: 120_000n, lastHash: 'h2' };
const lastBid = {
  bidderId: 'ana',
  amountCents: 120_000n,
  hash: 'h2',
  bidderPseudonym: 'Licitante #A3F9C2',
};

describe('settlementProblem', () => {
  it('accepts a lot whose last bid matches the leader, amount, chain and paddle', () => {
    expect(settlementProblem(lot, lastBid, 'Licitante #A3F9C2')).toBeNull();
  });

  it('refuses when the leader was swapped in the database', () => {
    expect(settlementProblem({ ...lot, leaderId: 'bia' }, lastBid, 'Licitante #A3F9C2')).toMatch(
      /not the leader/,
    );
  });

  it('refuses when the bidder was swapped but the paddle number was left behind', () => {
    expect(settlementProblem(lot, { ...lastBid, bidderId: 'ana' }, 'Licitante #000000')).toMatch(
      /paddle/,
    );
  });

  it('refuses when the amount or the chain head disagree', () => {
    expect(
      settlementProblem({ ...lot, currentBidCents: 1n }, lastBid, lastBid.bidderPseudonym),
    ).toMatch(/amount/);
    expect(settlementProblem({ ...lot, lastHash: 'x' }, lastBid, lastBid.bidderPseudonym)).toMatch(
      /hash/,
    );
  });

  it('refuses when the last bid is missing', () => {
    expect(settlementProblem(lot, null, 'x')).toMatch(/missing/);
  });
});
