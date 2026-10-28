import { Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { AccountMenu } from '@/features/auth/components/account-menu';
import { useSession } from '@/features/auth/hooks/use-session';
import { useSoundSetting } from '@/lib/sound';
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
        <SoundButton />
        <ThemeButton />
        <AccountActions />
      </div>
    </header>
  );
}

function SoundButton() {
  const { soundOn, toggleSound } = useSoundSetting();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSound}
      aria-pressed={soundOn}
      aria-label="Sons dos lances"
      title={soundOn ? 'Silenciar sons dos lances' : 'Ativar sons dos lances'}
    >
      {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
    </Button>
  );
}

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(event) => {
        // From the button's centre, so mouse and keyboard look the same.
        const box = event.currentTarget.getBoundingClientRect();
        toggleTheme({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
      }}
      aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </Button>
  );
}

/** Signed out: sign in and sign up. Signed in: who it is and as what. */
function AccountActions() {
  const { user, isLoading } = useSession();

  if (isLoading) return null;
  if (user) return <AccountMenu user={user} />;
  return (
    <div className="ml-1 flex items-center gap-1.5">
      <Button asChild variant="ghost" size="sm" className="rounded-full px-3.5 text-ink">
        <Link to={paths.login}>Entrar</Link>
      </Button>
      <Button
        asChild
        variant="primary"
        size="sm"
        className="hidden rounded-full px-4 sm:inline-flex"
      >
        <Link to={paths.register}>Cadastrar</Link>
      </Button>
    </div>
  );
}
