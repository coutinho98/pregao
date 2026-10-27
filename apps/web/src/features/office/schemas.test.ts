import { describe, expect, it } from 'vitest';
import { lotFormSchema } from './schemas';

const valid = {
  startingPrice: '1.500',
  minIncrement: '100,50',
  startsAt: '2026-11-01T14:00',
  endsAt: '2026-11-03T14:00',
};

describe('lotFormSchema', () => {
  it('turns reais into integer cents', () => {
    expect(lotFormSchema.parse(valid)).toMatchObject({
      startingPrice: 150_000,
      minIncrement: 10_050,
    });
  });

  it('explains how to type an invalid amount', () => {
    const result = lotFormSchema.safeParse({ ...valid, startingPrice: 'mil reais' });
    expect(result.error?.issues[0]?.message).toMatch(/como 1.500/);
  });

  it('requires at least R$ 1,00', () => {
    const result = lotFormSchema.safeParse({ ...valid, minIncrement: '0,50' });
    expect(result.error?.issues[0]?.message).toBe('O valor mínimo é R$ 1,00.');
  });

  it('requires the lot to stay open for at least 5 minutes', () => {
    const result = lotFormSchema.safeParse({ ...valid, endsAt: '2026-11-01T14:04' });
    expect(result.error?.issues[0]).toMatchObject({ path: ['endsAt'] });
  });
});
