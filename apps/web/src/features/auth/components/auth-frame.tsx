import type { ReactNode } from 'react';

interface AuthFrameProps {
  title: string;
  lead: string;
  children: ReactNode;
  footer: ReactNode;
}

/** Página de acesso: a ficha de inscrição da casa, sobre a parede do salão. */
export function AuthFrame({ title, lead, children, footer }: AuthFrameProps) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-10 md:grid-cols-[1fr_minmax(0,28rem)] md:py-16">
      <div className="flex flex-col justify-center gap-4">
        <h1 className="text-3xl md:text-4xl">{title}</h1>
        <p className="max-w-[60ch] text-lg text-nevoa-texto">{lead}</p>
      </div>
      <div className="flex flex-col gap-6 border-t-4 border-latao bg-papel p-6 outline outline-1 outline-nevoa/40 md:p-8">
        {children}
        <div className="border-t border-nevoa/40 pt-4 text-base">{footer}</div>
      </div>
    </div>
  );
}
