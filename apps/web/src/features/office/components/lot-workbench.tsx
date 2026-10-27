import type { CatalogItem } from '@pregao/shared';
import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { CatalogBrowser } from './catalog-browser';
import { LotComposer } from './lot-composer';

/** Pick an artwork on the left, compose the lot on the right. */
export function LotWorkbench() {
  const [selected, setSelected] = useState<CatalogItem | null>(null);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem]">
      <CatalogBrowser selectedId={selected?.externalId ?? null} onSelect={setSelected} />
      <aside className="lg:sticky lg:top-6 lg:self-start">
        {selected ? (
          <LotComposer key={selected.externalId} item={selected} onDone={() => setSelected(null)} />
        ) : (
          <EmptyState>Escolha uma obra do acervo para montar o lote.</EmptyState>
        )}
      </aside>
    </div>
  );
}
