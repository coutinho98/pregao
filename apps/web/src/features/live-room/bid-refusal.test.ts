import { ErrorCode } from '@pregao/shared';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/http';
import { bidRefusalMessage } from './bid-refusal';

const nbsp = (text: string) => text.replace(/\u00a0/g, ' ');
const refusal = (body: ConstructorParameters<typeof ApiError>[1]) =>
  nbsp(bidRefusalMessage(new ApiError(422, body)));

describe('bidRefusalMessage', () => {
  it('tells the new minimum', () => {
    expect(refusal({ code: ErrorCode.BELOW_MINIMUM, message: 'x', minNextBidCents: 440_000 })).toBe(
      'O lance mínimo agora é R$ 4.400.',
    );
  });

  it('tells the available balance and what to do', () => {
    expect(
      refusal({
        code: ErrorCode.INSUFFICIENT_FUNDS,
        message: 'x',
        details: { availableCents: 120_000 },
      }),
    ).toBe('Seu saldo disponível é R$ 1.200. Deposite mais na carteira para continuar.');
  });

  it('falls back to the server message for other codes', () => {
    expect(refusal({ code: ErrorCode.NOT_FOUND, message: 'Lote não encontrado.' })).toBe(
      'Lote não encontrado.',
    );
  });

  it('handles network failures', () => {
    expect(bidRefusalMessage(new Error('offline'))).toMatch(/Tente de novo/);
  });
});
