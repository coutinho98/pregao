import { toast } from 'sonner';

/** Copies an in-app path as a full link and confirms with a toast. */
export function useCopyLink(): (path: string) => void {
  return (path) => {
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success('Link do comprovante copiado.'),
      () => toast.error('Não deu para copiar. O link é: ' + url),
    );
  };
}
