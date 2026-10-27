import { describe, expect, it } from 'vitest';
import { depositSchema } from './schemas';

describe('depositSchema', () => {
  it('turns reais into integer cents', () => {
    expect(depositSchema.parse({ amount: '5.000,50' })).toEqual({ amount: 500_050 });
  });

  it('enforces the deposit limits', () => {
    expect(depositSchema.safeParse({ amount: '0,99' }).success).toBe(false);
    expect(depositSchema.safeParse({ amount: '1.000.001' }).success).toBe(false);
    expect(depositSchema.safeParse({ amount: '1.000.000' }).success).toBe(true);
  });
});
