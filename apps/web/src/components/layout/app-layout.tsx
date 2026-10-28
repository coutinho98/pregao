import { Role } from '@pregao/shared';
import { Outlet, useLocation } from 'react-router';
import { useSession } from '@/features/auth/hooks/use-session';
import { useOutbidAlerts } from '@/features/live-room/hooks/use-outbid-alerts';
import { cn } from '@/lib/cn';
import { Dock } from './dock';
import { navItemsByAudience } from './nav-items';
import { TopBar } from './top-bar';

/**
 * On phones the live room pins its bid bar to the bottom, where the dock sits, so the dock
 * steps aside there; on wider screens the bid box is beside the artwork and the dock stays.
 */
const bidBarTakesBottom = (pathname: string) => pathname.startsWith('/lotes/');

export function AppLayout() {
  const { user } = useSession();
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-dvh flex-col">
      <EdgeFades />
      <TopBar />
      {user?.role === Role.BIDDER && <OutbidAlerts />}
      <main className="flex-1">
        <Outlet />
      </main>
      <Dock
        items={navItemsByAudience[user?.role ?? 'GUEST']}
        className={cn(bidBarTakesBottom(pathname) && 'max-lg:hidden')}
      />
    </div>
  );
}

/** Content dissolves under blurred edges at the top and bottom of the viewport. */
function EdgeFades() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-30 h-[calc(28px+env(safe-area-inset-top))] bg-linear-to-b from-bg from-25% to-transparent backdrop-blur-[6px] [mask-image:linear-gradient(#000_45%,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-[calc(110px+env(safe-area-inset-bottom))] bg-linear-to-b from-transparent to-bg to-70% backdrop-blur-[6px] [mask-image:linear-gradient(transparent,#000_55%)]"
      />
    </>
  );
}

function OutbidAlerts() {
  useOutbidAlerts();
  return null;
}
