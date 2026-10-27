import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { fieldAria } from '@/components/ui/field-aria';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useLogin } from '../hooks/use-login';
import { loginSchema, type LoginInput } from '../schemas';

export function LoginForm() {
  const { login, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  return (
    <form
      className="flex flex-col gap-5"
      noValidate
      onSubmit={handleSubmit((input) => login(input))}
    >
      <FormField id="email" label="E-mail" error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          {...fieldAria('email', errors.email?.message)}
          {...register('email')}
        />
      </FormField>
      <FormField id="password" label="Senha" error={errors.password?.message}>
        <Input
          type="password"
          autoComplete="current-password"
          {...fieldAria('password', errors.password?.message)}
          {...register('password')}
        />
      </FormField>
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  );
}
