import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorCode, type LedgerPage, Role, type WalletSummary } from '@pregao/shared';
import { Auth, CurrentUser } from '../../common/auth/auth.decorators.js';
import type { RequestUser } from '../../common/auth/request-user.js';
import { ApiDomainErrors } from '../../common/openapi/api-domain-errors.decorator.js';
import { DepositDto } from './dto/deposit.dto.js';
import { LedgerQueryDto } from './dto/ledger-query.dto.js';
import { LedgerPageDto, WalletSummaryDto } from './dto/wallet-response.dto.js';
import { WalletService } from './wallet.service.js';

@ApiTags('Carteira')
@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Saldo total, comprometido e disponível do usuário autenticado' })
  @ApiOkResponse({ type: WalletSummaryDto })
  getSummary(@CurrentUser() user: RequestUser): Promise<WalletSummary> {
    return this.wallet.getSummary(user.id);
  }

  @Post('deposits')
  @Auth(Role.BIDDER)
  @ApiOperation({ summary: 'Depósito simulado na carteira do licitante' })
  @ApiCreatedResponse({ type: WalletSummaryDto })
  @ApiDomainErrors(ErrorCode.VALIDATION_FAILED)
  deposit(
    @CurrentUser() user: RequestUser,
    @Body() { amountCents }: DepositDto,
  ): Promise<WalletSummary> {
    return this.wallet.deposit(user.id, amountCents);
  }

  @Get('ledger')
  @Auth()
  @ApiOperation({ summary: 'Extrato (livro-caixa), do mais recente para o mais antigo' })
  @ApiOkResponse({ type: LedgerPageDto })
  @ApiDomainErrors(ErrorCode.VALIDATION_FAILED)
  getLedger(
    @CurrentUser() user: RequestUser,
    @Query() { cursor }: LedgerQueryDto,
  ): Promise<LedgerPage> {
    return this.wallet.getLedger(user.id, cursor);
  }
}
