import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller.js';
import { WalletService } from './wallet.service.js';
import { WalletsRepository } from './wallets.repository.js';

@Module({
  controllers: [WalletController],
  providers: [WalletService, WalletsRepository],
  exports: [WalletService],
})
export class WalletModule {}
