import { LotPhase } from '@pregao/shared';

export const phaseLabel: Record<LotPhase, string> = {
  [LotPhase.SCHEDULED]: 'Agendado',
  [LotPhase.LIVE]: 'Em pregão',
  [LotPhase.ENDED]: 'Martelo batido',
  [LotPhase.CANCELLED]: 'Cancelado',
};
