import type { ReactNode } from 'react';
import { Page } from '@/components/layout/page';

interface AuthFrameProps {
  title: string;
  lead: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

/** Sign-in and sign-up: a short conversational intro, the form in a card, a way out. */
export function AuthFrame({ title, lead, children, footer }: AuthFrameProps) {
  return (
    <Page>
      <section className="mt-6 mb-7">
        <h1 className="text-[30px]">{title}</h1>
        <p className="mt-3 text-[15.5px] leading-[1.7] text-ink-2">{lead}</p>
      </section>
      <div className="rounded-[22px] bg-card p-5 shadow-card">{children}</div>
      <div className="mt-5 text-center text-[14px] text-ink-2">{footer}</div>
    </Page>
  );
}
