import { Module } from '@nestjs/common';
import { ArticCatalogProvider } from './artic/artic-catalog.provider.js';
import { CATALOG_PROVIDER } from './catalog-provider.js';
import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, { provide: CATALOG_PROVIDER, useClass: ArticCatalogProvider }],
  exports: [CatalogService],
})
export class CatalogModule {}
