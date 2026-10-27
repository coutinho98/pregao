import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { type AuditTrail, ErrorCode } from '@pregao/shared';
import { ApiDomainErrors } from '../../common/openapi/api-domain-errors.decorator.js';
import { AuditService } from './audit.service.js';
import { AuditTrailDto } from './dto/audit-trail.dto.js';

@ApiTags('Auditoria')
@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get(':lotId')
  @ApiOperation({
    summary: 'Histórico encadeado e assinado de um lote, para verificação independente',
    description:
      'Público e sem login. Devolve os dados como estão no banco, os hashes, as assinaturas ' +
      'Ed25519 e a chave pública. A verificação acontece no cliente (a página de auditoria ' +
      'usa o mesmo verificador de packages/shared).',
  })
  @ApiOkResponse({ type: AuditTrailDto })
  @ApiDomainErrors(ErrorCode.VALIDATION_FAILED, ErrorCode.NOT_FOUND)
  getTrail(@Param('lotId', ParseUUIDPipe) lotId: string): Promise<AuditTrail> {
    return this.audit.getTrail(lotId);
  }
}
