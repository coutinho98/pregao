import { Page } from '@/components/layout/page';
import { DepositForm } from '../components/deposit-form';
import { LedgerBook } from '../components/ledger-book';
import { WalletBalance } from '../components/wallet-balance';

export function WalletPage() {
  return (
    <Page>
      <section className="mt-6 mb-6 text-[15.5px] leading-[1.7] text-ink-2">
        <h1 className="mb-3 text-[30px] text-ink">Carteira</h1>
        <p>
          Quando você lidera um lote, o valor do lance fica{' '}
          <b className="font-[560] text-ink">comprometido</b>; se alguém cobrir, ele volta na hora
          para o disponível.
        </p>
      </section>
      <WalletBalance />
      <h2 className="mt-8 mb-3 px-1 text-[13px] font-medium tracking-normal text-ink-3">
        Depositar
      </h2>
      <DepositForm />
      <h2 className="mt-8 mb-3 px-1 text-[13px] font-medium tracking-normal text-ink-3">Extrato</h2>
      <LedgerBook />
    </Page>
  );
}
