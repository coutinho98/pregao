import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { CatalogModule } from '../catalog/catalog.module.js';
import { ImagesController } from './images.controller.js';
import { LotsController } from './lots.controller.js';
import { LotsRepository } from './lots.repository.js';
import { LotsService } from './lots.service.js';

@Module({
  imports: [CatalogModule, AuditModule],
  controllers: [LotsController, ImagesController],
  providers: [LotsService, LotsRepository],
})
export class LotsModule {}
