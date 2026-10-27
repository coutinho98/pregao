import { zodResolver } from '@hookform/resolvers/zod';
import { PASSWORD_MIN_LENGTH } from '@pregao/shared';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { fieldAria } from '@/components/ui/field-aria';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useRegister } from '../hooks/use-register';
import { registerSchema, type RegisterInput } from '../schemas';
import { RoleChoice } from './role-choice';

export function RegisterForm() {
  const { register: createAccount, isPending } = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={handleSubmit((input) => createAccount(input))}
    >
      <RoleChoice field={register('role')} error={errors.role?.message} />
      <FormField id="name" label="Nome" error={errors.name?.message}>
        <Input
          autoComplete="name"
          {...fieldAria('name', errors.name?.message)}
          {...register('name')}
        />
      </FormField>
      <FormField id="email" label="E-mail" error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          {...fieldAria('email', errors.email?.message)}
          {...register('email')}
        />
      </FormField>
      <FormField
        id="password"
        label="Senha"
        hint={`Pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`}
        error={errors.password?.message}
      >
        <Input
          type="password"
          autoComplete="new-password"
          {...fieldAria('password', errors.password?.message)}
          {...register('password')}
        />
      </FormField>
      <Button type="submit" variant="primary" disabled={isPending} className="mt-2 w-full">
        {isPending ? 'Criando conta…' : 'Criar conta'}
      </Button>
    </form>
  );
}
