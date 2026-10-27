import { NavLink } from 'react-router';
import { cn } from '@/lib/cn';
import type { NavItem } from './nav-items';

interface NavLinksProps {
  items: NavItem[];
  orientation: 'horizontal' | 'vertical';
  onNavigate?: () => void;
}

export function NavLinks({ items, orientation, onNavigate }: NavLinksProps) {
  return (
    <ul
      className={cn('flex', orientation === 'horizontal' ? 'items-center gap-6' : 'flex-col gap-4')}
    >
      {items.map(({ to, label }) => (
        <li key={to}>
          <NavLink
            to={to}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'font-label text-lg font-semibold underline-offset-8 decoration-2 hover:underline',
                isActive && 'underline decoration-latao',
              )
            }
          >
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
