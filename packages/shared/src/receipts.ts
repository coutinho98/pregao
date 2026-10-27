import type { LotImage } from './lots';

/** Public proof of a sale: anyone with the link can see it; it never names the winner. */
export interface ReceiptView {
  token: string;
  lotId: string;
  lotNumber: number;
  title: string;
  artist: string | null;
  image: LotImage;
  amountCents: number;
  winnerPseudonym: string;
  bidCount: number;
  /** Hash of the last bid in the lot's chain, sealed into the receipt. */
  finalHash: string;
  settledAt: string;
}
