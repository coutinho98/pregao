import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiErrorBody, ErrorCode } from '@pregao/shared';

export class ApiErrorDto implements ApiErrorBody {
  @ApiProperty({ enum: Object.values(ErrorCode), example: ErrorCode.VALIDATION_FAILED })
  code: ErrorCode;

  @ApiProperty({ example: 'Dados inválidos.' })
  message: string;

  @ApiPropertyOptional({ example: { fields: { email: ['email must be an email'] } } })
  details?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Próximo lance aceito, em centavos (erros de lance).' })
  minNextBidCents?: number;
}
