import { cn } from '@/lib/cn';

interface ArtworkFrameProps {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
  className?: string;
  priority?: boolean;
}

/** Thin brass frame with a paper mat, keeping the artwork's real proportions (no cropping). */
export function ArtworkFrame({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
}: ArtworkFrameProps) {
  const aspectRatio = width && height ? `${width} / ${height}` : undefined;
  return (
    <div className={cn('border border-latao bg-papel p-2', className)}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{ aspectRatio }}
        className="block h-auto w-full bg-nevoa/20 object-contain"
      />
    </div>
  );
}
