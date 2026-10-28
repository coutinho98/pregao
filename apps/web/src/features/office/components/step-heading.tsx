import type { ReactNode } from 'react';

interface StepHeadingProps {
  id: string;
  step: number;
  children: ReactNode;
  hint?: string;
}

/** "1 · Escolha a obra": numbers the steps of putting a lot together. */
export function StepHeading({ id, step, children, hint }: StepHeadingProps) {
  return (
    <div className="mb-4 px-1">
      <h2
        id={id}
        className="flex items-center gap-2.5 text-[16px] font-semibold tracking-[-0.01em]"
      >
        <span className="tabular grid size-6 place-items-center rounded-full bg-chip text-[12.5px] font-semibold">
          {step}
        </span>
        {children}
      </h2>
      {hint && <p className="mt-1 pl-[34px] text-[13px] text-ink-3">{hint}</p>}
    </div>
  );
}
