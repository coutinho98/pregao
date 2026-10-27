import { describe, expect, it } from 'vitest';
import { formatCents, parseBrlToCents } from './money';

const nbsp = (text: string) => text.replace(/\u00a0/g, ' ');

describe('formatCents', () => {
  it('hides cents on whole amounts', () => {
    expect(nbsp(formatCents(125_000))).toBe('R$ 1.250');
  });

  it('shows cents when there are any', () => {
    expect(nbsp(formatCents(125_050))).toBe('R$ 1.250,50');
  });
});

describe('parseBrlToCents', () => {
  it.each([
    ['1250', 125_000],
    ['1.250', 125_000],
    ['1.250,5', 125_050],
    ['R$ 1.250,50', 125_050],
    ['0,99', 99],
  ])('parses %s', (input, cents) => {
    expect(parseBrlToCents(input)).toBe(cents);
  });

  it.each(['', 'abc', '12,345', '-10', '1e3'])('rejects %s', (input) => {
    expect(parseBrlToCents(input)).toBeNull();
  });
});
