import { Role } from '@pregao/shared';
import { Gavel, Hand } from 'lucide-react';
import { cn } from '@/lib/cn';
import { roleLabel } from '../role-labels';

const roleIcon = { [Role.AUCTIONEER]: Gavel, [Role.BIDDER]: Hand };

/** Which side of the auction the account is on. */
export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  const Icon = roleIcon[role];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-chip px-2 py-0.5 text-[11.5px] font-medium text-ink-2',
        className,
      )}
    >
      <Icon size={11} aria-hidden="true" />
      {roleLabel[role]}
    </span>
  );
}
