import { Search } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Input } from '@/components/ui/input';
import { QUERY_PARAM } from '../showcase-filters';

/** How long typing has to pause before the showcase searches. */
const SEARCH_DELAY_MS = 300;

/** Searches the showcase as the visitor types; the query lives in the URL (?q=). */
export function ShowcaseSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get(QUERY_PARAM) ?? '';
  const [draft, setDraft] = useState(query);
  const [shownQuery, setShownQuery] = useState(query);
  const pending = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The URL can change without typing (Back, a shared link): show what is being searched.
  // Adjusted while rendering, as React recommends, instead of in an effect.
  if (query !== shownQuery) {
    setShownQuery(query);
    if (draft.trim() !== query) setDraft(query);
  }

  const apply = (value: string) => {
    clearTimeout(pending.current);
    // From the current URL, so a tab or order picked meanwhile is kept. Replace, so Back
    // leaves the showcase instead of undoing one letter at a time.
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(QUERY_PARAM, value);
        else next.delete(QUERY_PARAM);
        return next;
      },
      { replace: true },
    );
  };

  const type = (value: string) => {
    setDraft(value);
    clearTimeout(pending.current);
    pending.current = setTimeout(() => apply(value.trim()), SEARCH_DELAY_MS);
  };

  const searchNow = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    apply(draft.trim());
  };

  useEffect(() => () => clearTimeout(pending.current), []);

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
