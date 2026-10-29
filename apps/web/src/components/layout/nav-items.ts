import { Role } from '@pregao/shared';
import {
  Briefcase,
  Compass,
  LayoutGrid,
  LogIn,
  type LucideIcon,
  Ticket,
  Wallet,
} from 'lucide-react';
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

const guide: NavItem = {
  to: paths.guide,
  label: 'Como funciona',
  icon: Compass,
  matches: startsWith(paths.guide),
};

export const navItemsByAudience: Record<Role | 'GUEST', NavItem[]> = {
  GUEST: [
    showcase,
    guide,
    { to: paths.login, label: 'Entrar', icon: LogIn, matches: startsWith(paths.login) },
  ],
  [Role.BIDDER]: [
    showcase,
    { to: paths.wallet, label: 'Carteira', icon: Wallet, matches: startsWith(paths.wallet) },
    { to: paths.myBids, label: 'Arremates', icon: Ticket, matches: startsWith(paths.myBids) },
    guide,
  ],
  [Role.AUCTIONEER]: [
    showcase,
    { to: paths.office, label: 'Escritório', icon: Briefcase, matches: startsWith(paths.office) },
    guide,
  ],
};
