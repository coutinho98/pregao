import { ApiProperty } from '@nestjs/swagger';
import { MAX_PRICE_CENTS, type PlaceBidInput } from '@pregao/shared';
import { IsInt, Max, Min } from 'class-validator';

export class PlaceBidDto implements PlaceBidInput {
  @ApiProperty({ example: 160000, description: 'Valor do lance em centavos (R$ 1.600,00)' })
  @IsInt()
  @Min(1)
  @Max(MAX_PRICE_CENTS)
  amountCents: number;
}
