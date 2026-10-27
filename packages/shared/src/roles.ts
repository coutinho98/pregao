export const Role = {
  AUCTIONEER: 'AUCTIONEER',
  BIDDER: 'BIDDER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLES = Object.values(Role);
