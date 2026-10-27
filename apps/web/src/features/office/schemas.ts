import {
  type CreateLotInput,
  LOT_MAX_DURATION_MS,
  LOT_MIN_DURATION_MS,
  MAX_PRICE_CENTS,
} from '@pregao/shared';
import { z } from 'zod';
import { fromDateTimeLocal } from '@/utils/date';
import { parseBrlToCents } from '@/utils/money';

const moneyField = (what: string) =>
  z
    .string()
    .transform((value, ctx) => {
      const cents = parseBrlToCents(value);
      if (cents === null) {
        ctx.addIssue({
          code: 'custom',
          message: `Informe ${what} em reais, como 1.500 ou 1.500,50.`,
        });
        return z.NEVER;
      }
      return cents;
    })
    .pipe(
      z
        .number()
        .min(100, 'O valor mínimo é R$ 1,00.')
        .max(MAX_PRICE_CENTS, 'Valor acima do limite da casa.'),
    );

export const lotFormSchema = z
  .object({
    startingPrice: moneyField('o lance inicial'),
    minIncrement: moneyField('o incremento'),
    startsAt: z.string().min(1, 'Informe a abertura.'),
    endsAt: z.string().min(1, 'Informe o encerramento.'),
  })
  .superRefine(({ startsAt, endsAt }, ctx) => {
    const duration = new Date(endsAt).getTime() - new Date(startsAt).getTime();
    if (duration < LOT_MIN_DURATION_MS) {
      ctx.addIssue({
        code: 'custom',
        path: ['endsAt'],
        message: 'O lote precisa ficar aberto por pelo menos 5 minutos.',
      });
    }
    if (duration > LOT_MAX_DURATION_MS) {
      ctx.addIssue({
        code: 'custom',
        path: ['endsAt'],
        message: 'O lote pode ficar aberto por no máximo 60 dias.',
      });
    }
  });

export type LotFormInput = z.input<typeof lotFormSchema>;
export type LotFormValues = z.output<typeof lotFormSchema>;

export function toCreateLotInput(externalId: string, values: LotFormValues): CreateLotInput {
  return {
    externalId,
    startingPriceCents: values.startingPrice,
    minIncrementCents: values.minIncrement,
    startsAt: fromDateTimeLocal(values.startsAt),
    endsAt: fromDateTimeLocal(values.endsAt),
  };
}
