import type { Role } from '@pregao/shared';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { paths } from '@/app/paths';
import { useSession } from '../hooks/use-session';

interface RequireAuthProps {
  roles?: Role[];
  children: ReactNode;
}

export function RequireAuth({ roles, children }: RequireAuthProps) {
  const { user, isLoading } = useSession();
  const location = useLocation();

  if (isLoading)
    return <p className="mx-auto max-w-[560px] px-5 py-10 text-ink-3">Carregando sua conta…</p>;
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${paths.login}?next=${next}`} replace />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to={paths.home} replace />;
  return children;
}
