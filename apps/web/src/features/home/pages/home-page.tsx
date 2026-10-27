import { Link } from 'react-router';
import { paths } from '@/app/paths';
import { useSession } from '@/features/auth/hooks/use-session';

export function HomePage() {
  const { user } = useSession();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl">Em pregão</h1>
      <p className="mt-4 max-w-[60ch] text-lg text-nevoa-texto">
        Nenhum lote em pregão agora. Os próximos lotes aparecem aqui assim que o leiloeiro abrir a
        sessão.
      </p>
      {!user && (
        <p className="mt-6 text-lg">
          <Link
            to={paths.register}
            className="font-semibold text-latao-texto underline underline-offset-4"
          >
            Faça sua inscrição
          </Link>{' '}
          para receber sua raquete e dar lances.
        </p>
      )}
    </section>
  );
}
