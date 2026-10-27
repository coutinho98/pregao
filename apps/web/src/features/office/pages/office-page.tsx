import { Page } from '@/components/layout/page';
import { useSession } from '@/features/auth/hooks/use-session';
import { greeting } from '@/utils/date';
import { LotWorkbench } from '../components/lot-workbench';
import { MyLots } from '../components/my-lots';

export function OfficePage() {
  const { user } = useSession();
  return (
    <Page width="wide">
      <section className="mt-6 mb-8 max-w-[52ch] text-[15.5px] leading-[1.7] text-ink-2">
        <h1 className="sr-only">Escritório</h1>
        <p className="mb-4">
          {greeting()}
          {user && `, ${user.name.split(' ')[0]}`}.
        </p>
        <p>
          Busque uma obra em domínio público no acervo do museu, defina o lance inicial e o prazo. A
          obra é copiada para a casa: o lote continua de pé mesmo se o museu sair do ar.
        </p>
      </section>
      <LotWorkbench />
      <section aria-labelledby="my-lots-heading" className="mt-12 max-w-[720px]">
        <h2
          id="my-lots-heading"
          className="mb-3 px-1 text-[13px] font-medium tracking-normal text-ink-3"
        >
          Seus lotes
        </h2>
        <MyLots />
      </section>
    </Page>
  );
}
