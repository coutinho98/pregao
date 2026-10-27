import { LogOut, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { useSession } from '@/features/auth/hooks/use-session';
import { useTheme } from '@/lib/theme';
import { PaddleMark } from '../icons/paddle-mark';
import { Button } from '../ui/button';

export function TopBar() {
  return (
    <header className="mx-auto flex w-full max-w-[1080px] items-center justify-between px-5 pt-[calc(20px+env(safe-area-inset-top))]">
      <Link to={paths.home} className="inline-flex items-center gap-2" aria-label="Pregão, vitrine">
        <PaddleMark className="h-[19px] w-[14px]" />
        <span className="font-mono text-[14px] font-bold tracking-[0.08em]">PREGÃO</span>
      </Link>
      <div className="flex items-center gap-1">
        <ThemeButton />
        <AccountActions />
      </div>
    </header>
  );
}

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </Button>
  );
}

function AccountActions() {
  const { user, isLoading } = useSession();
  const logout = useLogout();

  if (isLoading) return null;
  if (!user) {
    return (
      <Button asChild variant="primary" size="sm" className="ml-1 rounded-full px-4">
        <Link to={paths.register}>Cadastrar</Link>
      </Button>
    );
  }
  return (
    <>
      <span className="ml-1 hidden max-w-[16ch] truncate text-[13.5px] text-ink-2 sm:inline">
        {user.name}
      </span>
      <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
        <LogOut size={17} />
      </Button>
    </>
  );
}
