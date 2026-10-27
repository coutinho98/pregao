import { Link, useSearchParams } from 'react-router';
import { paths } from '@/app/paths';
import { AuthFrame } from '../components/auth-frame';
import { RegisterForm } from '../components/register-form';

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const loginLink = `${paths.login}?${searchParams.toString()}`;

  return (
    <AuthFrame
      title="Inscrição na casa"
      lead="Licitantes recebem uma raquete numerada em cada lote. Seu nome nunca aparece para os outros participantes."
      footer={
        <p>
          Já tem conta?{' '}
          <Link
            to={loginLink}
            className="font-semibold text-latao-texto underline underline-offset-4"
          >
            Entrar
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthFrame>
  );
}
