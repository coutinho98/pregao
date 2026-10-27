import { type BidStanding, type LotDetail, LotPhase, type PublicBid } from '@pregao/shared';
import { Chip } from '@/components/ui/chip';
import { formatLotNumber } from '@/features/lots/format';
import { phaseLabel } from '@/features/lots/phase-labels';
import { cn } from '@/lib/cn';
import { formatDayTime } from '@/utils/date';
import { formatCents } from '@/utils/money';
import type { CountdownView } from '../room-clock';
import { AuctioneerLine } from './auctioneer-line';
import { BidPanel } from './bid-panel';
import { RoomCountdown } from './room-countdown';
import { StandingBanner } from './standing-banner';

interface BidBoxProps {
  lot: LotDetail;
  phase: LotPhase;
  countdown: CountdownView | null;
  bids: PublicBid[];
  call: string;
  standing: BidStanding;
  position: number | null;
  totalBidders: number;
}

function amountLabel(phase: LotPhase, hasBids: boolean): string {
  if (!hasBids) return phase === LotPhase.ENDED ? 'Sem lances' : 'Lance inicial';
  return phase === LotPhase.ENDED ? 'Martelo batido em' : 'Lance atual';
}

/** The auction desk: what the lot is worth now, how long is left, and where to bid. */
export function BidBox({
  lot,
  phase,
  countdown,
  bids,
  call,
  standing,
  position,
  totalBidders,
}: BidBoxProps) {
  const bidders = new Set(bids.map((bid) => bid.bidderPseudonym)).size;
  const amount = lot.currentBidCents ?? lot.startingPriceCents;

  return (
    <div className="gilded flex flex-col gap-5 rounded-[22px] p-6">
      <div>
        <div className="mb-3 flex items-center gap-2 text-[12.5px]">
          <Chip className="tabular">{formatLotNumber(lot.number)}</Chip>
          <span
            className={cn(
              'inline-flex items-center gap-1.5',
              phase === LotPhase.LIVE ? 'text-up' : 'text-ink-3',
            )}
          >
            {phase === LotPhase.LIVE && <span className="live-dot" aria-hidden="true" />}
            {phaseLabel[phase]}
          </span>
        </div>
        <h1 className="text-[26px] leading-tight">{lot.title}</h1>
        {lot.artist && (
          <p className="mt-1 text-[14px] text-ink-3">
            {lot.artist}
            {lot.dateDisplay && `, ${lot.dateDisplay}`}
          </p>
        )}
      </div>

      <div aria-live="polite" className="border-t border-line pt-4">
        <p className="text-[13px] text-ink-3">{amountLabel(phase, lot.currentBidCents !== null)}</p>
        <p className="tabular text-[40px] leading-[1.1] font-semibold tracking-[-0.03em]">
          {formatCents(amount)}
        </p>
        <p className="mt-1 text-[13px] text-ink-2">
          <span className="tabular">{lot.bidCount}</span> {lot.bidCount === 1 ? 'lance' : 'lances'}{' '}
          · <span className="tabular">{bidders}</span> {bidders === 1 ? 'licitante' : 'licitantes'}
        </p>
      </div>

      {countdown && <RoomCountdown view={countdown} />}
      {!countdown && (
        <p className="text-[13px] text-ink-3">
          {phase === LotPhase.ENDED ? 'Encerrado em' : 'Encerra em'} {formatDayTime(lot.endsAt)}
        </p>
      )}

      <AuctioneerLine call={call} />
      <StandingBanner standing={standing} position={position} totalBidders={totalBidders} />
      <BidPanel
        lotId={lot.id}
        phase={phase}
        startsAt={lot.startsAt}
        minNextBidCents={lot.minNextBidCents}
        minIncrementCents={lot.minIncrementCents}
        standing={standing}
      />
    </div>
  );
}
