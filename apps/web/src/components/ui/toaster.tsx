import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-full items-start gap-3 rounded-[18px] bg-card px-4 py-3 text-[14px] text-ink shadow-float',
          success: '[&_[data-icon]]:text-up',
          error: '[&_[data-icon]]:text-danger',
          title: 'font-[560]',
          description: 'text-[13px] text-ink-2',
          actionButton:
            'ml-auto shrink-0 self-center rounded-full bg-chip px-3 py-1 text-[13px] font-[550] text-ink',
        },
      }}
    />
  );
}
