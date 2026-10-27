import { LotPhase } from '@pregao/shared';
import { Chip } from '@/components/ui/chip';
import { formatWhen, greeting } from '@/utils/date';
import { useLotPage } from '../hooks/use-lot-page';

const lotsLabel = (count: number) => (count === 1 ? '1 lote' : `${count} lotes`);

/** Conversational opening. Reuses the live-lots query the page already makes. */
export function ShowcaseIntro() {
  const { data } = useLotPage(LotPhase.LIVE, '');
  const live = data?.total ?? 0;
  const endingNext = data?.items[0];

  return (
    <section className="mt-6 mb-8 max-w-[52ch] text-[15.5px] leading-[1.7] text-ink-2">
      <p className="mb-4">{greeting()}.</p>
      {data && live > 0 && (
        <p>
          Há <Chip>{lotsLabel(live)}</Chip> em pregão agora
          {endingNext && (
            <>
              ; o próximo encerra às{' '}
              <Chip className="tabular">{formatWhen(endingNext.endsAt)}</Chip>
            </>
          )}
          . Escolha uma obra, deposite na carteira e levante sua raquete.
        </p>
      )}
      {data && live === 0 && (
        <p>
          Nenhum lote em pregão neste momento. Veja as{' '}
          <b className="font-[560] text-ink">próximas sessões</b> ou os lotes já encerrados.
        </p>
      )}
    </section>
  );
}
