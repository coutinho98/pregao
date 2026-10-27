const PLACEHOLDER_HEIGHTS = ['h-64', 'h-48', 'h-72', 'h-56'];

export function SalonWallSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando lotes"
      className="columns-1 gap-10 sm:columns-2 lg:columns-3 xl:columns-4"
    >
      {PLACEHOLDER_HEIGHTS.map((height) => (
        <div key={height} className="mb-12 break-inside-avoid">
          <div
            className={`${height} border border-nevoa/40 bg-nevoa/10 motion-safe:animate-pulse`}
          />
          <div className="mt-3 h-24 w-40 rounded-xs bg-latao/30" />
        </div>
      ))}
    </div>
  );
}
