import { Link, useSearchParams } from 'react-router';
import { paths } from '@/app/paths';
import { AuthFrame } from '../components/auth-frame';
import { LoginForm } from '../components/login-form';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const registerLink = `${paths.register}?${searchParams.toString()}`;

  return (
    <AuthFrame
      title="Bem-vindo de volta."
      lead="Entre para acompanhar os lotes em pregão, dar lances e guardar seus comprovantes."
      footer={
        <p>
          Ainda não tem conta?{' '}
          <Link
            to={registerLink}
            className="font-[560] text-ink underline-offset-4 hover:underline"
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
