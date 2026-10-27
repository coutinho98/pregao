/**
 * Demo of the tamper-evident history: changes one bid straight in the database, the way
 * someone with database access (but without the signing key) would, and prints where to see
 * the audit page catch it.
 *
 *   pnpm tamper:demo                    tampers the middle bid of the latest lot with 2+ bids
 *   pnpm tamper:demo <lotId>            tampers that lot
 *   pnpm tamper:demo --restore <bidId> <amountCents>   puts the original amount back
 */
import 'dotenv/config';
import pg from 'pg';

const APP_URL = (process.env.APP_URL ?? 'http://localhost:5173').replace(/\/$/, '');
const TAMPER_CENTS = 100_000;

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function findTarget(lotId: string | undefined) {
  const lot = await client.query<{ id: string; number: number; bidCount: number }>(
    lotId
      ? 'SELECT id, number, "bidCount" FROM lots WHERE id = $1'
      : 'SELECT id, number, "bidCount" FROM lots WHERE "bidCount" >= 2 ORDER BY "createdAt" DESC LIMIT 1',
    lotId ? [lotId] : [],
  );
  const target = lot.rows[0];
  if (!target) throw new Error('No lot with at least two bids. Place some bids first.');
  const seq = Math.max(1, Math.ceil(target.bidCount / 2));
  const bid = await client.query<{ id: string; amountCents: string }>(
    'SELECT id, "amountCents" FROM bids WHERE "lotId" = $1 AND seq = $2',
    [target.id, seq],
  );
  const row = bid.rows[0];
  if (!row) throw new Error(`Lot ${target.id} has no bid #${seq}.`);
  return { lot: target, seq, bid: row };
}

async function tamper(lotId: string | undefined): Promise<void> {
  const { lot, seq, bid } = await findTarget(lotId);
  const forged = BigInt(bid.amountCents) + BigInt(TAMPER_CENTS);
  await client.query('UPDATE bids SET "amountCents" = $1 WHERE id = $2', [
    forged.toString(),
    bid.id,
  ]);

  console.log(
    `Lote ${lot.number}: o lance #${seq} foi de ${bid.amountCents} para ${forged} centavos.`,
  );
  console.log(
    'Nenhum hash ou assinatura foi recalculado: é o que um invasor com acesso ao banco faria.',
  );
  console.log(`\nVeja a auditoria apontar o lance #${seq}:\n  ${APP_URL}/auditoria/${lot.id}`);
  console.log(`\nPara desfazer:\n  pnpm tamper:demo --restore ${bid.id} ${bid.amountCents}`);
}

async function restore(bidId: string | undefined, amountCents: string | undefined): Promise<void> {
  if (!bidId || !amountCents)
    throw new Error('Usage: pnpm tamper:demo --restore <bidId> <amountCents>');
  await client.query('UPDATE bids SET "amountCents" = $1 WHERE id = $2', [amountCents, bidId]);
  console.log(`Lance ${bidId} restaurado para ${amountCents} centavos.`);
}

const [first, ...rest] = process.argv.slice(2);
await client.connect();
try {
  if (first === '--restore') await restore(rest[0], rest[1]);
  else await tamper(first);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end();
}
