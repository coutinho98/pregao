import { MyBidResult } from '@pregao/shared';
import { useSearchParams } from 'react-router';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { Page } from '@/components/layout/page';
import { Chip } from '@/components/ui/chip';
import { Segmented } from '@/components/ui/segmented';
import { errorMessage } from '@/lib/errors';
import { countLabel } from '@/utils/plural';
import { MyBidRow } from '../components/my-bid-row';
import { useMyBids } from '../hooks/use-my-bids';
import { ALL, filterMyBids, myBidFilters } from '../my-bid-filters';

const FILTER_PARAM = 'situacao';
const options = [
  { value: ALL, label: 'Todos' },
  ...myBidFilters.map(({ slug, label }) => ({ value: slug, label })),
];
const lots = (count: number) => countLabel(count, 'lote', 'lotes');

export function MyBidsPage() {
  const myBids = useMyBids();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get(FILTER_PARAM) ?? ALL;

  const entries = myBids.data ?? [];
  const count = (result: MyBidResult) => entries.filter((entry) => entry.result === result).length;
  const visible = filterMyBids(entries, filter);

  return (
    <Page>
      <section className="mt-6 mb-6 text-[15.5px] leading-[1.7] text-ink-2">
        <h1 className="mb-3 text-[30px] text-ink">Meus arremates</h1>
        {myBids.data && entries.length > 0 && (
          <p>
            Você está liderando <Chip>{lots(count(MyBidResult.LEADING))}</Chip>, foi superado em{' '}
            <Chip>{lots(count(MyBidResult.OUTBID))}</Chip> e já arrematou{' '}
            <Chip>{lots(count(MyBidResult.WON))}</Chip>.
          </p>
        )}
      </section>

      <Segmented
        id="my-bids"
        label="Filtrar por situação"
        options={options}
        value={filter}
        onChange={(value) =>
          setSearchParams(value === ALL ? {} : { [FILTER_PARAM]: value }, { replace: true })
        }
        wide
      />

      <div className="mt-5">
        {myBids.isPending && <p className="text-[14px] text-ink-3">Carregando seus lances…</p>}
        {myBids.isError && (
          <ErrorState message={errorMessage(myBids.error)} onRetry={() => void myBids.refetch()} />
        )}
        {myBids.data && entries.length === 0 && (
          <EmptyState>Você ainda não deu nenhum lance. Escolha uma obra na vitrine.</EmptyState>
        )}
        {myBids.data && entries.length > 0 && visible.length === 0 && (
          <EmptyState>Nenhum lote nesta situação.</EmptyState>
        )}
        {visible.length > 0 && (
          <ul className="border-t border-line">
            {visible.map((entry) => (
              <MyBidRow key={entry.lot.id} entry={entry} />
            ))}
          </ul>
        )}
      </div>
    </Page>
  );
}
