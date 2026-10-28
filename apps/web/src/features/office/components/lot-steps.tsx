import { Check } from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '@/lib/cn';

const STEPS = ['Escolha a obra', 'Defina lance e prazo', 'Publique na vitrine'];

type StepState = 'done' | 'current' | 'next';

const markStyle: Record<StepState, string> = {
  done: 'bg-up text-white',
  current: 'bg-primary text-primary-ink',
  next: 'bg-chip text-ink-3',
};

const labelStyle: Record<StepState, string> = {
  done: 'text-ink-2',
  current: 'font-medium text-ink',
  next: 'text-ink-3',
};

function stepState(step: number, current: number): StepState {
  if (step < current) return 'done';
  return step === current ? 'current' : 'next';
}

/** Where the auctioneer is in putting a lot together, and what comes next. */
export function LotSteps({ current }: { current: number }) {
  return (
    <>
      <p className="mb-6 text-[13.5px] text-ink-2 sm:hidden">
        Passo {current} de {STEPS.length} ·{' '}
        <b className="font-medium text-ink">{STEPS[current - 1]}</b>
      </p>
      <ol
        aria-label="Etapas para montar um lote"
        className="mb-8 hidden flex-wrap items-center gap-x-3 gap-y-2 text-[13.5px] sm:flex"
      >
        {STEPS.map((label, index) => {
          const step = index + 1;
          const state = stepState(step, current);
          return (
            <Fragment key={label}>
              {index > 0 && <li aria-hidden="true" className="h-px w-6 bg-line-strong" />}
              <li
                aria-current={state === 'current' ? 'step' : undefined}
                className="flex items-center gap-2"
              >
                <span
                  className={cn(
                    'tabular grid size-6 place-items-center rounded-full text-[12px] font-semibold transition-colors',
                    markStyle[state],
                  )}
                >
                  {state === 'done' ? <Check size={13} strokeWidth={3} /> : step}
                </span>
                <span className={labelStyle[state]}>{label}</span>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </>
  );
}
