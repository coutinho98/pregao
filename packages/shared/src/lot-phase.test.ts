import { describe, expect, it } from 'vitest';
import { deriveLotPhase, LotPhase, LotStatus } from './lot-phase';

const startsAt = new Date('2026-01-01T10:00:00Z');
const endsAt = new Date('2026-01-01T12:00:00Z');
const at = (iso: string) => new Date(iso);

describe('deriveLotPhase', () => {
  const active = { status: LotStatus.ACTIVE, startsAt, endsAt };

  it('is scheduled before startsAt', () => {
    expect(deriveLotPhase(active, at('2026-01-01T09:59:59.999Z'))).toBe(LotPhase.SCHEDULED);
  });

  it('is live from startsAt (inclusive) until endsAt (exclusive)', () => {
    expect(deriveLotPhase(active, startsAt)).toBe(LotPhase.LIVE);
    expect(deriveLotPhase(active, at('2026-01-01T11:59:59.999Z'))).toBe(LotPhase.LIVE);
    expect(deriveLotPhase(active, endsAt)).toBe(LotPhase.ENDED);
  });

  it('is ended once settled, even if the clock says otherwise', () => {
    expect(deriveLotPhase({ ...active, status: LotStatus.SETTLED }, startsAt)).toBe(LotPhase.ENDED);
  });

  it('is cancelled regardless of time', () => {
    expect(deriveLotPhase({ ...active, status: LotStatus.CANCELLED }, startsAt)).toBe(
      LotPhase.CANCELLED,
    );
  });
});
