import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { useSession } from '@/features/auth/hooks/use-session';
import { Button } from '../ui/button';

export function SessionActions({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isLoading } = useSession();
  const logout = useLogout();

  if (isLoading) return null;

  if (!user) {
    return (
      <>
        <Button asChild variant="onWall" size="sm">
          <Link to={paths.login} onClick={onNavigate}>
            Entrar
          </Link>
        </Button>
        <Button asChild variant="brass" size="sm">
          <Link to={paths.register} onClick={onNavigate}>
            Cadastre-se
          </Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <span className="font-label text-lg">{user.name}</span>
      <Button
        variant="onWall"
        size="sm"
        onClick={() => {
          onNavigate?.();
          logout();
        }}
      >
        Sair
      </Button>
    </>
  );
}
