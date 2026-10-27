import { Role } from '@pregao/shared';
import { createBrowserRouter } from 'react-router';
import { AppLayout } from '@/components/layout/app-layout';
import { PlaceholderPage } from '@/components/layout/placeholder-page';
import { RequireAuth } from '@/features/auth/components/require-auth';
import { LoginPage } from '@/features/auth/pages/login-page';
import { RegisterPage } from '@/features/auth/pages/register-page';
import { HomePage } from '@/features/home/pages/home-page';
import { paths } from './paths';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: paths.home, element: <HomePage /> },
      { path: paths.login, element: <LoginPage /> },
      { path: paths.register, element: <RegisterPage /> },
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
        path: paths.office,
        element: (
          <RequireAuth roles={[Role.AUCTIONEER]}>
            <PlaceholderPage
              title="Escritório da casa"
              description="Monte lotes a partir do acervo e acompanhe os resultados."
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
