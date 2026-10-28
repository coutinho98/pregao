import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@pregao/shared';
import { resolve } from 'node:path';
import { AppModule } from '../app.module.js';
import { DemoSeed } from './demo-seed.js';

/**
 *   node dist/seed/run.js             seeds an empty database (refuses otherwise)
 *   node dist/seed/run.js --if-empty  seeds only if the database has no users; never fails
 *   node dist/seed/run.js --reset     wipes everything and seeds again
 */
async function main(): Promise<void> {
  // The seed settles lots itself and works offline from the bundled artworks.
  process.env.SETTLEMENT_INTERVAL_MS = '0';
  process.env.CATALOG_FIXTURES_DIR ??= resolve(process.cwd(), 'prisma/seed-assets');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  // Quiet while the app boots; the seed's own summary should still be printed.
  Logger.overrideLogger(['log', 'error', 'warn']);
  const logger = new Logger('Seed');
  try {
    const seed = new DemoSeed(app);
    const flags = new Set(process.argv.slice(2));
    if (flags.has('--reset')) await seed.reset();
    if (!(await seed.isEmpty())) {
      if (flags.has('--if-empty')) return;
      logger.warn('The database already has data. Use --reset to wipe it and seed the demo.');
      process.exitCode = 1;
      return;
    }

    const lots = await seed.run();
    logger.log(`Demo seeded. Password for every account: ${DEMO_PASSWORD}`);
    for (const { email, role } of Object.values(DEMO_ACCOUNTS))
      logger.log(`  ${role.padEnd(10)} ${email}`);
    logger.log(`  Live lot (30 days):  /lotes/${lots.live}`);
    logger.log(`  Sold lot audit:      /auditoria/${lots.sold}`);
    logger.log(`  Tampered lot audit:  /auditoria/${lots.tampered}`);
  } finally {
    await app.close();
  }
}

void main();
