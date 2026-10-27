import type { CatalogItem } from '@pregao/shared';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MIN_CATALOG_QUERY_LENGTH, useCatalogSearch } from '../hooks/use-catalog-search';
import { CatalogResults } from './catalog-results';

const QUERY_PARAM = 'busca';
const PAGE_PARAM = 'pagina';

export interface CatalogSelection {
  selectedId: string | null;
  onSelect: (item: CatalogItem) => void;
}

/** Searches the museum's public-domain collection. Query and page live in the URL. */
export function CatalogBrowser({ selectedId, onSelect }: CatalogSelection) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get(QUERY_PARAM) ?? '';
  const page = Math.max(1, Number(searchParams.get(PAGE_PARAM)) || 1);
  const search = useCatalogSearch(query, page);

  const goTo = (nextQuery: string, nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set(QUERY_PARAM, nextQuery);
    next.set(PAGE_PARAM, String(nextPage));
    setSearchParams(next);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    goTo(String(new FormData(event.currentTarget).get(QUERY_PARAM) ?? '').trim(), 1);
  };

  return (
    <section aria-labelledby="catalog-heading" className="flex flex-col gap-5">
      <h2 id="catalog-heading" className="text-2xl">
        Acervo do Art Institute of Chicago
      </h2>
      <form role="search" onSubmit={submit} className="flex gap-2">
        <label htmlFor="catalog-q" className="sr-only">
          Buscar obra, artista ou movimento
        </label>
        <Input
          key={query}
          id="catalog-q"
          name={QUERY_PARAM}
          type="search"
          defaultValue={query}
          placeholder="Ex.: Monet, retrato, Japão"
          minLength={MIN_CATALOG_QUERY_LENGTH}
          maxLength={100}
        />
        <Button type="submit">Buscar</Button>
      </form>
      <CatalogResults
        query={query}
        search={search}
        selectedId={selectedId}
        onSelect={onSelect}
        onPage={(nextPage) => goTo(query, nextPage)}
      />
    </section>
  );
}
