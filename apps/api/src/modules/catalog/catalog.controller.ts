import { Controller, Get, Param, Query, Res, StreamableFile } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiProduces, ApiTags } from '@nestjs/swagger';
import { type CatalogItem, type CatalogSearchResult, ErrorCode, Role } from '@pregao/shared';
import type { Response } from 'express';
import { Auth } from '../../common/auth/auth.decorators.js';
import { ApiDomainErrors } from '../../common/openapi/api-domain-errors.decorator.js';
import { ExternalIdPipe } from './external-id.pipe.js';
import { CatalogService } from './catalog.service.js';
import { CatalogItemDto, CatalogSearchResultDto } from './dto/catalog-item.dto.js';
import { CatalogSearchQueryDto } from './dto/catalog-search-query.dto.js';

@ApiTags('Acervo (Art Institute of Chicago)')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('search')
  @Auth(Role.AUCTIONEER)
  @ApiOperation({
    summary: 'Busca obras em domínio público e com imagem no acervo do museu',
    description:
      'Resultados em cache por 10 minutos. Timeout, retry e circuit breaker na chamada externa.',
  })
  @ApiOkResponse({ type: CatalogSearchResultDto })
  @ApiDomainErrors(ErrorCode.VALIDATION_FAILED, ErrorCode.EXTERNAL_API_UNAVAILABLE)
  search(@Query() { q, page }: CatalogSearchQueryDto): Promise<CatalogSearchResult> {
    return this.catalog.search(q, page);
  }

  @Get('items/:externalId/thumbnail')
  @ApiOperation({
    summary: 'Miniatura (400px) de uma obra do acervo, servida pela própria API',
    description:
      'Público porque é carregado por <img>. O CDN do museu bloqueia o navegador, então a API ' +
      'busca com o header AIC-User-Agent e guarda em cache por 1 hora. Só atende obras que ' +
      'apareceram numa busca da última hora, para ninguém gastar o limite do museu varrendo ids.',
  })
  @ApiParam({ name: 'externalId', example: '16568' })
  @ApiProduces('image/jpeg')
  @ApiOkResponse({ description: 'Bytes da miniatura' })
  @ApiDomainErrors(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.ARTWORK_NOT_FOUND,
    ErrorCode.EXTERNAL_API_UNAVAILABLE,
  )
  async getThumbnail(
    @Param('externalId', ExternalIdPipe) externalId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const thumbnail = await this.catalog.getThumbnail(externalId);
    response.set({ 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' });
    return new StreamableFile(thumbnail);
  }

  @Get('items/:externalId')
  @Auth(Role.AUCTIONEER)
  @ApiOperation({ summary: 'Detalhes de uma obra do acervo (prévia antes de criar o lote)' })
  @ApiParam({ name: 'externalId', example: '16568' })
  @ApiOkResponse({ type: CatalogItemDto })
  @ApiDomainErrors(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.ARTWORK_NOT_FOUND,
    ErrorCode.EXTERNAL_API_UNAVAILABLE,
  )
  getItem(@Param('externalId', ExternalIdPipe) externalId: string): Promise<CatalogItem> {
    return this.catalog.getItem(externalId);
  }
}
