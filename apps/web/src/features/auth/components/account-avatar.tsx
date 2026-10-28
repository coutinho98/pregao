import { Role } from '@pregao/shared';
import { cn } from '@/lib/cn';

const roleTone: Record<Role, string> = {
  [Role.AUCTIONEER]: 'bg-ink text-bg',
  [Role.BIDDER]: 'bg-chip text-ink',
};

/** "Ana Licitante" → "AL". */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/** Initials in a circle: dark for the auctioneer, light for bidders, told apart at a glance. */
export function AccountAvatar({
  name,
  role,
  className,
}: {
  name: string;
  role: Role;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-full text-[12px] font-semibold',
        roleTone[role],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
