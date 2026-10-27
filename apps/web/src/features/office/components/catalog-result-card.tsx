import type { CatalogItem } from '@pregao/shared';
import { Check, Plus } from 'lucide-react';
import { ArtworkTile } from '@/components/artwork/artwork-tile';
import { cn } from '@/lib/cn';
import { catalogThumbnailUrl } from '../api';

interface CatalogResultCardProps {
  item: CatalogItem;
  selected: boolean;
  onSelect: (item: CatalogItem) => void;
}

export function CatalogResultCard({ item, selected, onSelect }: CatalogResultCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-pressed={selected}
      className="group block w-full text-left"
    >
      <ArtworkTile
        src={catalogThumbnailUrl(item.externalId)}
        alt={item.altText ?? item.title}
        size="sm"
        className={cn('transition-shadow', selected && 'shadow-[0_0_0_2px_var(--ink)]')}
        corner={selected ? <Check size={15} /> : <Plus size={15} />}
      />
      <span className="mt-2 block truncate px-0.5 text-[13.5px] font-semibold">{item.title}</span>
      <span className="block truncate px-0.5 text-[12px] text-ink-3">
        {[item.artist, item.dateDisplay].filter(Boolean).join(', ')}
      </span>
    </button>
  );
}
