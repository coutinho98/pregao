import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-full items-start gap-3 rounded-xs border-l-4 bg-papel px-4 py-3 font-serif text-base text-tinta shadow-[0_8px_24px_rgb(0_0_0/0.18)]',
          success: 'border-selo',
          error: 'border-lacre',
          info: 'border-latao',
          title: 'font-semibold',
          description: 'text-sm text-nevoa-texto',
          actionButton:
            'ml-auto shrink-0 self-center font-label text-base font-semibold text-latao-texto underline underline-offset-4',
        },
      }}
    />
  );
}
