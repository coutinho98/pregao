import { AlertDialog } from 'radix-ui';
import type { ReactNode } from 'react';
import { Button } from './button';

interface ConfirmDialogProps {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  danger?: boolean;
}

/** Asks before an action that cannot be undone. Focus is trapped; Esc cancels. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm,
  danger = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-[61] w-[min(420px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-card p-5 shadow-float">
          <AlertDialog.Title className="text-[18px] font-semibold tracking-[-0.01em]">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-[14px] leading-relaxed text-ink-2">
            {description}
          </AlertDialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button variant="ghost">Voltar</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
