import type { LotSort, LotSummary } from '@pregao/shared';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { errorMessage } from '@/lib/errors';
import { useLotPage } from '../hooks/use-lot-page';
import type { ShowcaseSection } from '../showcase-filters';
import { LotGrid, LotGridSkeleton } from './lot-grid';

interface WallSectionProps {
  section: ShowcaseSection;
  query: string;
  sort: LotSort;
}

export function WallSection({ section, query, sort }: WallSectionProps) {
  const { data, isPending, isError, error, refetch } = useLotPage(section.phase, query, sort);

  return (
    <section aria-label={section.label}>
      <SectionContent
        isPending={isPending}
        error={isError ? errorMessage(error) : null}
        onRetry={() => void refetch()}
        empty={query ? `Nenhum lote encontrado para “${query}”.` : section.empty}
        lots={data?.items ?? []}
      />
    </section>
  );
}

interface SectionContentProps {
  isPending: boolean;
  error: string | null;
  onRetry: () => void;
  empty: string;
  lots: LotSummary[];
}

function SectionContent({ isPending, error, onRetry, empty, lots }: SectionContentProps) {
  if (isPending) return <LotGridSkeleton />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (lots.length === 0) return <EmptyState>{empty}</EmptyState>;
  return <LotGrid lots={lots} />;
}
