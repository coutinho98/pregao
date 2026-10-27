import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorCode, type LotDetail, type LotPage, type LotSummary, Role } from '@pregao/shared';
import { Auth, CurrentUser } from '../../common/auth/auth.decorators.js';
import type { RequestUser } from '../../common/auth/request-user.js';
import { ApiDomainErrors } from '../../common/openapi/api-domain-errors.decorator.js';
import { CreateLotDto } from './dto/create-lot.dto.js';
import { LotListQueryDto } from './dto/lot-list-query.dto.js';
import { LotDetailDto, LotPageDto, LotSummaryDto } from './dto/lot-response.dto.js';
import { LotsService } from './lots.service.js';

@ApiTags('Lotes')
@Controller('lots')
export class LotsController {
  constructor(private readonly lots: LotsService) {}

  @Get()
  @ApiOperation({
    summary: 'Vitrine: lotes por fase (ao vivo, agendados ou encerrados). Cancelados não aparecem.',
    description: 'Não depende da API do museu: dados e imagens vêm do snapshot salvo na criação.',
  })
  @ApiOkResponse({ type: LotPageDto })
  @ApiDomainErrors(ErrorCode.VALIDATION_FAILED)
  list(@Query() query: LotListQueryDto): Promise<LotPage> {
    return this.lots.list(query);
  }

  @Get('mine')
  @Auth(Role.AUCTIONEER)
  @ApiOperation({ summary: 'Lotes do leiloeiro autenticado, incluindo cancelados' })
  @ApiOkResponse({ type: [LotSummaryDto] })
  listMine(@CurrentUser() user: RequestUser): Promise<LotSummary[]> {
    return this.lots.listByAuctioneer(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detalhes de um lote, com o próximo lance mínimo e o relógio do servidor',
  })
  @ApiOkResponse({ type: LotDetailDto })
  @ApiDomainErrors(ErrorCode.VALIDATION_FAILED, ErrorCode.NOT_FOUND)
  getDetail(@Param('id', ParseUUIDPipe) id: string): Promise<LotDetail> {
    return this.lots.getDetail(id);
  }

  @Post()
  @Auth(Role.AUCTIONEER)
  @ApiOperation({
    summary: 'Cria um lote a partir de uma obra do acervo',
    description:
      'Salva um snapshot da obra (dados e imagem) para que o lote não dependa mais do museu, ' +
      'e sela a gênese da cadeia de auditoria.',
  })
  @ApiCreatedResponse({ type: LotDetailDto })
  @ApiDomainErrors(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.INVALID_LOT_SCHEDULE,
    ErrorCode.ARTWORK_NOT_FOUND,
    ErrorCode.ARTWORK_ALREADY_LISTED,
    ErrorCode.EXTERNAL_API_UNAVAILABLE,
  )
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateLotDto): Promise<LotDetail> {
    return this.lots.create(user.id, dto);
  }
}
