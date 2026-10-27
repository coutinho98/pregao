import { RotateCw } from 'lucide-react';
import { Button } from '../ui/button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-card px-4 py-3 shadow-card"
    >
      <p className="flex items-center gap-2 text-[14px]">
        <span className="size-2 shrink-0 rounded-full bg-danger" aria-hidden="true" />
        {message}
      </p>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          <RotateCw size={14} /> Tentar de novo
        </Button>
      )}
    </div>
  );
}
