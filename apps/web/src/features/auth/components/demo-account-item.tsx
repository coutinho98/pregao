import { Loader2 } from 'lucide-react';
import type { DemoAccount } from '../demo-accounts';
import { AccountAvatar } from './account-avatar';
import { RoleBadge } from './role-badge';

/** Avatar, name, role and what the account is for: the content of a test-account choice. */
export function DemoAccountItem({ account, pending }: { account: DemoAccount; pending: boolean }) {
  return (
    <>
      <AccountAvatar name={account.name} role={account.role} />
      <span className="flex min-w-0 grow flex-col">
        <span className="flex items-center gap-2">
          <span className="truncate font-medium text-ink">{account.name}</span>
          <RoleBadge role={account.role} />
        </span>
        <span className="truncate text-[12.5px] text-ink-3">{account.hint}</span>
      </span>
      {pending && <Loader2 size={15} className="shrink-0 animate-spin text-ink-3" />}
    </>
  );
}
