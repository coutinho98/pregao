import type { AuthUser } from '@pregao/shared';
import { ChevronDown, LogOut } from 'lucide-react';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@/components/ui/menu';
import { useLogout } from '../hooks/use-logout';
import { roleLabel } from '../role-labels';
import { AccountAvatar } from './account-avatar';
import { RoleBadge } from './role-badge';

/** Who is signed in, and as what: the avatar and role are always visible; the menu signs out. */
export function AccountMenu({ user }: { user: AuthUser }) {
  const logout = useLogout();

  return (
    <Menu>
      <MenuTrigger
        aria-label={`Conta: ${user.name}, ${roleLabel[user.role].toLowerCase()}`}
        className="group ml-1 flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors hover:bg-surface data-[state=open]:bg-surface"
      >
        <AccountAvatar name={user.name} role={user.role} />
        <span className="hidden flex-col items-start leading-tight sm:flex">
          <span className="max-w-[16ch] truncate text-[13.5px] font-medium text-ink">
            {user.name}
          </span>
          <span className="text-[11.5px] text-ink-3">{roleLabel[user.role]}</span>
        </span>
        <ChevronDown
          size={14}
          className="text-ink-3 transition-transform duration-200 ease-ios group-data-[state=open]:rotate-180"
        />
      </MenuTrigger>
      <MenuContent className="w-72">
        <div className="flex items-center gap-3 px-2.5 py-2">
          <AccountAvatar name={user.name} role={user.role} className="size-10 text-[13px]" />
          <span className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-[14px] font-medium text-ink">{user.name}</span>
            <span className="truncate text-[12.5px] text-ink-3">{user.email}</span>
            <RoleBadge role={user.role} className="self-start" />
          </span>
        </div>
        <MenuSeparator />
        <MenuItem onSelect={logout}>
          <LogOut size={16} className="mx-2" />
          Sair
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
