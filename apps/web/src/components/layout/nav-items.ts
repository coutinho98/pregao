import { Role } from '@pregao/shared';
import { paths } from '@/app/paths';

export interface NavItem {
  to: string;
  label: string;
}

const showcase: NavItem = { to: paths.home, label: 'Vitrine' };

export const navItemsByAudience: Record<Role | 'GUEST', NavItem[]> = {
  GUEST: [showcase],
  [Role.BIDDER]: [
    showcase,
    { to: paths.wallet, label: 'Carteira' },
    { to: paths.myBids, label: 'Meus arremates' },
  ],
  [Role.AUCTIONEER]: [showcase, { to: paths.office, label: 'Escritório' }],
};
