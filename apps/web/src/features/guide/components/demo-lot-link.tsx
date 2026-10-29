import type { PublicLotPhase } from '@pregao/shared';
import type { ReactNode } from 'react';
import { useLotPage } from '@/features/lots/hooks/use-lot-page';
import { showcaseUrl } from '@/features/lots/showcase-filters';
import { GuideLink } from './guide-link';

interface DemoLotLinkProps {
  phase: PublicLotPhase;
  /** Part of the title of the demo lot; empty takes the first lot of the tab. */
  search?: string;
  /** Where to go once the lot is found (its room or its audit). */
  to: (lotId: string) => string;
  children: ReactNode;
}

/**
 * A link to a lot of the demo, found by its title: lot ids change on every seed. Until the
 * lot is found, or if it no longer exists, it opens the showcase on the same search.
 */
export function DemoLotLink({ phase, search = '', to, children }: DemoLotLinkProps) {
  const lot = useLotPage(phase, search).data?.items[0];
  return <GuideLink to={lot ? to(lot.id) : showcaseUrl(phase, search)}>{children}</GuideLink>;
}
