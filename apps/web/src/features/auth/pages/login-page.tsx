import { Link, useSearchParams } from 'react-router';
import { paths } from '@/app/paths';
import { AuthFrame } from '../components/auth-frame';
import { LoginForm } from '../components/login-form';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const registerLink = `${paths.register}?${searchParams.toString()}`;

  return (
    <AuthFrame
      title="Entrar no salão"
      lead="Acompanhe os lotes em pregão, dê lances e guarde seus comprovantes de arremate."
      footer={
        <p>
          Ainda não tem conta?{' '}
          <Link
            to={registerLink}
            className="font-semibold text-latao-texto underline underline-offset-4"
          >
            Cadastre-se
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthFrame>
  );
}
