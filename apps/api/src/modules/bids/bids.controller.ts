import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorCode, type PlaceBidResult, type PublicBid } from '@pregao/shared';
import { Auth, CurrentUser } from '../../common/auth/auth.decorators.js';
import type { RequestUser } from '../../common/auth/request-user.js';
import { ApiDomainErrors } from '../../common/openapi/api-domain-errors.decorator.js';
import { BidsService } from './bids.service.js';
import { PlaceBidResultDto, PublicBidDto } from './dto/bid-response.dto.js';
import { PlaceBidDto } from './dto/place-bid.dto.js';

@ApiTags('Lances')
@Controller('lots/:lotId/bids')
export class BidsController {
  constructor(private readonly bids: BidsService) {}

  @Post()
  @Auth()
  @ApiOperation({
    summary: 'Dá um lance',
    description:
      'Transação única com lock do lote e das carteiras. Recusas trazem `minNextBidCents`. ' +
      'Lance aceito com 2 minutos ou menos para o fim estende o lote para agora + 2 minutos.',
  })
  @ApiCreatedResponse({ type: PlaceBidResultDto })
  @ApiDomainErrors(
    ErrorCode.VALIDATION_FAILED,
    ErrorCode.NOT_FOUND,
    ErrorCode.AUCTIONEER_CANNOT_BID,
    ErrorCode.NOT_STARTED,
    ErrorCode.LOT_ENDED,
    ErrorCode.ALREADY_WINNING,
    ErrorCode.BELOW_MINIMUM,
    ErrorCode.INSUFFICIENT_FUNDS,
  )
  place(
    @CurrentUser() user: RequestUser,
    @Param('lotId', ParseUUIDPipe) lotId: string,
    @Body() { amountCents }: PlaceBidDto,
  ): Promise<PlaceBidResult> {
    return this.bids.placeBid(user, lotId, amountCents);
  }

  @Get()
  @ApiOperation({ summary: 'Histórico público de lances do lote, do mais recente ao mais antigo' })
  @ApiOkResponse({ type: [PublicBidDto] })
  @ApiDomainErrors(ErrorCode.VALIDATION_FAILED, ErrorCode.NOT_FOUND)
  list(@Param('lotId', ParseUUIDPipe) lotId: string): Promise<PublicBid[]> {
    return this.bids.listForLot(lotId);
  }
}
