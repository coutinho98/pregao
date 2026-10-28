import type { ReactNode } from 'react';

interface SectionHeadingProps {
  id: string;
  children: ReactNode;
  hint?: string;
}

/** Title of a step section, with the one sentence that says what to do in it. */
export function SectionHeading({ id, children, hint }: SectionHeadingProps) {
  return (
    <div className="mb-4 px-1">
      <h2 id={id} className="text-[16px] font-semibold tracking-[-0.01em]">
        {children}
      </h2>
      {hint && <p className="mt-1 max-w-[70ch] text-[13.5px] text-ink-2">{hint}</p>}
    </div>
  );
}
