import { ApiProperty } from '@nestjs/swagger';
import { type CreateLotInput, MAX_PRICE_CENTS } from '@pregao/shared';
import { IsInt, IsISO8601, Matches, Max, Min } from 'class-validator';
import { EXTERNAL_ID_PATTERN } from '../../catalog/external-id.pipe.js';

const MIN_PRICE_CENTS = 100;

export class CreateLotDto implements CreateLotInput {
  @ApiProperty({ example: '16568', description: 'ID da obra no Art Institute of Chicago' })
  @Matches(EXTERNAL_ID_PATTERN, { message: 'externalId must be a numeric artwork id' })
  externalId: string;

  @ApiProperty({ example: 150000, description: 'Lance inicial em centavos (R$ 1.500,00)' })
  @IsInt()
  @Min(MIN_PRICE_CENTS)
  @Max(MAX_PRICE_CENTS)
  startingPriceCents: number;

  @ApiProperty({ example: 10000, description: 'Incremento mínimo em centavos (R$ 100,00)' })
  @IsInt()
  @Min(MIN_PRICE_CENTS)
  @Max(MAX_PRICE_CENTS)
  minIncrementCents: number;

  @ApiProperty({ example: '2026-11-01T20:00:00.000Z', description: 'Início (ISO 8601)' })
  @IsISO8601({ strict: true })
  startsAt: string;

  @ApiProperty({ example: '2026-11-03T20:00:00.000Z', description: 'Fim (ISO 8601)' })
  @IsISO8601({ strict: true })
  endsAt: string;
}
