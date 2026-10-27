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
      className="flex flex-col gap-3 rounded-[22px] bg-card p-4 shadow-card"
      onSubmit={handleSubmit(({ amount }) => deposit({ amountCents: amount }))}
    >
      <FormField
        id="amount"
        label="Quanto depositar (R$)"
        hint="Depósito simulado: nenhum dinheiro real é movimentado."
        error={error}
      >
        <Input
          inputMode="decimal"
          placeholder="5.000"
          className="tabular text-[17px] font-semibold"
          {...fieldAria('amount', error)}
          {...register('amount')}
        />
      </FormField>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Valores sugeridos">
        {QUICK_AMOUNTS_CENTS.map((cents) => (
          <button
            key={cents}
            type="button"
            onClick={() => setValue('amount', String(cents / 100), { shouldValidate: true })}
            className="tabular h-8 rounded-full bg-surface px-3 text-[12.5px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            + {formatCents(cents)}
          </button>
        ))}
      </div>
      <Button type="submit" variant="primary" disabled={isPending} className="mt-1 w-full">
        {isPending ? 'Depositando…' : 'Depositar'}
      </Button>
    </form>
  );
}
