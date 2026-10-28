const SUGGESTIONS = ['Monet', 'Van Gogh', 'Hokusai', 'retrato', 'paisagem', 'Japão'];

/** A few starting points for the search, instead of an empty box. */
export function SearchSuggestions({ onPick }: { onPick: (query: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-1 text-[13.5px] text-ink-2">
      <span>Sem ideia? Experimente:</span>
      {SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onPick(suggestion)}
          className="h-8 rounded-full bg-chip px-3 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
