import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module.js';
import { validateEnv } from './common/config/env.js';
import { PrismaModule } from './common/prisma/prisma.module.js';
import { HealthController } from './health/health.controller.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { BidsModule } from './modules/bids/bids.module.js';
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { LotsModule } from './modules/lots/lots.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { WalletModule } from './modules/wallet/wallet.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    CommonModule,
    UsersModule,
    AuthModule,
    WalletModule,
    CatalogModule,
    LotsModule,
    BidsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
