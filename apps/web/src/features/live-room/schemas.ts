import { z } from 'zod';
import { formatCents, parseBrlToCents } from '@/utils/money';

/** Bid amount in reais, checked against the minimum the room knows about (the API decides). */
export function bidSchema(minNextBidCents: number) {
  return z.object({
    amount: z
      .string()
      .transform((value, ctx) => {
        const cents = parseBrlToCents(value);
        if (cents === null) {
          ctx.addIssue({ code: 'custom', message: 'Informe o lance em reais, como 4.400.' });
          return z.NEVER;
        }
        return cents;
      })
      .pipe(
        z.number().min(minNextBidCents, `O lance mínimo agora é ${formatCents(minNextBidCents)}.`),
      ),
  });
}

export type BidFormInput = z.input<ReturnType<typeof bidSchema>>;
export type BidFormValues = z.output<ReturnType<typeof bidSchema>>;

/** "4.400" or "4.400,50": how the minimum is pre-filled in the field. */
export const centsToInput = (cents: number) =>
  formatCents(cents)
    .replace(/^R\$\s?/, '')
    .replace(/\u00a0/g, '');
