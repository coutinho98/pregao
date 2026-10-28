import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/errors';
import type { useCatalogSearch } from '../hooks/use-catalog-search';
import type { CatalogSelection } from './catalog-browser';
import { CatalogResultCard } from './catalog-result-card';

/** Columns follow the width the search has (container query), not the window. */
const RESULT_COLUMNS = 'grid-cols-2 @xl:grid-cols-3 @4xl:grid-cols-4';

interface CatalogResultsProps extends CatalogSelection {
  query: string;
  search: ReturnType<typeof useCatalogSearch>;
  onPage: (page: number) => void;
}

export function CatalogResults({
  query,
  search,
  selectedId,
  onSelect,
  onPage,
}: CatalogResultsProps) {
  if (search.isPending) {
    return (
      <div className={cn('grid gap-3', RESULT_COLUMNS)} aria-busy="true">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="tile h-[140px] rounded-[22px] motion-safe:animate-pulse" />
        ))}
      </div>
    );
  }
  if (search.isError) {
    return (
      <ErrorState message={errorMessage(search.error)} onRetry={() => void search.refetch()} />
    );
  }
  const { items, page, totalPages } = search.data;
  if (items.length === 0)
    return <EmptyState>Nenhuma obra em domínio público para “{query}”.</EmptyState>;

  return (
    <>
      <p className="px-1 text-[13.5px] text-ink-2">
        {selectedId
          ? 'Obra escolhida. Agora defina o lance e o prazo no passo 2.'
          : 'Clique na obra que você quer leiloar.'}
      </p>
      <ul className={cn('grid gap-x-3 gap-y-5', RESULT_COLUMNS)}>
        {items.map((item) => (
          <li key={item.externalId}>
            <CatalogResultCard
              item={item}
              selected={item.externalId === selectedId}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
      <nav aria-label="Páginas do acervo" className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft size={17} />
        </Button>
        <span className="tabular text-[13px] text-ink-2">
          {page} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Próxima página"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          <ChevronRight size={17} />
        </Button>
      </nav>
    </>
  );
}
