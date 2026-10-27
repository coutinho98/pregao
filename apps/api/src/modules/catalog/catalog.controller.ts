import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { type CatalogItem, type CatalogSearchResult, ErrorCode, Role } from '@pregao/shared';
import { Auth } from '../../common/auth/auth.decorators.js';
import { ApiDomainErrors } from '../../common/openapi/api-domain-errors.decorator.js';
import { ExternalIdPipe } from './external-id.pipe.js';
import { CatalogService } from './catalog.service.js';
import { CatalogItemDto, CatalogSearchResultDto } from './dto/catalog-item.dto.js';
import { CatalogSearchQueryDto } from './dto/catalog-search-query.dto.js';

@ApiTags('Acervo (Art Institute of Chicago)')
@Controller('catalog')
@Auth(Role.AUCTIONEER)
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('search')
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

  @Get('items/:externalId')
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
