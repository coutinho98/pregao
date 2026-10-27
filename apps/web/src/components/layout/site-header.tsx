import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { useSession } from '@/features/auth/hooks/use-session';
import { PaddleIcon } from '../icons/paddle-icon';
import { MobileMenu } from './mobile-menu';
import { navItemsByAudience } from './nav-items';
import { NavLinks } from './nav-links';
import { SessionActions } from './session-actions';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader() {
  const { user } = useSession();
  const items = navItemsByAudience[user?.role ?? 'GUEST'];

  return (
    <header className="bg-parede text-sobre-parede">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4">
        <Link to={paths.home} className="flex items-center gap-2">
          <PaddleIcon className="h-8 w-7 text-latao" />
          <span className="font-display text-xl font-extrabold tracking-wide">Casa de Leilões</span>
        </Link>
        <nav aria-label="Principal" className="hidden md:block">
          <NavLinks items={items} orientation="horizontal" />
        </nav>
        <div className="ml-auto hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <SessionActions />
        </div>
        <div className="ml-auto md:hidden">
          <MobileMenu items={items} />
        </div>
      </div>
    </header>
  );
}
