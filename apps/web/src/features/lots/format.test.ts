import { describe, expect, it } from 'vitest';
import { formatDimensions } from './format';

describe('formatDimensions', () => {
  it('keeps the work in centimetres, without inches or frame', () => {
    expect(
      formatDimensions(
        '89.9 × 94.1 cm (35 3/8 × 37 1/16 in.); Framed: 103.2 × 107 × 5.8 cm (40 5/8 × 42 1/8 in.)',
      ),
    ).toBe('89,9 × 94,1 cm');
  });

  it('leaves a plain size alone', () => {
    expect(formatDimensions('73 × 92 cm')).toBe('73 × 92 cm');
  });
});
