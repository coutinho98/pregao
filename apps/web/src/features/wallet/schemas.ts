import { MAX_DEPOSIT_CENTS, MIN_DEPOSIT_CENTS } from '@pregao/shared';
import { z } from 'zod';
import { formatCents, parseBrlToCents } from '@/utils/money';

export const depositSchema = z.object({
  amount: z
    .string()
    .transform((value, ctx) => {
      const cents = parseBrlToCents(value);
      if (cents === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe o valor em reais, como 5.000 ou 5.000,50.',
        });
        return z.NEVER;
      }
      return cents;
    })
    .pipe(
      z
        .number()
        .min(MIN_DEPOSIT_CENTS, `O depósito mínimo é ${formatCents(MIN_DEPOSIT_CENTS)}.`)
        .max(MAX_DEPOSIT_CENTS, `O depósito máximo é ${formatCents(MAX_DEPOSIT_CENTS)} por vez.`),
    ),
});

export type DepositFormInput = z.input<typeof depositSchema>;
export type DepositFormValues = z.output<typeof depositSchema>;
