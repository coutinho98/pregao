import type { CatalogItem } from '@pregao/shared';
import { Check, Plus } from 'lucide-react';
import { ArtworkImage } from '@/components/artwork/artwork-image';
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
      <ArtworkImage
        src={catalogThumbnailUrl(item.externalId)}
        alt={item.altText ?? item.title}
        size="sm"
        corner={selected ? <Check size={15} /> : <Plus size={15} />}
      />
      <span
        className={cn(
          'artwork-title mt-2 block truncate px-0.5 text-[15px] underline-offset-4',
          selected && 'underline decoration-2',
        )}
      >
        {item.title}
      </span>
      <span className="block truncate px-0.5 text-[12px] text-ink-3">
        {[item.artist, item.dateDisplay].filter(Boolean).join(', ')}
      </span>
    </button>
  );
}
