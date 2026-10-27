import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../common/config/env.js';
import { ArticCatalogProvider } from './artic/artic-catalog.provider.js';
import { CATALOG_PROVIDER, type CatalogProvider } from './catalog-provider.js';
import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';
import { FixtureCatalogProvider } from './fixture-catalog.provider.js';

@Module({
  controllers: [CatalogController],
  providers: [
    CatalogService,
    {
      provide: CATALOG_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): CatalogProvider => {
        const fixturesDir = config.get('CATALOG_FIXTURES_DIR', { infer: true });
        return fixturesDir
          ? new FixtureCatalogProvider(fixturesDir)
          : new ArticCatalogProvider(config);
      },
    },
  ],
  exports: [CatalogService],
})
export class CatalogModule {}
