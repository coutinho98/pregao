import { ApiProperty } from '@nestjs/swagger';
import { type AuditBid, type AuditTrail, LotPhase } from '@pregao/shared';

class AuditGenesisDto {
  @ApiProperty({ example: '16568', description: 'ID da obra no museu' })
  itemId: string;

  @ApiProperty({ example: 100000 })
  startingPriceCents: number;

  @ApiProperty({ example: 5000 })
  minIncrementCents: number;

  @ApiProperty({ format: 'date-time' })
  startsAt: string;

  @ApiProperty({
    description: 'sha256("GENESIS|lotId|itemId|startingPrice|minIncrement|startsAt")',
  })
  hash: string;
}

class AuditBidDto implements AuditBid {
  @ApiProperty({ example: 1 })
  seq: number;

  @ApiProperty({ example: 'Licitante #A3F9C2' })
  bidderPseudonym: string;

  @ApiProperty({ example: 100000 })
  amountCents: number;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ description: 'Hash do lance anterior (ou da gênese)' })
  prevHash: string;

  @ApiProperty({ description: 'sha256(prevHash|lotId|seq|pseudônimo|valor|createdAt)' })
  hash: string;

  @ApiProperty({ description: 'Ed25519 sobre o hash, em hex' })
  signature: string;
}

class AuditHeadDto {
  @ApiProperty({ example: 3 })
  bidCount: number;

  @ApiProperty()
  lastHash: string;

  @ApiProperty({ description: 'Ed25519 sobre "HEAD|lotId|bidCount|lastHash"' })
  signature: string;
}

class AuditReceiptDto {
  @ApiProperty()
  finalHash: string;

  @ApiProperty({ example: 110000 })
  amountCents: number;
}

export class AuditTrailDto implements AuditTrail {
  @ApiProperty({ format: 'uuid' })
  lotId: string;

  @ApiProperty({ example: 7 })
  lotNumber: number;

  @ApiProperty({ example: 'Water Lilies' })
  title: string;

  @ApiProperty({ enum: Object.values(LotPhase) })
  phase: LotPhase;

  @ApiProperty({ type: AuditGenesisDto })
  genesis: AuditGenesisDto;

  @ApiProperty({ type: [AuditBidDto] })
  bids: AuditBidDto[];

  @ApiProperty({ type: AuditHeadDto })
  head: AuditHeadDto;

  @ApiProperty({ type: AuditReceiptDto, nullable: true })
  receipt: AuditReceiptDto | null;

  @ApiProperty({ description: 'Chave pública Ed25519 da casa, em hex' })
  publicKey: string;
}
