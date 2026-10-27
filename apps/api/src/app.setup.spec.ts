import { describe, expect, it } from 'vitest';
import { parseCorsOrigins } from './app.setup.js';

describe('parseCorsOrigins', () => {
  it('splits, trims and drops trailing slashes', () => {
    expect(parseCorsOrigins(' https://a.com/ , http://localhost:5173,')).toEqual([
      'https://a.com',
      'http://localhost:5173',
    ]);
  });
});
