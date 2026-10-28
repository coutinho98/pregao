import type { CatalogItem } from '@pregao/shared';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLiveSearch } from '@/lib/use-live-search';
import { MIN_CATALOG_QUERY_LENGTH, useCatalogSearch } from '../hooks/use-catalog-search';
import { CatalogResults } from './catalog-results';
import { SearchSuggestions } from './search-suggestions';
import { SectionHeading } from './section-heading';

const QUERY_PARAM = 'busca';
const PAGE_PARAM = 'pagina';

export interface CatalogSelection {
  selectedId: string | null;
  onSelect: (item: CatalogItem) => void;
}

/**
 * Pause before searching the museum. Longer than the showcase's: every search is a call to
 * the museum, which allows 60 a minute (repeated searches come from the API's cache).
 */
const SEARCH_DELAY_MS = 500;

/** Searches the museum's public-domain collection as the auctioneer types. Query and page live in the URL. */
export function CatalogBrowser({ selectedId, onSelect }: CatalogSelection) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { query, draft, type, searchNow, apply } = useLiveSearch({
    param: QUERY_PARAM,
    delayMs: SEARCH_DELAY_MS,
    resets: [PAGE_PARAM],
  });
  const page = Math.max(1, Number(searchParams.get(PAGE_PARAM)) || 1);
  const search = useCatalogSearch(query, page);

  const goToPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set(PAGE_PARAM, String(nextPage));
    setSearchParams(next);
  };

  return (
    <section aria-labelledby="catalog-heading" className="@container flex flex-col gap-4">
      <SectionHeading
        id="catalog-heading"
        hint="Busque por artista, tema ou lugar no acervo do Art Institute of Chicago. O acervo é em inglês: use termos como portrait, landscape ou Japan. Só aparecem obras em domínio público, que a casa pode leiloar."
      >
        Escolha a obra
      </SectionHeading>
      <form role="search" onSubmit={searchNow} className="relative">
        <label htmlFor="catalog-q" className="sr-only">
          Buscar obra, artista ou movimento
        </label>
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3"
        />
        <Input
          id="catalog-q"
          type="search"
          value={draft}
          onChange={(event) => type(event.target.value)}
          placeholder="Ex.: Monet, portrait, Japan"
          minLength={MIN_CATALOG_QUERY_LENGTH}
          maxLength={100}
          className="pr-[6.5rem] pl-10"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full px-4"
        >
          Buscar
        </Button>
      </form>
      {query.length < MIN_CATALOG_QUERY_LENGTH ? (
        <SearchSuggestions onPick={apply} />
      ) : (
        <CatalogResults
          query={query}
          search={search}
          selectedId={selectedId}
          onSelect={onSelect}
          onPage={goToPage}
        />
      )}
    </section>
  );
}
