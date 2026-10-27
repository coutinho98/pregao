import { DepositForm } from '../components/deposit-form';
import { LedgerBook } from '../components/ledger-book';
import { WalletBalance } from '../components/wallet-balance';

export function WalletPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-10">
      <h1 className="text-3xl md:text-4xl">Carteira</h1>
      <WalletBalance />
      <div className="grid gap-12 md:grid-cols-[20rem_1fr]">
        <section aria-labelledby="deposit-heading" className="flex flex-col gap-4">
          <h2 id="deposit-heading" className="text-2xl">
            Depositar
          </h2>
          <DepositForm />
        </section>
        <section aria-labelledby="ledger-heading" className="flex flex-col gap-4">
          <h2 id="ledger-heading" className="text-2xl">
            Livro-caixa
          </h2>
          <LedgerBook />
        </section>
      </div>
    </div>
  );
}
