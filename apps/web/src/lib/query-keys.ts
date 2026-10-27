import type { PublicLotPhase } from '@pregao/shared';

export const queryKeys = {
  session: (token: string | null) => ['session', token] as const,
  lots: {
    all: ['lots'] as const,
    page: (phase: PublicLotPhase, q: string) => ['lots', 'page', phase, q] as const,
    detail: (id: string) => ['lots', 'detail', id] as const,
    bids: (id: string) => ['lots', 'bids', id] as const,
    standing: (id: string) => ['lots', 'standing', id] as const,
    mine: ['lots', 'mine'] as const,
  },
  myBids: ['my-bids'] as const,
  receipt: (token: string) => ['receipt', token] as const,
  catalog: {
    search: (q: string, page: number) => ['catalog', 'search', q, page] as const,
  },
  wallet: {
    all: ['wallet'] as const,
    summary: ['wallet', 'summary'] as const,
    ledger: ['wallet', 'ledger'] as const,
  },
};
