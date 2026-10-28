import { ApiProperty } from '@nestjs/swagger';
import {
  type AuctioneerLot,
  type AuctioneerLots,
  type LotDetail,
  type LotImage,
  type LotPage,
  LotPhase,
  LotResult,
  type LotSummary,
} from '@pregao/shared';

export class LotImageDto implements LotImage {
  @ApiProperty({ example: '/images/9b1d…', description: 'Caminho na API (1686px)' })
  url: string;

  @ApiProperty({ example: '/images/9b1d…?size=thumb', description: 'Caminho na API (400px)' })
  thumbnailUrl: string;

  @ApiProperty({ type: Number, nullable: true })
  width: number | null;

  @ApiProperty({ type: Number, nullable: true })
  height: number | null;

  @ApiProperty({ type: String, nullable: true })
  altText: string | null;
}

export class LotSummaryDto implements LotSummary {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 14, description: 'Número do lote na casa' })
  number: number;

  @ApiProperty({ example: 'Water Lilies' })
  title: string;

  @ApiProperty({ type: String, nullable: true, example: 'Claude Monet' })
  artist: string | null;

  @ApiProperty({ type: String, nullable: true, example: '1906' })
  dateDisplay: string | null;

  @ApiProperty({ enum: Object.values(LotPhase), description: 'Derivada de status + horário' })
  phase: LotPhase;

  @ApiProperty({ format: 'date-time' })
  startsAt: string;

  @ApiProperty({ format: 'date-time', description: 'Pode ser estendido pelo anti-sniping' })
  endsAt: string;

  @ApiProperty({ example: 150000 })
  startingPriceCents: number;

  @ApiProperty({ type: Number, nullable: true, example: null })
  currentBidCents: number | null;

  @ApiProperty({ example: 0 })
  bidCount: number;

  @ApiProperty({ type: LotImageDto })
  image: LotImageDto;

  @ApiProperty({ type: String, nullable: true, example: 'Oil on canvas' })
  medium: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'French, 1840–1926',
    description: 'Nacionalidade e vida do artista, como o museu escreve (em inglês)',
  })
  artistBio: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'Impressionism' })
  style: string | null;

  @ApiProperty({ type: String, nullable: true })
  dimensions: string | null;

  @ApiProperty({ type: String, nullable: true })
  placeOfOrigin: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Trecho sobre a obra, do catálogo do museu (em inglês)',
  })
  story: string | null;
}

export class LotDetailDto extends LotSummaryDto implements LotDetail {
  @ApiProperty({ description: 'Página da obra no museu' })
  sourceUrl: string;

  @ApiProperty({ example: 10000 })
  minIncrementCents: number;

  @ApiProperty({ example: 150000, description: 'Menor lance aceito agora' })
  minNextBidCents: number;

  @ApiProperty({
    format: 'date-time',
    description: 'Relógio do servidor, para corrigir o countdown',
  })
  serverNow: string;
}

export class LotPageDto implements LotPage {
  @ApiProperty({ type: [LotSummaryDto] })
  items: LotSummaryDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 24 })
  pageSize: number;

  @ApiProperty({ example: 3 })
  total: number;
}

export class AuctioneerLotDto extends LotSummaryDto implements AuctioneerLot {
  @ApiProperty({
    enum: Object.values(LotResult),
    nullable: true,
    description: 'SOLD ou UNSOLD depois da liquidação; null antes',
  })
  result: LotResult | null;
}

export class AuctioneerLotsDto implements AuctioneerLots {
  @ApiProperty({ type: [AuctioneerLotDto] })
  lots: AuctioneerLotDto[];

  @ApiProperty({ example: 430000, description: 'Soma dos arremates creditados na carteira' })
  totalReceivedCents: number;
}
