import type { ReceiptView } from '@pregao/shared';
import { centsToNumber } from '../../common/money.js';
import { toLotImage } from '../lots/lots.mapper.js';
import type { ReceiptWithLot } from './receipts.repository.js';

/** The public receipt: the paddle number of the winner, never their name or e-mail. */
export function toReceiptView(receipt: ReceiptWithLot): ReceiptView {
  const { lot } = receipt;
  const snapshot = lot.itemSnapshot;
  return {
    token: receipt.publicToken,
    lotId: lot.id,
    lotNumber: lot.number,
    title: snapshot.title,
    artist: snapshot.artist,
    image: toLotImage(snapshot),
    amountCents: centsToNumber(receipt.amountCents),
    winnerPseudonym: receipt.winnerPseudonym,
    bidCount: receipt.bidCount,
    finalHash: receipt.finalHash,
    settledAt: (lot.settledAt ?? receipt.createdAt).toISOString(),
  };
}
