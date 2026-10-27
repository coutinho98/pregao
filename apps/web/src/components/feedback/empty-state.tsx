import type { ReactNode } from 'react';

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-28 place-items-center rounded-[18px] border border-dashed border-line-strong px-6 py-8 text-center text-[14px] text-ink-2">
      <p className="max-w-[44ch]">{children}</p>
    </div>
  );
}
