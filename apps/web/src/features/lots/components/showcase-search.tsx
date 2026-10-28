import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLiveSearch } from '@/lib/use-live-search';
import { QUERY_PARAM } from '../showcase-filters';

/** Searches the showcase as the visitor types; the query lives in the URL (?q=). */
export function ShowcaseSearch() {
  const { draft, type, searchNow } = useLiveSearch({ param: QUERY_PARAM, delayMs: 300 });

  return (
    <form role="search" onSubmit={searchNow} className="relative w-full sm:max-w-xs">
      <label htmlFor="showcase-q" className="sr-only">
        Buscar por obra ou artista
      </label>
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3"
      />
      <Input
        id="showcase-q"
        type="search"
        value={draft}
        onChange={(event) => type(event.target.value)}
        placeholder="Buscar obra ou artista"
        maxLength={100}
        className="pl-10"
      />
    </form>
  );
}
