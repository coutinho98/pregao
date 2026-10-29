import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

/** Where to try a step: a page of the app, or an outside page in a new tab. */
export function GuideLink({ to, children }: { to: string; children: ReactNode }) {
  const external = /^https?:\/\//.test(to);
  return (
    <Button asChild size="sm" className="rounded-full px-3.5">
      {external ? (
        <a href={to} target="_blank" rel="noreferrer">
          {children} <ArrowUpRight size={15} />
        </a>
      ) : (
        <Link to={to}>
          {children} <ArrowRight size={15} />
        </Link>
      )}
    </Button>
  );
}
