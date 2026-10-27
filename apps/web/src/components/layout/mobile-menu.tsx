import { useState } from 'react';
import { Button } from '../ui/button';
import { Sheet } from '../ui/sheet';
import type { NavItem } from './nav-items';
import { NavLinks } from './nav-links';
import { SessionActions } from './session-actions';
import { ThemeToggle } from './theme-toggle';

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button variant="onWall" size="sm" onClick={() => setOpen(true)} aria-haspopup="dialog">
        Menu
      </Button>
      <Sheet open={open} onOpenChange={setOpen} title="Casa de Leilões">
        <nav aria-label="Principal">
          <NavLinks items={items} orientation="vertical" onNavigate={close} />
        </nav>
        <div className="mt-auto flex flex-col items-start gap-3 border-t border-sobre-parede/20 pt-6">
          <SessionActions onNavigate={close} />
          <ThemeToggle />
        </div>
      </Sheet>
    </>
  );
}
