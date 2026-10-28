import { PrismaService } from '../common/prisma/prisma.service.js';

/**
 * The few things the demo does straight in the database, on purpose outside the app's
 * rules: wiping it, ending a lot early, and tampering with a bid like an attacker would.
 */
export class DemoSeedRepository {
  constructor(private readonly prisma: PrismaService) {}

  async hasUsers(): Promise<boolean> {
    return (await this.prisma.user.count()) > 0;
  }

  /** Every table except the migrations, emptied in one statement. */
  async truncateAll(): Promise<void> {
    const tables = await this.prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
    const list = tables.map(({ tablename }) => `"${tablename}"`).join(', ');
    await this.prisma.$executeRawUnsafe(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
  }

  /** endsAt is not part of the signed chain, so moving it keeps the history valid. */
  async endNow(lotId: string, endsAt: Date): Promise<void> {
    await this.prisma.lot.update({
      where: { id: lotId },
      data: { endsAt, originalEndsAt: endsAt },
    });
  }

  /** Changes a bid's amount without recomputing its hash or signature. */
  async overwriteBidAmount(lotId: string, seq: number, amountCents: bigint): Promise<void> {
    await this.prisma.bid.update({
      where: { lotId_seq: { lotId, seq } },
      data: { amountCents },
    });
  }

  async renameLotArtwork(lotId: string, title: string): Promise<void> {
    const lot = await this.prisma.lot.findUniqueOrThrow({ where: { id: lotId } });
    await this.prisma.itemSnapshot.update({ where: { id: lot.itemSnapshotId }, data: { title } });
  }
}
