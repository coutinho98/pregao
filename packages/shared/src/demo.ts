import { Role } from './roles';

/** Password of every account the demo seed creates (public on purpose: it is a demo). */
export const DEMO_PASSWORD = 'pregao123';

/** The accounts the demo seed creates, also offered as one-click logins in the app. */
export const DEMO_ACCOUNTS = {
  auctioneer: { name: 'Casa Verzeilão', email: 'leiloeiro@pregao.dev', role: Role.AUCTIONEER },
  ana: { name: 'Ana Martelinho', email: 'ana@pregao.dev', role: Role.BIDDER },
  bruno: { name: 'Bruno Dou-lhe-uma', email: 'bruno@pregao.dev', role: Role.BIDDER },
} as const;

export type DemoAccountKey = keyof typeof DEMO_ACCOUNTS;
