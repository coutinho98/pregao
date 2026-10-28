import { LotPhase } from '@pregao/shared';
import { BlurIn } from '@/components/motion/blur-in';
import { formatWhen, greeting } from '@/utils/date';
import { countLabel } from '@/utils/plural';
import { useLotPage } from '../hooks/use-lot-page';
import { LotFan } from './lot-fan';

const FAN_SIZE = 4;

/** Opening of the showcase. Reuses the live and upcoming queries the page already makes. */
export function ShowcaseIntro() {
  const { data } = useLotPage(LotPhase.LIVE, '');
  const { data: upcoming } = useLotPage(LotPhase.SCHEDULED, '');
  const live = data?.total ?? 0;
  const endingNext = data?.items[0];
  const fan = [...(data?.items ?? []), ...(upcoming?.items ?? [])].slice(0, FAN_SIZE);

  return (
    <section className="mt-6 mb-12 grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_340px]">
      <BlurIn className="max-w-[52ch] text-[16px] leading-[1.65] text-ink-2">
        <p className="text-ink-3">{greeting()},</p>
        <p className="mt-5">
          Esta é a <b className="font-[560] text-ink">Pregão</b>, uma casa de leilões de obras em
          domínio público, vindas do acervo do Art Institute of Chicago.
        </p>
        {data && live > 0 && (
          <p className="mt-5">
            <b className="font-[560] text-ink">{countLabel(live, 'lote', 'lotes')}</b> em pregão
            agora
            {endingNext && (
              <>
                ; o próximo encerra às{' '}
                <b className="tabular font-[560] text-ink">{formatWhen(endingNext.endsAt)}</b>
              </>
            )}
            .
          </p>
        )}
        {data && live === 0 && (
          <p className="mt-5">
            Nenhum lote em pregão neste momento. Veja as{' '}
            <b className="font-[560] text-ink">próximas sessões</b> ou os lotes já encerrados.
          </p>
        )}
      </BlurIn>
      {fan.length > 0 && (
        <div className="order-first md:order-last">
          <LotFan lots={fan} />
        </div>
      )}
    </section>
  );
}
