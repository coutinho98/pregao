import { DEMO_ACCOUNTS, type DemoAccountKey } from '@pregao/shared';

/** One-click logins into the seeded accounts; set VITE_DEMO_ACCOUNTS=false to hide them. */
export const demoAccountsEnabled = import.meta.env.VITE_DEMO_ACCOUNTS !== 'false';

const hint: Record<DemoAccountKey, string> = {
  auctioneer: 'Monta lotes e vê os resultados',
  ana: 'Dá lances, com saldo na carteira',
  bruno: 'Dá lances, com saldo na carteira',
};

export const demoAccounts = (Object.keys(DEMO_ACCOUNTS) as DemoAccountKey[]).map((key) => ({
  key,
  ...DEMO_ACCOUNTS[key],
  hint: hint[key],
}));

export type DemoAccount = (typeof demoAccounts)[number];
