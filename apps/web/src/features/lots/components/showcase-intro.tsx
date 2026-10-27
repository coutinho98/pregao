import { LotPhase } from '@pregao/shared';
import { BlurIn } from '@/components/motion/blur-in';
import { Chip } from '@/components/ui/chip';
import { SelectionMark } from '@/components/ui/selection-mark';
import { formatWhen, greeting } from '@/utils/date';
import { useLotPage } from '../hooks/use-lot-page';
import { GavelCall } from './gavel-call';

const lotsLabel = (count: number) => (count === 1 ? '1 lote' : `${count} lotes`);

/** Opening of the showcase. Reuses the live-lots query the page already makes. */
export function ShowcaseIntro() {
  const { data } = useLotPage(LotPhase.LIVE, '');
  const live = data?.total ?? 0;
  const endingNext = data?.items[0];

  return (
    <section className="mt-6 mb-10 grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_260px]">
      <div className="max-w-[56ch]">
        <BlurIn as="p" className="mb-3 text-[15.5px] text-ink-3">
          {greeting()},
        </BlurIn>
        <BlurIn as="h1" delay={0.08} className="text-[30px] leading-[1.25] text-ink sm:text-[36px]">
          esta é a{' '}
          <span className="font-[family-name:var(--font-serif)] font-medium italic">Pregão</span>,
          uma casa de leilões de <SelectionMark>obras-primas</SelectionMark> em domínio público.
        </BlurIn>
        <BlurIn as="div" delay={0.18} className="mt-5 text-[15.5px] leading-[1.7] text-ink-2">
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
        </BlurIn>
      </div>
      <BlurIn delay={0.28} className="hidden md:block">
        <GavelCall />
      </BlurIn>
    </section>
  );
}
