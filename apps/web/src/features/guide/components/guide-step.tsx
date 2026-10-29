import type { ReactNode } from 'react';

interface GuideStepProps {
  number: number;
  title: string;
  children: ReactNode;
  /** Links that take the visitor to try the step. */
  actions?: ReactNode;
}

/** One stop of the tour: a numbered title, a few sentences and where to try it. */
export function GuideStep({ number, title, children, actions }: GuideStepProps) {
  return (
    <li className="grid grid-cols-[34px_minmax(0,1fr)] gap-x-3 border-t border-line py-4">
      <span className="tabular pt-[3px] font-mono text-[13px] text-ink-3">
        {String(number).padStart(2, '0')}
      </span>
      <div>
        <h2 className="text-[16px]">{title}</h2>
        <div className="mt-1 flex flex-col gap-2 text-[14.5px] leading-[1.65] text-ink-2">
          {children}
        </div>
        {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </li>
  );
}
