import { type AuditTrail, deriveLotPhase } from '@pregao/shared';
import { centsToNumber } from '../../common/money.js';
import type { LotForAudit } from './audit.repository.js';

/** Canonical fields as stored, plus hashes and signatures; no bidder identity. */
export function toAuditTrail(lot: LotForAudit, publicKey: string, now: Date): AuditTrail {
  return {
    lotId: lot.id,
    lotNumber: lot.number,
    title: lot.itemSnapshot.title,
    phase: deriveLotPhase(lot, now),
    genesis: {
      itemId: lot.itemSnapshot.externalId,
      startingPriceCents: centsToNumber(lot.startingPriceCents),
      minIncrementCents: centsToNumber(lot.minIncrementCents),
      startsAt: lot.startsAt.toISOString(),
      hash: lot.genesisHash,
    },
    bids: lot.bids.map((bid) => ({
      seq: bid.seq,
      bidderPseudonym: bid.bidderPseudonym,
      amountCents: centsToNumber(bid.amountCents),
      createdAt: bid.createdAt.toISOString(),
      prevHash: bid.prevHash,
      hash: bid.hash,
      signature: bid.signature,
    })),
    head: { bidCount: lot.bidCount, lastHash: lot.lastHash, signature: lot.headSignature },
    receipt: lot.receipt && {
      finalHash: lot.receipt.finalHash,
      amountCents: centsToNumber(lot.receipt.amountCents),
    },
    publicKey,
  };
}
