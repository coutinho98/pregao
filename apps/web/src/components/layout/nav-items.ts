import { Role } from '@pregao/shared';
import { Briefcase, LayoutGrid, LogIn, type LucideIcon, Ticket, Wallet } from 'lucide-react';
import { paths } from '@/app/paths';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  matches: (pathname: string) => boolean;
}

const showcase: NavItem = {
  to: paths.home,
  label: 'Vitrine',
  icon: LayoutGrid,
  matches: (pathname) => pathname === paths.home || pathname.startsWith('/lotes'),
};

const startsWith = (prefix: string) => (pathname: string) => pathname.startsWith(prefix);

export const navItemsByAudience: Record<Role | 'GUEST', NavItem[]> = {
  GUEST: [
    showcase,
    { to: paths.login, label: 'Entrar', icon: LogIn, matches: startsWith(paths.login) },
  ],
  [Role.BIDDER]: [
    showcase,
    { to: paths.wallet, label: 'Carteira', icon: Wallet, matches: startsWith(paths.wallet) },
    { to: paths.myBids, label: 'Arremates', icon: Ticket, matches: startsWith(paths.myBids) },
  ],
  [Role.AUCTIONEER]: [
    showcase,
    { to: paths.office, label: 'Escritório', icon: Briefcase, matches: startsWith(paths.office) },
  ],
};
