import { LotPhase } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { lotStatus } from './lot-status';

const now = new Date('2026-10-28T15:00:00Z');
const base = {
  startsAt: '2026-10-28T13:00:00Z',
  endsAt: '2026-10-28T20:30:00Z',
  startingPriceCents: 100_000,
  currentBidCents: null,
};

describe('lotStatus', () => {
  it('shows the opening time for scheduled lots', () => {
    const status = lotStatus(
      { ...base, phase: LotPhase.SCHEDULED, startsAt: '2026-10-29T17:00:00Z' },
      now,
    );
    expect(status).toMatchObject({
      kind: 'scheduled',
      amountLabel: 'Lance inicial',
      note: 'abre 29/10, 14:00',
    });
  });

  it('shows the current bid for live lots with bids', () => {
    const status = lotStatus({ ...base, phase: LotPhase.LIVE, currentBidCents: 120_000 }, now);
    expect(status).toEqual({
      kind: 'live',
      amountLabel: 'Lance atual',
      amountCents: 120_000,
      note: 'ao vivo · termina 17:30',
    });
  });

  it('shows the hammer price for ended lots with bids', () => {
    const status = lotStatus({ ...base, phase: LotPhase.ENDED, currentBidCents: 90_000 }, now);
    expect(status).toMatchObject({ kind: 'hammered', amountLabel: 'Arrematado' });
  });

  it('says when an ended lot had no bids', () => {
    expect(lotStatus({ ...base, phase: LotPhase.ENDED }, now)).toMatchObject({
      kind: 'ended',
      note: 'encerrado sem lances',
    });
  });
});
