import type { CatalogItem } from '@pregao/shared';
import { ArtworkFrame } from '@/components/artwork/artwork-frame';
import { cn } from '@/lib/cn';

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
      className={cn(
        'flex w-full flex-col gap-2 rounded-xs p-2 text-left transition-colors hover:bg-tinta/5',
        selected && 'bg-latao/15 outline-2 outline-latao',
      )}
    >
      <ArtworkFrame
        src={item.thumbnailUrl}
        alt={item.altText ?? item.title}
        width={item.imageWidth}
        height={item.imageHeight}
      />
      <span className="line-clamp-2 font-serif text-sm italic">{item.title}</span>
      <span className="font-label text-sm text-nevoa-texto">
        {[item.artist, item.dateDisplay].filter(Boolean).join(', ')}
      </span>
    </button>
  );
}
