import { Link, useSearchParams } from 'react-router';
import { paths } from '@/app/paths';
import { Chip } from '@/components/ui/chip';
import { AuthFrame } from '../components/auth-frame';
import { RegisterForm } from '../components/register-form';

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const loginLink = `${paths.login}?${searchParams.toString()}`;

  return (
    <AuthFrame
      title="Faça sua inscrição."
      lead={
        <>
          Em cada lote você recebe uma raquete com um número, como{' '}
          <Chip className="tabular">#A3F9C2</Chip>. Seu nome nunca aparece para os outros
          participantes.
        </>
      }
      footer={
        <p>
          Já tem conta?{' '}
          <Link to={loginLink} className="font-[560] text-ink underline-offset-4 hover:underline">
            Entrar
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthFrame>
  );
}
