import type { Lot } from '../../generated/prisma/client.js';
import type { Tx } from './transaction-runner.js';

/**
 * SELECT ... FOR UPDATE on one lot, then reads it. Bids, settlement and cancellation all
 * take this lock first, so they run one at a time per lot and always see fresh data.
 */
export async function lockLotRow(tx: Tx, lotId: string): Promise<Lot | null> {
  await tx.$queryRaw`SELECT id FROM lots WHERE id = ${lotId}::uuid FOR UPDATE`;
  return tx.lot.findUnique({ where: { id: lotId } });
}
