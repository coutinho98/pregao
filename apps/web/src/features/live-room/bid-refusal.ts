import { type ApiErrorBody, ErrorCode } from '@pregao/shared';
import { ApiError } from '@/lib/http';
import { formatCents } from '@/utils/money';

const refusalMessages: Partial<Record<ErrorCode, (body: ApiErrorBody) => string>> = {
  [ErrorCode.BELOW_MINIMUM]: ({ minNextBidCents }) =>
    `O lance mínimo agora é ${formatCents(minNextBidCents ?? 0)}.`,
  [ErrorCode.INSUFFICIENT_FUNDS]: ({ details }) =>
    `Seu saldo disponível é ${formatCents(Number(details?.availableCents ?? 0))}. ` +
    'Deposite mais na carteira para continuar.',
  [ErrorCode.ALREADY_WINNING]: () =>
    'Você já está ganhando este lote. Espere outro lance para cobrir.',
  [ErrorCode.NOT_STARTED]: () => 'Este lote ainda não abriu para lances.',
  [ErrorCode.LOT_ENDED]: () => 'O martelo já foi batido neste lote.',
  [ErrorCode.AUCTIONEER_CANNOT_BID]: () => 'Leiloeiros acompanham o pregão, mas não dão lances.',
};

/** The house's answer to a refused bid, saying what to do next. */
export function bidRefusalMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Não foi possível enviar o lance. Tente de novo.';
  return refusalMessages[error.code]?.(error.body) ?? error.message;
}
