import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { errorMessage } from '@/lib/errors';
import { useLotPage } from '../hooks/use-lot-page';
import type { ShowcaseSection } from '../showcase-filters';
import { SalonWall } from './salon-wall';
import { SalonWallSkeleton } from './salon-wall-skeleton';

interface WallSectionProps {
  section: ShowcaseSection;
  query: string;
}

export function WallSection({ section, query }: WallSectionProps) {
  const { data, isPending, isError, error, refetch } = useLotPage(section.phase, query);
  const headingId = `wall-${section.slug}`;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-6">
      <h2 id={headingId} className="text-2xl">
        {section.title}
        {data && data.total > 0 && (
          <span className="tabular ml-3 font-label text-lg font-semibold text-nevoa-texto">
            {data.total}
          </span>
        )}
      </h2>
      <WallContent
        isPending={isPending}
        error={isError ? errorMessage(error) : null}
        onRetry={() => void refetch()}
        empty={query ? `Nenhum lote encontrado para “${query}”.` : section.empty}
        lots={data?.items ?? []}
      />
    </section>
  );
}

interface WallContentProps {
  isPending: boolean;
  error: string | null;
  onRetry: () => void;
  empty: string;
  lots: Parameters<typeof SalonWall>[0]['lots'];
}

function WallContent({ isPending, error, onRetry, empty, lots }: WallContentProps) {
  if (isPending) return <SalonWallSkeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (lots.length === 0) return <EmptyState>{empty}</EmptyState>;
  return <SalonWall lots={lots} />;
}
