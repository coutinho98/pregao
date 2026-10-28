import type { CatalogItem } from '@pregao/shared';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { CatalogBrowser } from './catalog-browser';
import { LotComposer } from './lot-composer';
import { LotSteps } from './lot-steps';

/** Below this width step 2 sits under the results instead of beside them (Tailwind `lg`). */
const STACKED_QUERY = '(max-width: 1023px)';

/**
 * Two steps: pick an artwork, then set its price and schedule. The second column only
 * appears once there is an artwork to compose, so the search starts with the full width.
 */
export function LotWorkbench({ onCreated }: { onCreated: () => void }) {
  const [selected, setSelected] = useState<CatalogItem | null>(null);
  const composerRef = useRef<HTMLElement>(null);

  // On phones step 2 opens below the results; bring it into view so it is not missed.
  useEffect(() => {
    if (selected && window.matchMedia(STACKED_QUERY).matches) {
      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selected]);

  return (
    <>
      <LotSteps current={selected ? 2 : 1} />
      <div className={cn('grid gap-8', selected && 'lg:grid-cols-[minmax(0,1fr)_24rem]')}>
        <CatalogBrowser selectedId={selected?.externalId ?? null} onSelect={setSelected} />
        {selected && (
          <aside ref={composerRef} className="scroll-mt-6 lg:sticky lg:top-8 lg:self-start">
            <LotComposer
              key={selected.externalId}
              item={selected}
              onCancel={() => setSelected(null)}
              onCreated={onCreated}
            />
          </aside>
        )}
      </div>
    </>
  );
}
