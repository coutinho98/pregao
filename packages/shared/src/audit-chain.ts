/**
 * Canonical serialization of the tamper-evident bid history. The API hashes and signs
 * these strings; the audit page rebuilds them in the browser to verify. Field order is
 * part of the format: never reorder.
 */
export interface GenesisFields {
  lotId: string;
  itemId: string;
  startingPriceCents: number;
  minIncrementCents: number;
  startsAt: Date;
}

export function genesisMessage(fields: GenesisFields): string {
  return [
    'GENESIS',
    fields.lotId,
    fields.itemId,
    fields.startingPriceCents,
    fields.minIncrementCents,
    fields.startsAt.toISOString(),
  ].join('|');
}

export interface HeadFields {
  lotId: string;
  bidCount: number;
  lastHash: string;
}

export function headMessage({ lotId, bidCount, lastHash }: HeadFields): string {
  return ['HEAD', lotId, bidCount, lastHash].join('|');
}

export interface BidFields {
  prevHash: string;
  lotId: string;
  seq: number;
  bidderPseudonym: string;
  amountCents: number;
  createdAt: Date;
}

/** Each bid commits to the previous hash, so changing, removing or inserting one breaks the chain. */
export function bidMessage(fields: BidFields): string {
  return [
    fields.prevHash,
    fields.lotId,
    fields.seq,
    fields.bidderPseudonym,
    fields.amountCents,
    fields.createdAt.toISOString(),
  ].join('|');
}
