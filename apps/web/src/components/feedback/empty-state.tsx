import type { ReactNode } from 'react';

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-2 border-nevoa py-2 pl-4 text-lg text-nevoa-texto">{children}</div>
  );
}
