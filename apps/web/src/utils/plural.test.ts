import { describe, expect, it } from 'vitest';
import { countLabel, pluralize } from './plural';

describe('pluralize', () => {
  it('uses the singular only for exactly one', () => {
    expect(pluralize(1, 'lance', 'lances')).toBe('lance');
    expect(pluralize(0, 'lance', 'lances')).toBe('lances');
    expect(pluralize(2, 'lance', 'lances')).toBe('lances');
  });
});

describe('countLabel', () => {
  it('puts the count before the word', () => {
    expect(countLabel(1, 'lote', 'lotes')).toBe('1 lote');
    expect(countLabel(3, 'lote', 'lotes')).toBe('3 lotes');
  });
});
