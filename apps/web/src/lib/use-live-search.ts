import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

interface LiveSearchOptions {
  /** URL parameter that holds the query. */
  param: string;
  /** How long typing has to pause before searching. */
  delayMs: number;
  /** Other parameters to reset when the query changes (e.g. back to page 1). */
  resets?: string[];
}

/**
 * A search field that searches as the visitor types: the query lives in the URL, and is
 * written there once typing pauses, or at once on Enter. The URL is replaced, not pushed,
 * so Back leaves the page instead of undoing one letter at a time.
 */
export function useLiveSearch({ param, delayMs, resets = [] }: LiveSearchOptions) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get(param) ?? '';
  const [draft, setDraft] = useState(query);
  const [shownQuery, setShownQuery] = useState(query);
  const pending = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The URL can change without typing (Back, a shared link, a suggestion): show what is
  // being searched. Adjusted while rendering, as React recommends, instead of in an effect.
  if (query !== shownQuery) {
    setShownQuery(query);
    if (draft.trim() !== query) setDraft(query);
  }

  const apply = (value: string) => {
    clearTimeout(pending.current);
    // From the current URL, so filters picked meanwhile are kept.
    setSearchParams(
      (current) => {
        if ((current.get(param) ?? '') === value) return current;
        const next = new URLSearchParams(current);
        if (value) next.set(param, value);
        else next.delete(param);
        for (const reset of resets) next.delete(reset);
        return next;
      },
      { replace: true },
    );
  };

  const type = (value: string) => {
    setDraft(value);
    clearTimeout(pending.current);
    pending.current = setTimeout(() => apply(value.trim()), delayMs);
  };

  const searchNow = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    apply(draft.trim());
  };

  useEffect(() => () => clearTimeout(pending.current), []);

  return { query, draft, type, searchNow, apply };
}
