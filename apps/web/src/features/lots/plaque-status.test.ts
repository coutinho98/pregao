import { LotPhase } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { plaqueStatus } from './plaque-status';

const now = new Date('2026-10-28T15:00:00Z');
const base = {
  startsAt: '2026-10-28T13:00:00Z',
  endsAt: '2026-10-28T20:30:00Z',
  startingPriceCents: 100_000,
  currentBidCents: null,
};

describe('plaqueStatus', () => {
  it('shows the opening time for scheduled lots', () => {
    const status = plaqueStatus(
      { ...base, phase: LotPhase.SCHEDULED, startsAt: '2026-10-29T17:00:00Z' },
      now,
    );
    expect(status).toMatchObject({ amountLabel: 'Lance inicial', note: 'Abre 29/10, 14:00' });
  });

  it('shows the current bid for live lots with bids', () => {
    const status = plaqueStatus({ ...base, phase: LotPhase.LIVE, currentBidCents: 120_000 }, now);
    expect(status).toMatchObject({
      amountLabel: 'Lance atual',
      amountCents: 120_000,
      note: 'Em pregão · termina 17:30',
      live: true,
    });
  });

  it('shows the hammer price for ended lots', () => {
    const status = plaqueStatus({ ...base, phase: LotPhase.ENDED, currentBidCents: 90_000 }, now);
    expect(status.amountLabel).toBe('Martelo batido');
  });

  it('says when an ended lot had no bids', () => {
    expect(plaqueStatus({ ...base, phase: LotPhase.ENDED }, now).note).toBe('Encerrado sem lances');
  });
});
