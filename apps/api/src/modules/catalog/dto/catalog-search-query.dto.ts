import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CATALOG_QUERY_MAX_LENGTH } from '@pregao/shared';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsString, Length, Max, Min } from 'class-validator';
import { trim } from '../../../common/validation/transforms.js';

export class CatalogSearchQueryDto {
  @ApiProperty({ example: 'monet', minLength: 2, maxLength: CATALOG_QUERY_MAX_LENGTH })
  @Transform(trim)
  @IsString()
  @Length(2, CATALOG_QUERY_MAX_LENGTH)
  q: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  page: number = 1;
}
