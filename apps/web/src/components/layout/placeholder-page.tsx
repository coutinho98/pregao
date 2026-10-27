import { Page } from './page';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

/** Tela provisória para rotas cuja feature ainda não foi construída. */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Page>
      <h1 className="mt-6 text-[26px]">{title}</h1>
      <p className="mt-2 text-[15.5px] leading-[1.7] text-ink-2">{description}</p>
    </Page>
  );
}
