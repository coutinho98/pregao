import { Plus } from 'lucide-react';
import { Page } from '@/components/layout/page';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { useSession } from '@/features/auth/hooks/use-session';
import { greeting } from '@/utils/date';
import { LotWorkbench } from '../components/lot-workbench';
import { MyLots } from '../components/my-lots';
import { useOfficeTab } from '../hooks/use-office-tab';
import { officeTabs } from '../office-tabs';

export function OfficePage() {
  const { user } = useSession();
  const { tab, setTab } = useOfficeTab();

  return (
    <Page width="wide">
      <header className="mt-6 mb-8 max-w-[56ch] text-[15.5px] leading-[1.7] text-ink-2">
        <h1 className="sr-only">Escritório</h1>
        <p className="text-ink-3">
          {greeting()}
          {user && `, ${user.name.split(' ')[0]}`}.
        </p>
        <p className="mt-3">
          Acompanhe seus lotes ou monte um novo a partir do acervo do museu. A obra é copiada para a
          casa: o lote continua de pé mesmo se o museu sair do ar.
        </p>
      </header>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          id="office-tabs"
          label="Escritório"
          options={officeTabs}
          value={tab}
          onChange={setTab}
        />
        {tab === 'lotes' && (
          <Button variant="primary" size="pill" onClick={() => setTab('novo')}>
            <Plus size={17} /> Montar novo lote
          </Button>
        )}
      </div>
      {tab === 'lotes' && <MyLots onNewLot={() => setTab('novo')} />}
      {tab === 'novo' && <LotWorkbench onCreated={() => setTab('lotes')} />}
    </Page>
  );
}
