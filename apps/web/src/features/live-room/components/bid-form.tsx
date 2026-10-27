import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <form
      noValidate
      onSubmit={handleSubmit(({ amount }) => placeBid(amount))}
      className="flex flex-col gap-2"
    >
      <label htmlFor="bid-amount" className="font-label text-base font-semibold">
        Seu lance (mínimo {formatCents(minNextBidCents)})
      </label>
      <div className="flex gap-2">
        <Input
          id="bid-amount"
          inputMode="decimal"
          className="h-14 bg-papel font-display text-2xl font-bold"
          aria-invalid={message ? true : undefined}
          aria-describedby="bid-message"
          {...register('amount')}
        />
        <Button type="submit" variant="brass" size="lg" disabled={isPending} className="shrink-0">
          {isPending ? 'Enviando…' : 'Dar lance'}
        </Button>
      </div>
      <p id="bid-message" aria-live="polite" className="min-h-6 text-base font-semibold text-lacre">
        {message}
      </p>
    </form>
  );
}
