import { LotPhase } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { countdownView, livePhase } from './room-clock';

const lot = {
  phase: LotPhase.LIVE,
  startsAt: '2026-10-28T20:00:00.000Z',
  endsAt: '2026-10-28T21:00:00.000Z',
};
const at = (iso: string) => new Date(iso);

describe('livePhase', () => {
  it('turns a live lot into ended once its end passes on the server clock', () => {
    expect(livePhase(lot, at('2026-10-28T20:59:59.999Z'))).toBe(LotPhase.LIVE);
    expect(livePhase(lot, at('2026-10-28T21:00:00.000Z'))).toBe(LotPhase.ENDED);
  });

  it('opens a scheduled lot when its start arrives', () => {
    const scheduled = { ...lot, phase: LotPhase.SCHEDULED };
    expect(livePhase(scheduled, at('2026-10-28T19:59:00.000Z'))).toBe(LotPhase.SCHEDULED);
    expect(livePhase(scheduled, at('2026-10-28T20:00:00.000Z'))).toBe(LotPhase.LIVE);
  });

  it('never reopens a lot the server says is ended or cancelled', () => {
    expect(livePhase({ ...lot, phase: LotPhase.ENDED }, at('2026-10-28T20:30:00Z'))).toBe(
      LotPhase.ENDED,
    );
  });
});

describe('countdownView', () => {
  it('measures the whole lot while more than 2 minutes are left', () => {
    expect(countdownView(lot, LotPhase.LIVE, at('2026-10-28T20:30:00.000Z'))).toEqual({
      label: 'Encerra em',
      remaining: '30:00',
      fraction: 0.5,
      finalStretch: false,
    });
  });

  it('switches to the 2-minute anti-sniping window at the end', () => {
    expect(countdownView(lot, LotPhase.LIVE, at('2026-10-28T20:59:00.000Z'))).toEqual({
      label: 'Últimos 2 minutos',
      remaining: '01:00',
      fraction: 0.5,
      finalStretch: true,
    });
  });

  it('counts down to the opening of a scheduled lot', () => {
    const view = countdownView(lot, LotPhase.SCHEDULED, at('2026-10-28T19:58:30.000Z'));
    expect(view).toMatchObject({ label: 'Abre em', remaining: '01:30' });
  });

  it('has no countdown once ended', () => {
    expect(countdownView(lot, LotPhase.ENDED, at('2026-10-28T21:30:00Z'))).toBeNull();
  });
});
