import { LotPhase } from '@pregao/shared';
import { paths } from '@/app/paths';
import { Page } from '@/components/layout/page';
import { BlurIn } from '@/components/motion/blur-in';
import { API_URL } from '@/lib/env';
import { AccountStep } from '../components/account-step';
import { DemoLotLink } from '../components/demo-lot-link';
import { GuideStep } from '../components/guide-step';

const textLink = 'font-[560] text-ink underline-offset-4 hover:underline';

/** A short tour of the house for first-time visitors, with a link to try each step. */
export function GuidePage() {
  return (
    <Page>
      <BlurIn className="mt-6 mb-6">
        <h1 className="text-[28px] leading-tight">Como funciona</h1>
        <p className="mt-3 text-[15.5px] leading-[1.65] text-ink-2">
          Leilões ao vivo de obras em domínio público, com dinheiro de mentira e um histórico que
          qualquer pessoa pode auditar. Quatro passos mostram tudo.
        </p>
      </BlurIn>

      <ol>
        <AccountStep number={1} />
        <GuideStep
          number={2}
          title="Dispute um lote ao vivo"
          actions={
            <DemoLotLink phase={LotPhase.LIVE} to={paths.lot}>
              Abrir um lote em pregão
            </DemoLotLink>
          }
        >
          <p>
            Abra a sala em duas janelas, uma como Ana e outra como Bruno: os lances chegam na hora.
            Seu lance fica comprometido na carteira enquanto você lidera, e um lance nos últimos 2
            minutos prorroga o fim.
          </p>
        </GuideStep>
        <GuideStep
          number={3}
          title="Arremate e compartilhe o comprovante"
          actions={
            <DemoLotLink phase={LotPhase.ENDED} search="Paris Street" to={paths.lot}>
              Ver um lote arrematado
            </DemoLotLink>
          }
        >
          <p>No fim, o vencedor paga e recebe um comprovante público, sem nome nem e-mail.</p>
        </GuideStep>
        <GuideStep
          number={4}
          title="Tente achar a fraude"
          actions={
            <>
              <DemoLotLink phase={LotPhase.ENDED} search="Sainte-Adresse" to={paths.audit}>
                Valor alterado
              </DemoLotLink>
              <DemoLotLink phase={LotPhase.ENDED} search="Moulin Rouge" to={paths.audit}>
                Lance apagado
              </DemoLotLink>
              <DemoLotLink phase={LotPhase.ENDED} search="Stacks of Wheat" to={paths.audit}>
                Comprovante falso
              </DemoLotLink>
            </>
          }
        >
          <p>
            Três lotes foram adulterados direto no banco. A auditoria refaz as contas no seu
            navegador e aponta o lance onde a cadeia quebrou.
          </p>
        </GuideStep>
      </ol>

      <p className="border-t border-line pt-5 text-[13.5px] text-ink-3">
        Por dentro:{' '}
        <a href={`${API_URL}/docs`} target="_blank" rel="noreferrer" className={textLink}>
          documentação da API
        </a>{' '}
        e{' '}
        <a
          href="https://github.com/coutinho98/pregao"
          target="_blank"
          rel="noreferrer"
          className={textLink}
        >
          código no GitHub
        </a>
        .
      </p>
    </Page>
  );
}
