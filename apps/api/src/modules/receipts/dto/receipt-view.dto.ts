import { ApiProperty } from '@nestjs/swagger';
import type { ReceiptView } from '@pregao/shared';
import { LotImageDto } from '../../lots/dto/lot-response.dto.js';

export class ReceiptViewDto implements ReceiptView {
  @ApiProperty({ example: 'pV3x…', description: 'Token público do comprovante' })
  token: string;

  @ApiProperty({ format: 'uuid' })
  lotId: string;

  @ApiProperty({ example: 7 })
  lotNumber: number;

  @ApiProperty({ example: 'Water Lilies' })
  title: string;

  @ApiProperty({ type: String, nullable: true, example: 'Claude Monet' })
  artist: string | null;

  @ApiProperty({ type: LotImageDto })
  image: LotImageDto;

  @ApiProperty({ example: 430000, description: 'Valor do arremate em centavos' })
  amountCents: number;

  @ApiProperty({ example: 'Licitante #A3F9C2', description: 'Pseudônimo do vencedor no lote' })
  winnerPseudonym: string;

  @ApiProperty({ example: 12 })
  bidCount: number;

  @ApiProperty({ description: 'Hash do último lance da cadeia, selado no comprovante' })
  finalHash: string;

  @ApiProperty({ format: 'date-time' })
  settledAt: string;
}
