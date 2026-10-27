import { Role } from '@pregao/shared';
import { paths } from '@/app/paths';

export const homePathByRole: Record<Role, string> = {
  [Role.AUCTIONEER]: paths.office,
  [Role.BIDDER]: paths.home,
};
