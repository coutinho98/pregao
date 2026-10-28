/** "Lote 007". */
export const formatLotNumber = (number: number) => `Lote ${String(number).padStart(3, '0')}`;

/**
 * The work's own size in centimetres, as a Brazilian reader writes it: the museum's
 * "207.5 × 308.1 cm (81 3/4 × 121 1/4 in.); Framed: …" becomes "207,5 × 308,1 cm".
 */
export const formatDimensions = (dimensions: string) =>
  dimensions
    .split(';')[0]!
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/(\d)\.(\d)/g, '$1,$2')
    .trim();
