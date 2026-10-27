import { ApiProperty } from '@nestjs/swagger';
import {
  BidStanding,
  type MyLotStanding,
  type PlaceBidResult,
  type PublicBid,
} from '@pregao/shared';
import { LotDetailDto } from '../../lots/dto/lot-response.dto.js';

export class MyLotStandingDto implements MyLotStanding {
  @ApiProperty({ example: 'Licitante #A3F9C2', description: 'Sua raquete neste lote' })
  pseudonym: string;

  @ApiProperty({ enum: Object.values(BidStanding) })
  standing: BidStanding;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 2,
    description: 'Posição entre os licitantes',
  })
  position: number | null;

  @ApiProperty({ example: 4 })
  totalBidders: number;

  @ApiProperty({ type: Number, nullable: true, example: 150000 })
  myHighestBidCents: number | null;
}

export class PublicBidDto implements PublicBid {
  @ApiProperty({ example: 3, description: 'Posição do lance na cadeia do lote' })
  seq: number;

  @ApiProperty({ example: 'Licitante #A3F9C2', description: 'Pseudônimo do licitante neste lote' })
  bidderPseudonym: string;

  @ApiProperty({ example: 160000 })
  amountCents: number;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;
}

export class PlaceBidResultDto implements PlaceBidResult {
  @ApiProperty({ type: PublicBidDto })
  bid: PublicBidDto;

  @ApiProperty({ type: LotDetailDto, description: 'Lote já com o novo lance e o novo mínimo' })
  lot: LotDetailDto;

  @ApiProperty({ description: 'O lance acionou a prorrogação anti-sniping' })
  extended: boolean;
}
