import { demoAccounts } from '../demo-accounts';
import { useDemoLogin } from '../hooks/use-demo-login';
import { DemoAccountItem } from './demo-account-item';

/** On the login page: the seeded accounts as one-click choices, below the regular form. */
export function DemoAccountPicker() {
  const { loginAs, pendingEmail } = useDemoLogin();
  return (
    <section aria-labelledby="demo-accounts-heading" className="mt-8">
      <h2 id="demo-accounts-heading" className="mb-1 text-[14px] font-semibold">
        Ou entre com uma conta de teste
      </h2>
      <p className="mb-3 text-[13px] text-ink-2">
        Contas criadas pela demonstração; todas usam a senha pregao123.
      </p>
      <ul className="flex flex-col gap-1.5">
        {demoAccounts.map((account) => (
          <li key={account.key}>
            <button
              type="button"
              onClick={() => loginAs(account)}
              disabled={pendingEmail !== null}
              className="flex w-full items-center gap-3 rounded-[14px] bg-surface px-3 py-2.5 text-left text-[13.5px] transition-colors hover:bg-surface-2 disabled:opacity-60"
            >
              <DemoAccountItem account={account} pending={pendingEmail === account.email} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
