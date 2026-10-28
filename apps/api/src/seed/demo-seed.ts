import type { INestApplicationContext } from '@nestjs/common';
import { DEMO_ACCOUNTS, type DemoAccountKey, DEMO_PASSWORD, Role } from '@pregao/shared';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { AuthService } from '../modules/auth/auth.service.js';
import { BidsService } from '../modules/bids/bids.service.js';
import { LotsService } from '../modules/lots/lots.service.js';
import { SettlementService } from '../modules/settlement/settlement.service.js';
import { WalletService } from '../modules/wallet/wallet.service.js';
import { DemoSeedRepository } from './demo-seed.repository.js';

const DEPOSIT_CENTS = 5_000_000;
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

export interface DemoLots {
  live: string;
  endingSoon: string;
  scheduled: string;
  sold: string;
  tampered: string;
}

type Bidder = Exclude<DemoAccountKey, 'auctioneer'>;

/**
 * The demo the evaluator walks through: one auctioneer, two funded bidders, a lot open for
 * 30 days with bids, one ending in a few hours, one scheduled, one sold with a receipt, and
 * one sold lot whose history was tampered with on purpose to show the audit catching it,
 * plus five more works spread over the phases (live with and without bids, scheduled,
 * sold, and closed without bids).
 * Everything goes through the real services, so chains, signatures and ledgers are genuine.
 */
export class DemoSeed {
  private readonly repository: DemoSeedRepository;
  private readonly users = new Map<DemoAccountKey, string>();

  constructor(private readonly app: INestApplicationContext) {
    this.repository = new DemoSeedRepository(app.get(PrismaService));
  }

  /** The demo only goes into a database nobody has used yet (or one just reset). */
  async isEmpty(): Promise<boolean> {
    return !(await this.repository.hasUsers());
  }

  /** Wipes every table (keeps the migrations) so the demo starts from scratch. */
  async reset(): Promise<void> {
    await this.repository.truncateAll();
  }

  async run(): Promise<DemoLots> {
    await this.createAccounts();
    const now = Date.now();
    const at = (offset: number) => new Date(now + offset).toISOString();

    const live = await this.createLot('16568', 120_000, 10_000, at(0), at(30 * DAY));
    await this.bid(live, 'ana', 120_000);
    await this.bid(live, 'bruno', 130_000);
    await this.bid(live, 'ana', 150_000);

    const endingSoon = await this.createLot('27992', 300_000, 20_000, at(0), at(3 * 60 * MINUTE));
    await this.bid(endingSoon, 'bruno', 300_000);

    const scheduled = await this.createLot('28560', 250_000, 10_000, at(2 * DAY), at(5 * DAY));

    const sold = await this.createLot('20684', 200_000, 10_000, at(-30_000), at(6 * MINUTE));
    await this.bid(sold, 'ana', 200_000);
    await this.bid(sold, 'bruno', 220_000);
    await this.bid(sold, 'ana', 250_000);
    await this.hammer(sold);

    const tampered = await this.createLot('14598', 180_000, 10_000, at(-30_000), at(6 * MINUTE));
    await this.bid(tampered, 'bruno', 180_000);
    await this.bid(tampered, 'ana', 190_000);
    await this.bid(tampered, 'bruno', 210_000);
    await this.hammer(tampered);
    await this.tamper(tampered);

    await this.createGallery(at);

    return { live, endingSoon, scheduled, sold, tampered };
  }

  /** More works across the tabs, so the showcase has something in every phase. */
  private async createGallery(at: (offset: number) => string): Promise<void> {
    const wave = await this.createLot('24645', 400_000, 20_000, at(0), at(10 * DAY));
    await this.bid(wave, 'bruno', 400_000);
    await this.bid(wave, 'ana', 450_000);

    await this.createLot('80607', 350_000, 25_000, at(0), at(6 * DAY));

    await this.createLot('87479', 500_000, 50_000, at(DAY), at(8 * DAY));

    const bath = await this.createLot('111442', 150_000, 10_000, at(-30_000), at(6 * MINUTE));
    await this.bid(bath, 'bruno', 150_000);
    await this.bid(bath, 'ana', 170_000);
    await this.hammer(bath);

    const millinery = await this.createLot('14572', 220_000, 10_000, at(-30_000), at(6 * MINUTE));
    await this.hammer(millinery);
  }

  private async createAccounts(): Promise<void> {
    const auth = this.app.get(AuthService);
    const wallet = this.app.get(WalletService);
    for (const [key, account] of Object.entries(DEMO_ACCOUNTS)) {
      const { user } = await auth.register({ ...account, password: DEMO_PASSWORD });
      this.users.set(key as DemoAccountKey, user.id);
      if (account.role === Role.BIDDER) await wallet.deposit(user.id, DEPOSIT_CENTS);
    }
  }

  private async createLot(
    externalId: string,
    startingPriceCents: number,
    minIncrementCents: number,
    startsAt: string,
    endsAt: string,
  ): Promise<string> {
    const lot = await this.app.get(LotsService).create(this.userId('auctioneer'), {
      externalId,
      startingPriceCents,
      minIncrementCents,
      startsAt,
      endsAt,
    });
    return lot.id;
  }

  private async bid(lotId: string, bidder: Bidder, amountCents: number): Promise<void> {
    await this.app
      .get(BidsService)
      .placeBid({ id: this.userId(bidder), role: Role.BIDDER }, lotId, amountCents);
  }

  /** Ends a lot that just received its bids and settles it. */
  private async hammer(lotId: string): Promise<void> {
    await this.repository.endNow(lotId, new Date());
    await this.app.get(SettlementService).settleIfDue(lotId);
  }

  /** What an attacker with database access would do: change bid #2, recompute nothing. */
  private async tamper(lotId: string): Promise<void> {
    await this.repository.overwriteBidAmount(lotId, 2, 290_000n);
    await this.repository.renameLotArtwork(
      lotId,
      'The Beach at Sainte-Adresse (demonstração de adulteração)',
    );
  }

  private userId(key: DemoAccountKey): string {
    const id = this.users.get(key);
    if (!id) throw new Error(`Demo account ${key} was not created`);
    return id;
  }
}
