import { Module } from '@nestjs/common';
import { ReceiptsController } from './receipts.controller.js';
import { ReceiptsRepository } from './receipts.repository.js';
import { ReceiptsService } from './receipts.service.js';

@Module({
  controllers: [ReceiptsController],
  providers: [ReceiptsService, ReceiptsRepository],
})
export class ReceiptsModule {}
