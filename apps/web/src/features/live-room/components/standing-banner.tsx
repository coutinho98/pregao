import { BidStanding } from '@pregao/shared';
import { cn } from '@/lib/cn';

interface StandingBannerProps {
  standing: BidStanding;
  position: number | null;
  totalBidders: number;
}

const bannerByStanding: Partial<Record<BidStanding, { text: string; className: string }>> = {
  [BidStanding.WINNING]: { text: 'Você está ganhando', className: 'bg-selo text-papel' },
  [BidStanding.OUTBID]: { text: 'Você foi superado', className: 'bg-lacre text-papel' },
};

export function StandingBanner({ standing, position, totalBidders }: StandingBannerProps) {
  const banner = bannerByStanding[standing];
  if (!banner) return null;
  return (
    <div
      className={cn(
        'flex flex-wrap items-baseline justify-between gap-2 rounded-xs px-4 py-3',
        banner.className,
      )}
    >
      <span className="font-label text-xl font-bold">{banner.text}</span>
      {position !== null && (
        <span className="tabular font-label text-lg">
          Sua posição: {position}º de {totalBidders}
        </span>
      )}
    </div>
  );
}
