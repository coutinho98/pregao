import { LotPhase } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { auctioneerCall, type CallInput } from './auctioneer-call';

const nbsp = (text: string) => text.replace(/\u00a0/g, ' ');
const bid = { seq: 1, bidderPseudonym: 'Licitante #A3F9C2', amountCents: 430_000, createdAt: '' };
const live: CallInput = {
  phase: LotPhase.LIVE,
  bids: [bid],
  remainingMs: 5 * 60_000,
  extendedRecently: false,
  myPseudonym: undefined,
  startingPriceCents: 100_000,
  minNextBidCents: 440_000,
};
const call = (overrides: Partial<CallInput> = {}) =>
  nbsp(auctioneerCall({ ...live, ...overrides }));

describe('auctioneerCall', () => {
  it('asks for more while the lot is live', () => {
    expect(call()).toBe('R$ 4.300 com a raquete #A3F9C2. Quem dá mais? Próximo lance: R$ 4.400.');
  });

  it('opens the lot when there are no bids yet', () => {
    expect(call({ bids: [] })).toBe('Abrimos com R$ 1.000. Quem dá o primeiro lance?');
  });

  it('calls going once and going twice in the final seconds', () => {
    expect(call({ remainingMs: 25_000 })).toMatch(/^Dou-lhe uma… R\$ 4.300/);
    expect(call({ remainingMs: 8_000 })).toMatch(/^Dou-lhe duas… R\$ 4.300/);
  });

  it('announces an anti-sniping extension', () => {
    expect(call({ extendedRecently: true })).toBe('Lance no fim! Prazo prorrogado em 2 minutos.');
  });

  it('calls the hammer at the end, addressing the winner as "você"', () => {
    expect(call({ phase: LotPhase.ENDED, myPseudonym: bid.bidderPseudonym })).toBe(
      'Vendido! Martelo batido em R$ 4.300 para você.',
    );
    expect(call({ phase: LotPhase.ENDED, bids: [] })).toBe(
      'Encerrado sem lances. O lote não foi vendido.',
    );
  });
});
