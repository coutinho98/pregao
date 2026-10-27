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
          const { LotPage } = await import('@/features/lots/pages/lot-page');
          return { element: <LotPage /> };
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
        element: (
          <RequireAuth roles={[Role.BIDDER]}>
            <PlaceholderPage
              title="Carteira"
              description="Seu livro-caixa: saldo total, comprometido e disponível."
            />
          </RequireAuth>
        ),
      },
      {
        path: paths.myBids,
        element: (
          <RequireAuth roles={[Role.BIDDER]}>
            <PlaceholderPage
              title="Meus arremates"
              description="Os lotes em que você levantou a raquete."
            />
          </RequireAuth>
        ),
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
