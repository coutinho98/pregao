import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { formatCents } from '@/utils/money';
import { usePlaceBid } from '../hooks/use-place-bid';
import { type BidFormInput, type BidFormValues, bidSchema, centsToInput } from '../schemas';

interface BidFormProps {
  lotId: string;
  minNextBidCents: number;
}

/**
 * Pre-filled with the current minimum. Mounted with `key={minNextBidCents}` by the parent,
 * so a new bid in the room refills the field with the new minimum.
 */
export function BidForm({ lotId, minNextBidCents }: BidFormProps) {
  const { placeBid, isPending, refusal } = usePlaceBid(lotId);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BidFormInput, unknown, BidFormValues>({
    resolver: zodResolver(bidSchema(minNextBidCents)),
    defaultValues: { amount: centsToInput(minNextBidCents) },
  });
  const message = errors.amount?.message ?? refusal;

  return (
    <form noValidate onSubmit={handleSubmit(({ amount }) => placeBid(amount))}>
      <p
        id="bid-message"
        aria-live="polite"
        className={
          message
            ? 'mb-2 px-3 text-[13px] font-medium text-danger'
            : 'mb-2 px-3 text-[13px] text-ink-3'
        }
      >
        {message ?? `Mínimo agora: ${formatCents(minNextBidCents)}`}
      </p>
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
    </form>
  );
}
