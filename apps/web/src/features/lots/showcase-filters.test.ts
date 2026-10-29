import { LotPhase } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { showcaseUrl } from './showcase-filters';

describe('showcaseUrl', () => {
  it('opens the tab of the phase', () => {
    expect(showcaseUrl(LotPhase.LIVE)).toBe('/?fase=pregao');
  });

  it('carries the search, encoded', () => {
    expect(showcaseUrl(LotPhase.ENDED, 'Stacks of Wheat')).toBe(
      '/?fase=encerrados&q=Stacks+of+Wheat',
    );
  });
});
