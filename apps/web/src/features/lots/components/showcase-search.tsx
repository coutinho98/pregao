import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { Button } from '@/components/ui/button';
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
    <form role="search" onSubmit={search} className="flex w-full max-w-md gap-2">
      <label htmlFor="showcase-q" className="sr-only">
        Buscar por obra ou artista
      </label>
      <Input
        key={query}
        id="showcase-q"
        name={QUERY_PARAM}
        type="search"
        defaultValue={query}
        placeholder="Obra ou artista"
        maxLength={100}
      />
      <Button type="submit" variant="outline">
        Buscar
      </Button>
    </form>
  );
}
