import { describe, expect, it } from 'vitest';
import { officeTabFromParam } from './office-tabs';

describe('officeTabFromParam', () => {
  it('opens the tab named in the URL', () => {
    expect(officeTabFromParam('novo')).toBe('novo');
    expect(officeTabFromParam('lotes')).toBe('lotes');
  });

  it("falls back to the auctioneer's lots for a missing or unknown tab", () => {
    expect(officeTabFromParam(null)).toBe('lotes');
    expect(officeTabFromParam('qualquer')).toBe('lotes');
  });
});
