/** Starting points for the search. The museum's catalogue is in English, so a Portuguese label
 * searches its English term ("Japão" looks for "Japan"). */
const SUGGESTIONS = [
  { label: 'Monet', query: 'Monet' },
  { label: 'Van Gogh', query: 'Van Gogh' },
  { label: 'Hokusai', query: 'Hokusai' },
  { label: 'Retratos', query: 'portrait' },
  { label: 'Paisagens', query: 'landscape' },
  { label: 'Japão', query: 'Japan' },
];

export function SearchSuggestions({ onPick }: { onPick: (query: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-1 text-[13.5px] text-ink-2">
      <span>Sem ideia? Experimente:</span>
      {SUGGESTIONS.map(({ label, query }) => (
        <button
          key={query}
          type="button"
          onClick={() => onPick(query)}
          className="h-8 rounded-full bg-chip px-3 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
