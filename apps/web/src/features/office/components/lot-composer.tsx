import { zodResolver } from '@hookform/resolvers/zod';
import type { CatalogItem } from '@pregao/shared';
import { useForm } from 'react-hook-form';
import { ArtworkFrame } from '@/components/artwork/artwork-frame';
import { catalogThumbnailUrl } from '../api';
import { Button } from '@/components/ui/button';
import { fieldAria } from '@/components/ui/field-aria';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { toDateTimeLocal } from '@/utils/date';
import { useCreateLot } from '../hooks/use-create-lot';
import { type LotFormInput, type LotFormValues, lotFormSchema, toCreateLotInput } from '../schemas';
import { PlaquePreview } from './plaque-preview';

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

/** Form that turns the chosen artwork into a lot, with the plaque preview beside it. */
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
    <section aria-labelledby="composer-heading" className="flex flex-col gap-5">
      <h2 id="composer-heading" className="text-2xl">
        Montar lote
      </h2>
      <div className="grid grid-cols-[6rem_1fr] items-start gap-4">
        <ArtworkFrame
          src={catalogThumbnailUrl(item.externalId)}
          alt={item.altText ?? item.title}
          width={item.imageWidth}
          height={item.imageHeight}
        />
        <PlaquePreview item={item} control={control} />
      </div>
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) => createLot(toCreateLotInput(item.externalId, values)))}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="startingPrice"
            label="Lance inicial (R$)"
            error={fieldError('startingPrice')}
          >
            <Input
              inputMode="decimal"
              placeholder="1.500"
              {...fieldAria('startingPrice', fieldError('startingPrice'))}
              {...register('startingPrice')}
            />
          </FormField>
          <FormField
            id="minIncrement"
            label="Incremento mínimo (R$)"
            error={fieldError('minIncrement')}
          >
            <Input
              inputMode="decimal"
              placeholder="100"
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
        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? 'Copiando a obra do acervo…' : 'Criar lote'}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={onDone} disabled={isPending}>
            Escolher outra obra
          </Button>
        </div>
      </form>
    </section>
  );
}
