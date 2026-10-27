import { Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { Input } from '@/components/ui/input';
import { QUERY_PARAM } from '../showcase-filters';

export function ShowcaseSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get(QUERY_PARAM) ?? '';

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get(QUERY_PARAM) ?? '').trim();
    const next = new URLSearchParams(searchParams);
    if (value) next.set(QUERY_PARAM, value);
    else next.delete(QUERY_PARAM);
    setSearchParams(next);
  };

  return (
    <form role="search" onSubmit={search} className="relative w-full sm:max-w-xs">
      <label htmlFor="showcase-q" className="sr-only">
        Buscar por obra ou artista
      </label>
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3"
      />
      <Input
        key={query}
        id="showcase-q"
        name={QUERY_PARAM}
        type="search"
        defaultValue={query}
        placeholder="Buscar obra ou artista"
        maxLength={100}
        className="pl-10"
      />
    </form>
  );
}
