import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class LedgerQueryDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'nextCursor da página anterior' })
  @IsOptional()
  @IsUUID()
  cursor?: string;
}
