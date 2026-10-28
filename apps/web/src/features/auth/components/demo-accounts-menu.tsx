import { FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from '@/components/ui/menu';
import { demoAccounts } from '../demo-accounts';
import { useDemoLogin } from '../hooks/use-demo-login';
import { DemoAccountItem } from './demo-account-item';

/** For visitors: enter any seeded account in one click, without typing a password. */
export function DemoAccountsMenu() {
  const { loginAs, pendingEmail } = useDemoLogin();
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="secondary" size="sm" className="rounded-full" aria-label="Contas de teste">
          <FlaskConical size={15} />
          <span className="hidden sm:inline">Contas de teste</span>
        </Button>
      </MenuTrigger>
      <MenuContent className="w-80">
        <MenuLabel>Entrar com uma conta de teste</MenuLabel>
        {demoAccounts.map((account) => (
          <MenuItem key={account.key} onSelect={() => loginAs(account)}>
            <DemoAccountItem account={account} pending={pendingEmail === account.email} />
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}
