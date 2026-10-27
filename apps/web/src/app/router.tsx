import { Role } from '@pregao/shared';
import { createBrowserRouter } from 'react-router';
import { AppLayout } from '@/components/layout/app-layout';
import { PlaceholderPage } from '@/components/layout/placeholder-page';
import { RequireAuth } from '@/features/auth/components/require-auth';
import { ShowcasePage } from '@/features/lots/pages/showcase-page';
import { paths } from './paths';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: paths.home, element: <ShowcasePage /> },
      {
        path: paths.login,
        lazy: async () => {
          const { LoginPage } = await import('@/features/auth/pages/login-page');
          return { element: <LoginPage /> };
        },
      },
      {
        path: paths.register,
        lazy: async () => {
          const { RegisterPage } = await import('@/features/auth/pages/register-page');
          return { element: <RegisterPage /> };
        },
      },
      {
        path: paths.lot(':id'),
        lazy: async () => {
          const { LiveRoomPage } = await import('@/features/live-room/pages/live-room-page');
          return { element: <LiveRoomPage /> };
        },
      },
      {
        path: paths.office,
        lazy: async () => {
          const { OfficePage } = await import('@/features/office/pages/office-page');
          return {
            element: (
              <RequireAuth roles={[Role.AUCTIONEER]}>
                <OfficePage />
              </RequireAuth>
            ),
          };
        },
      },
      {
        path: paths.wallet,
        lazy: async () => {
          const { WalletPage } = await import('@/features/wallet/pages/wallet-page');
          return {
            element: (
              <RequireAuth roles={[Role.BIDDER]}>
                <WalletPage />
              </RequireAuth>
            ),
          };
        },
      },
      {
        path: paths.myBids,
        lazy: async () => {
          const { MyBidsPage } = await import('@/features/my-bids/pages/my-bids-page');
          return {
            element: (
              <RequireAuth roles={[Role.BIDDER]}>
                <MyBidsPage />
              </RequireAuth>
            ),
          };
        },
      },
      {
        path: paths.receipt(':token'),
        lazy: async () => {
          const { ReceiptPage } = await import('@/features/receipts/pages/receipt-page');
          return { element: <ReceiptPage /> };
        },
      },
      {
        path: paths.audit(':lotId'),
        lazy: async () => {
          const { AuditPage } = await import('@/features/audit/pages/audit-page');
          return { element: <AuditPage /> };
        },
      },
      {
        path: '*',
        element: (
          <PlaceholderPage
            title="Sala não encontrada"
            description="Este endereço não leva a nenhuma sala da casa."
          />
        ),
      },
    ],
  },
]);
