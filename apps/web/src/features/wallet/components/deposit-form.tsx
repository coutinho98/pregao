import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { fieldAria } from '@/components/ui/field-aria';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { formatCents } from '@/utils/money';
import { useDeposit } from '../hooks/use-deposit';
import { type DepositFormInput, type DepositFormValues, depositSchema } from '../schemas';

const QUICK_AMOUNTS_CENTS = [100_000, 500_000, 1_000_000];

export function DepositForm() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DepositFormInput, unknown, DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: { amount: '' },
  });
  const { deposit, isPending } = useDeposit({ onDeposited: () => reset() });
  const error = errors.amount?.message;

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(({ amount }) => deposit({ amountCents: amount }))}
    >
      <FormField
        id="amount"
        label="Valor do depósito (R$)"
        hint="Depósito simulado: nenhum dinheiro real é movimentado."
        error={error}
      >
        <Input
          inputMode="decimal"
          placeholder="5.000"
          {...fieldAria('amount', error)}
          {...register('amount')}
        />
      </FormField>
      <div className="flex flex-wrap gap-2" aria-label="Valores sugeridos">
        {QUICK_AMOUNTS_CENTS.map((cents) => (
          <Button
            key={cents}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setValue('amount', String(cents / 100), { shouldValidate: true })}
          >
            {formatCents(cents)}
          </Button>
        ))}
      </div>
      <Button type="submit" size="lg" disabled={isPending} className="self-start">
        {isPending ? 'Depositando…' : 'Depositar'}
      </Button>
    </form>
  );
}
