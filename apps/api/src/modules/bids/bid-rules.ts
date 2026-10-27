import {
  ANTI_SNIPING_WINDOW_MS,
  BidStanding,
  deriveLotPhase,
  ErrorCode,
  LotPhase,
  MyBidResult,
  type MyLotStanding,
  Role,
} from '@pregao/shared';
import { LotStatus } from '../../generated/prisma/client.js';
import { centsToNumber } from '../../common/money.js';

export interface BidAttempt {
  bidderId: string;
  bidderRole: Role;
  amountCents: bigint;
  availableCents: bigint;
  now: Date;
  lot: {
    status: LotStatus;
    startsAt: Date;
    endsAt: Date;
    startingPriceCents: bigint;
    minIncrementCents: bigint;
    currentBidCents: bigint | null;
    leaderId: string | null;
  };
}

export interface BidRejection {
  code: ErrorCode;
  message: string;
}

export function nextMinimumBid(lot: BidAttempt['lot']): bigint {
  return lot.currentBidCents === null
    ? lot.startingPriceCents
    : lot.currentBidCents + lot.minIncrementCents;
}

/** Why a bid must be refused, checked in the order a bidder can act on, or null if valid. */
export function bidRejection({
  bidderId,
  bidderRole,
  amountCents,
  availableCents,
  now,
  lot,
}: BidAttempt): BidRejection | null {
  if (bidderRole === Role.AUCTIONEER) {
    return {
      code: ErrorCode.AUCTIONEER_CANNOT_BID,
      message: 'Leiloeiros não dão lances. Entre com uma conta de licitante.',
    };
  }
  if (lot.status === LotStatus.CANCELLED) {
    return { code: ErrorCode.LOT_ENDED, message: 'Este lote foi cancelado.' };
  }
  if (lot.status === LotStatus.SETTLED || now >= lot.endsAt) {
    return { code: ErrorCode.LOT_ENDED, message: 'O martelo já foi batido neste lote.' };
  }
  if (now < lot.startsAt) {
    return { code: ErrorCode.NOT_STARTED, message: 'Este lote ainda não abriu para lances.' };
  }
  if (lot.leaderId === bidderId) {
    return {
      code: ErrorCode.ALREADY_WINNING,
      message: 'Você já está ganhando este lote. Aguarde outro lance para cobrir.',
    };
  }
  if (amountCents < nextMinimumBid(lot)) {
    return { code: ErrorCode.BELOW_MINIMUM, message: 'O lance está abaixo do mínimo atual.' };
  }
  if (amountCents > availableCents) {
    return {
      code: ErrorCode.INSUFFICIENT_FUNDS,
      message: 'Seu saldo disponível não cobre este lance. Deposite mais na carteira.',
    };
  }
  return null;
}

/**
 * Anti-sniping: a bid accepted when the lot has `ANTI_SNIPING_WINDOW_MS` or less left moves
 * the end to now + that window. Null when the end does not move (more time left, or exactly
 * the window left, where now + window is the current end).
 */
export function extendedEndsAt(endsAt: Date, now: Date): Date | null {
  const candidate = now.getTime() + ANTI_SNIPING_WINDOW_MS;
  return candidate > endsAt.getTime() ? new Date(candidate) : null;
}

export interface BidderHighest {
  bidderId: string;
  amountCents: bigint;
}

/** Rank of a user among the lot's bidders, ordered by each one's highest bid. */
export function standingOf(
  userId: string,
  leaderId: string | null,
  highestBids: BidderHighest[],
): Omit<MyLotStanding, 'pseudonym' | 'receiptToken'> {
  const ranked = [...highestBids].sort((a, b) => (b.amountCents > a.amountCents ? 1 : -1));
  const index = ranked.findIndex((entry) => entry.bidderId === userId);
  const mine = ranked[index];
  let standing: BidStanding = BidStanding.NONE;
  if (leaderId === userId) standing = BidStanding.WINNING;
  else if (mine) standing = BidStanding.OUTBID;
  return {
    standing,
    position: mine ? index + 1 : null,
    totalBidders: ranked.length,
    myHighestBidCents: mine ? centsToNumber(mine.amountCents) : null,
  };
}

/**
 * How a lot the user bid on stands for them. Ended lots (by the clock or settled) are won
 * by whoever leads at the hammer.
 */
export function myBidResult(
  lot: { status: LotStatus; startsAt: Date; endsAt: Date; leaderId: string | null },
  userId: string,
  now: Date,
): MyBidResult {
  const leads = lot.leaderId === userId;
  if (deriveLotPhase(lot, now) === LotPhase.ENDED)
    return leads ? MyBidResult.WON : MyBidResult.LOST;
  return leads ? MyBidResult.LEADING : MyBidResult.OUTBID;
}
