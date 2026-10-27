import { Link, useSearchParams } from 'react-router';
import { cn } from '@/lib/cn';
import { PHASE_PARAM, showcaseSections } from '../showcase-filters';

const options = [{ slug: '', title: 'Todos' }, ...showcaseSections];

export function PhaseFilter() {
  const [searchParams] = useSearchParams();
  const current = searchParams.get(PHASE_PARAM) ?? '';

  const hrefFor = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set(PHASE_PARAM, slug);
    else next.delete(PHASE_PARAM);
    return `?${next}`;
  };

  return (
    <nav aria-label="Filtrar por fase">
      <ul className="flex flex-wrap items-center gap-x-1 font-label text-lg">
        {options.map(({ slug, title }, index) => (
          <li key={slug} className="flex items-center gap-x-1">
            {index > 0 && (
              <span aria-hidden="true" className="text-nevoa">
                ·
              </span>
            )}
            <Link
              to={hrefFor(slug)}
              aria-current={current === slug ? 'page' : undefined}
              className={cn(
                'px-1 font-semibold underline-offset-8 decoration-2 hover:underline',
                current === slug ? 'underline decoration-latao' : 'text-nevoa-texto',
              )}
            >
              {title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
