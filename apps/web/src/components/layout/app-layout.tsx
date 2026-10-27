import { Role } from '@pregao/shared';
import { Outlet } from 'react-router';
import { useSession } from '@/features/auth/hooks/use-session';
import { useOutbidAlerts } from '@/features/live-room/hooks/use-outbid-alerts';
import { SiteHeader } from './site-header';

export function AppLayout() {
  const { user } = useSession();
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      {user?.role === Role.BIDDER && <OutbidAlerts />}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function OutbidAlerts() {
  useOutbidAlerts();
  return null;
}
