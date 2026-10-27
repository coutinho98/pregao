import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ErrorCode, type ReceiptView } from '@pregao/shared';
import { ApiDomainErrors } from '../../common/openapi/api-domain-errors.decorator.js';
import { ReceiptViewDto } from './dto/receipt-view.dto.js';
import { ReceiptsService } from './receipts.service.js';

@ApiTags('Comprovantes')
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receipts: ReceiptsService) {}

  @Get(':token')
  @ApiOperation({
    summary: 'Comprovante público de arremate (sem login)',
    description: 'Identifica o vencedor só pelo pseudônimo do lote e traz o hash final da cadeia.',
  })
  @ApiParam({ name: 'token', description: 'Token aleatório gerado na liquidação' })
  @ApiOkResponse({ type: ReceiptViewDto })
  @ApiDomainErrors(ErrorCode.NOT_FOUND)
  get(@Param('token') token: string): Promise<ReceiptView> {
    return this.receipts.getByToken(token);
  }
}
