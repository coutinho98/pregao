const wholeReais = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});
const withCents = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** "R$ 1.250" for whole amounts, "R$ 1.250,50" otherwise. */
export function formatCents(cents: number): string {
  return (cents % 100 === 0 ? wholeReais : withCents).format(cents / 100);
}

/**
 * Parses what people type in a BRL field ("1.250", "1250,5", "R$ 1.250,50") into integer
 * cents without going through floating point. Returns null when it is not a valid amount.
 */
export function parseBrlToCents(input: string): number | null {
  const normalized = input.replace(/R\$/i, '').replace(/\s/g, '').replace(/\./g, '');
  const match = /^(\d+)(?:,(\d{1,2}))?$/.exec(normalized);
  if (!match) return null;
  const [, reais = '0', cents = ''] = match;
  return Number(reais) * 100 + Number(cents.padEnd(2, '0'));
}
