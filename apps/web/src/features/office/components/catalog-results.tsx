import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { Button } from '@/components/ui/button';
import { errorMessage } from '@/lib/errors';
import { MIN_CATALOG_QUERY_LENGTH, type useCatalogSearch } from '../hooks/use-catalog-search';
import type { CatalogSelection } from './catalog-browser';
import { CatalogResultCard } from './catalog-result-card';

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
  if (query.length < MIN_CATALOG_QUERY_LENGTH) {
    return (
      <EmptyState>
        Busque no acervo para escolher a obra do próximo lote. Só aparecem obras em domínio público.
      </EmptyState>
    );
  }
  if (search.isPending) return <p className="text-nevoa-texto">Consultando o acervo do museu…</p>;
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
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
      <nav aria-label="Páginas do acervo" className="flex items-center gap-3">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Anterior
        </Button>
        <span className="tabular font-label text-base">
          Página {page} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          Próxima
        </Button>
      </nav>
    </>
  );
}
