import { ApiProperty } from '@nestjs/swagger';
import { type DepositInput, MAX_DEPOSIT_CENTS, MIN_DEPOSIT_CENTS } from '@pregao/shared';
import { IsInt, Max, Min } from 'class-validator';

export class DepositDto implements DepositInput {
  @ApiProperty({
    example: 500000,
    minimum: MIN_DEPOSIT_CENTS,
    maximum: MAX_DEPOSIT_CENTS,
    description: 'Valor do depósito simulado em centavos (R$ 5.000,00)',
  })
  @IsInt()
  @Min(MIN_DEPOSIT_CENTS)
  @Max(MAX_DEPOSIT_CENTS)
  amountCents: number;
}
