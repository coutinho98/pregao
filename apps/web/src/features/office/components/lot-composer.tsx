import { zodResolver } from '@hookform/resolvers/zod';
import type { CatalogItem } from '@pregao/shared';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { fieldAria } from '@/components/ui/field-aria';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { toDateTimeLocal } from '@/utils/date';
import { useCreateLot } from '../hooks/use-create-lot';
import { type LotFormInput, type LotFormValues, lotFormSchema, toCreateLotInput } from '../schemas';
import { LotPreview } from './lot-preview';

const DAY_MS = 24 * 60 * 60_000;

function defaultValues(): LotFormInput {
  const now = Date.now();
  return {
    startingPrice: '',
    minIncrement: '',
    startsAt: toDateTimeLocal(new Date(now + 5 * 60_000)),
    endsAt: toDateTimeLocal(new Date(now + 2 * DAY_MS)),
  };
}

interface LotComposerProps {
  item: CatalogItem;
  onDone: () => void;
}

/** Card that turns the chosen artwork into a lot, with a live preview of its tile. */
export function LotComposer({ item, onDone }: LotComposerProps) {
  const { createLot, isPending } = useCreateLot({ onCreated: onDone });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LotFormInput, unknown, LotFormValues>({
    resolver: zodResolver(lotFormSchema),
    defaultValues: defaultValues(),
  });

  const fieldError = (name: keyof LotFormInput) => errors[name]?.message;

  return (
    <section aria-labelledby="composer-heading" className="rounded-[22px] bg-card p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="composer-heading" className="text-[16px] font-semibold tracking-[-0.01em]">
          Montar lote
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDone}
          disabled={isPending}
          aria-label="Escolher outra obra"
        >
          <X size={17} />
        </Button>
      </div>
      <LotPreview item={item} control={control} />
      <form
        noValidate
        className="mt-5 flex flex-col gap-3"
        onSubmit={handleSubmit((values) => createLot(toCreateLotInput(item.externalId, values)))}
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField
            id="startingPrice"
            label="Lance inicial (R$)"
            error={fieldError('startingPrice')}
          >
            <Input
              inputMode="decimal"
              placeholder="1.500"
              className="tabular"
              {...fieldAria('startingPrice', fieldError('startingPrice'))}
              {...register('startingPrice')}
            />
          </FormField>
          <FormField id="minIncrement" label="Incremento (R$)" error={fieldError('minIncrement')}>
            <Input
              inputMode="decimal"
              placeholder="100"
              className="tabular"
              {...fieldAria('minIncrement', fieldError('minIncrement'))}
              {...register('minIncrement')}
            />
          </FormField>
          <FormField id="startsAt" label="Abertura" error={fieldError('startsAt')}>
            <Input
              type="datetime-local"
              {...fieldAria('startsAt', fieldError('startsAt'))}
              {...register('startsAt')}
            />
          </FormField>
          <FormField id="endsAt" label="Encerramento" error={fieldError('endsAt')}>
            <Input
              type="datetime-local"
              {...fieldAria('endsAt', fieldError('endsAt'))}
              {...register('endsAt')}
            />
          </FormField>
        </div>
        <Button type="submit" variant="primary" disabled={isPending} className="mt-2 w-full">
          {isPending ? 'Copiando a obra do acervo…' : 'Criar lote'}
        </Button>
      </form>
    </section>
  );
}
