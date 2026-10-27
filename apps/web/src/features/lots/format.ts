/** "Lote 007". */
export const formatLotNumber = (number: number) => `Lote ${String(number).padStart(3, '0')}`;
