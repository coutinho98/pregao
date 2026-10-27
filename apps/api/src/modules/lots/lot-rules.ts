import { LOT_MAX_DURATION_MS, LOT_MIN_DURATION_MS, LOT_START_TOLERANCE_MS } from '@pregao/shared';

/** Why a lot schedule is invalid, in the house's voice, or null when it is fine. */
export function lotScheduleProblem(startsAt: Date, endsAt: Date, now: Date): string | null {
  if (startsAt.getTime() < now.getTime() - LOT_START_TOLERANCE_MS) {
    return 'O início do lote não pode estar no passado.';
  }
  const duration = endsAt.getTime() - startsAt.getTime();
  if (duration < LOT_MIN_DURATION_MS)
    return 'O lote precisa ficar aberto por pelo menos 5 minutos.';
  if (duration > LOT_MAX_DURATION_MS) return 'O lote pode ficar aberto por no máximo 60 dias.';
  return null;
}
