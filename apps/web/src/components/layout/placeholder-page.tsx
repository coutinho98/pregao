interface PlaceholderPageProps {
  title: string;
  description: string;
}

/** Tela provisória para rotas cuja feature ainda não foi construída. */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl">{title}</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-nevoa-texto">{description}</p>
    </section>
  );
}
