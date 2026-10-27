import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type LotListQuery, PUBLIC_LOT_PHASES, type PublicLotPhase } from '@pregao/shared';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { trim } from '../../../common/validation/transforms.js';

export class LotListQueryDto implements LotListQuery {
  @ApiProperty({ enum: PUBLIC_LOT_PHASES, description: 'Fase derivada do horário atual' })
  @IsIn(PUBLIC_LOT_PHASES)
  phase: PublicLotPhase;

  @ApiPropertyOptional({ description: 'Busca por título ou artista', maxLength: 100 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;
}
