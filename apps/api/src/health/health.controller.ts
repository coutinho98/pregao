import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Infra')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Verificação de saúde para o provedor de hospedagem' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
