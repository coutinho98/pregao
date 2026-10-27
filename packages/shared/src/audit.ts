import { bidMessage, genesisMessage, headMessage } from './audit-chain';
import type { LotPhase } from './lot-phase';

/** Everything needed to check a lot's history, exactly as stored. Served without login. */
export interface AuditTrail {
  lotId: string;
  lotNumber: number;
  title: string;
  phase: LotPhase;
  genesis: {
    itemId: string;
    startingPriceCents: number;
    minIncrementCents: number;
    startsAt: string;
    hash: string;
  };
  /** Ordered by seq. */
  bids: AuditBid[];
  head: { bidCount: number; lastHash: string; signature: string };
  receipt: { finalHash: string; amountCents: number } | null;
  /** Ed25519 public key of the house, hex. */
  publicKey: string;
}

export interface AuditBid {
  seq: number;
  bidderPseudonym: string;
  amountCents: number;
  createdAt: string;
  prevHash: string;
  hash: string;
  signature: string;
}

/** Crypto primitives, injected so the browser and Node run the same verification. */
export interface AuditCrypto {
  sha256Hex(message: string): Promise<string>;
  /** Ed25519 over the UTF-8 bytes of `message`. */
  verify(signatureHex: string, message: string, publicKeyHex: string): Promise<boolean>;
}

export const AuditFailure = {
  GENESIS_ALTERED: 'GENESIS_ALTERED',
  BID_MISSING: 'BID_MISSING',
  CHAIN_BROKEN: 'CHAIN_BROKEN',
  BID_ALTERED: 'BID_ALTERED',
  BAD_SIGNATURE: 'BAD_SIGNATURE',
  HEAD_MISMATCH: 'HEAD_MISMATCH',
  RECEIPT_MISMATCH: 'RECEIPT_MISMATCH',
} as const;

export type AuditFailure = (typeof AuditFailure)[keyof typeof AuditFailure];

/** Where the chain broke: the genesis, a bid (by seq), the closing head or the receipt. */
export type AuditLocation = 'genesis' | number | 'head' | 'receipt';

export type AuditResult =
  | { ok: true; verifiedBids: number }
  | { ok: false; failure: AuditFailure; at: AuditLocation; message: string; verifiedBids: number };

const broken = (
  failure: AuditFailure,
  at: AuditLocation,
  message: string,
  verifiedBids: number,
): AuditResult => ({ ok: false, failure, at, message, verifiedBids });

/**
 * Re-derives every hash from the canonical fields and checks every signature with the
 * house's public key. Stops at the first problem and says where and why, in plain words.
 */
export async function verifyAuditTrail(
  trail: AuditTrail,
  crypto: AuditCrypto,
): Promise<AuditResult> {
  const { lotId, genesis, bids, head, receipt, publicKey } = trail;

  const genesisHash = await crypto.sha256Hex(
    genesisMessage({
      lotId,
      itemId: genesis.itemId,
      startingPriceCents: genesis.startingPriceCents,
      minIncrementCents: genesis.minIncrementCents,
      startsAt: new Date(genesis.startsAt),
    }),
  );
  if (genesisHash !== genesis.hash) {
    return broken(
      AuditFailure.GENESIS_ALTERED,
      'genesis',
      'Os dados do lote (obra, lance inicial, incremento ou abertura) foram alterados depois da criação.',
      0,
    );
  }

  let previousHash = genesis.hash;
  for (const [index, bid] of bids.entries()) {
    const expectedSeq = index + 1;
    if (bid.seq !== expectedSeq) {
      return broken(
        AuditFailure.BID_MISSING,
        expectedSeq,
        `O lance ${expectedSeq} sumiu do histórico: a sequência pula para o ${bid.seq}.`,
        index,
      );
    }
    if (bid.prevHash !== previousHash) {
      return broken(
        AuditFailure.CHAIN_BROKEN,
        bid.seq,
        `O lance ${bid.seq} não se encaixa no anterior: algo foi inserido, removido ou trocado antes dele.`,
        index,
      );
    }
    const hash = await crypto.sha256Hex(
      bidMessage({
        prevHash: bid.prevHash,
        lotId,
        seq: bid.seq,
        bidderPseudonym: bid.bidderPseudonym,
        amountCents: bid.amountCents,
        createdAt: new Date(bid.createdAt),
      }),
    );
    if (hash !== bid.hash) {
      return broken(
        AuditFailure.BID_ALTERED,
        bid.seq,
        `O lance ${bid.seq} foi alterado depois de registrado (valor, raquete ou horário).`,
        index,
      );
    }
    if (!(await crypto.verify(bid.signature, bid.hash, publicKey))) {
      return broken(
        AuditFailure.BAD_SIGNATURE,
        bid.seq,
        `A assinatura do lance ${bid.seq} não confere: ele não foi registrado pela casa.`,
        index,
      );
    }
    previousHash = hash;
  }

  const headValid =
    head.bidCount === bids.length &&
    head.lastHash === previousHash &&
    (await crypto.verify(
      head.signature,
      headMessage({ lotId, bidCount: head.bidCount, lastHash: head.lastHash }),
      publicKey,
    ));
  if (!headValid) {
    return broken(
      AuditFailure.HEAD_MISMATCH,
      'head',
      'O fechamento do histórico não confere: lances foram removidos do fim ou a contagem foi mexida.',
      bids.length,
    );
  }

  const lastBid = bids.at(-1);
  if (
    receipt &&
    (receipt.finalHash !== previousHash || receipt.amountCents !== lastBid?.amountCents)
  ) {
    return broken(
      AuditFailure.RECEIPT_MISMATCH,
      'receipt',
      'O comprovante não corresponde ao último lance do histórico.',
      bids.length,
    );
  }

  return { ok: true, verifiedBids: bids.length };
}
