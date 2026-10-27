import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { formatCents } from '@/utils/money';
import { usePlaceBid } from '../hooks/use-place-bid';
import { type BidFormInput, type BidFormValues, bidSchema, centsToInput } from '../schemas';

interface BidFormProps {
  lotId: string;
  minNextBidCents: number;
  minIncrementCents: number;
}

/**
 * Pre-filled with the current minimum, with quick bids one and two increments above it.
 * Mounted with `key={minNextBidCents}` by the parent, so a new bid refills the field.
 */
export function BidForm({ lotId, minNextBidCents, minIncrementCents }: BidFormProps) {
  const { placeBid, isPending, refusal } = usePlaceBid(lotId);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BidFormInput, unknown, BidFormValues>({
    resolver: zodResolver(bidSchema(minNextBidCents)),
    defaultValues: { amount: centsToInput(minNextBidCents) },
  });
  const message = errors.amount?.message ?? refusal;
  const quickBids = [0, 1, 2].map((steps) => minNextBidCents + steps * minIncrementCents);

  return (
    <form
      noValidate
      onSubmit={handleSubmit(({ amount }) => placeBid(amount))}
      className="flex flex-col gap-2"
    >
      <div className="flex gap-1.5" role="group" aria-label="Lances rápidos">
        {quickBids.map((cents) => (
          <button
            key={cents}
            type="button"
            onClick={() => setValue('amount', centsToInput(cents), { shouldValidate: true })}
            className="tabular h-9 flex-1 rounded-full bg-chip text-[13px] font-medium transition-colors hover:bg-surface-2"
          >
            {formatCents(cents)}
          </button>
        ))}
      </div>
      <div className="glass flex items-center gap-2 rounded-full p-1.5 pl-5">
        <label htmlFor="bid-amount" className="tabular text-[15px] text-ink-3">
          R$
        </label>
        <input
          id="bid-amount"
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={message ? true : undefined}
          aria-describedby="bid-message"
          className="tabular h-[46px] min-w-0 grow bg-transparent text-[19px] font-semibold outline-none"
          {...register('amount')}
        />
        <Button
          type="submit"
          variant="primary"
          size="pill"
          disabled={isPending}
          className="shrink-0"
        >
          {isPending ? 'Enviando…' : 'Dar lance'}
        </Button>
      </div>
      <p
        id="bid-message"
        aria-live="polite"
        className={cn(
          'min-h-5 px-3 text-[12.5px]',
          message ? 'font-medium text-danger' : 'text-ink-3',
        )}
      >
        {message ??
          `Mínimo ${formatCents(minNextBidCents)} · incremento ${formatCents(minIncrementCents)}`}
      </p>
    </form>
  );
}
