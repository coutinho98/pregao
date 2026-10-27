import { ApiProperty } from '@nestjs/swagger';
import {
  type LedgerEntry,
  LedgerEntryType,
  type LedgerPage,
  type WalletSummary,
} from '@pregao/shared';

export class WalletSummaryDto implements WalletSummary {
  @ApiProperty({ example: 500000, description: 'Saldo total, em centavos' })
  totalCents: number;

  @ApiProperty({ example: 150000, description: 'Comprometido nos lotes que você lidera' })
  committedCents: number;

  @ApiProperty({ example: 350000, description: 'Total menos comprometido' })
  availableCents: number;
}

export class LedgerEntryDto implements LedgerEntry {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: Object.values(LedgerEntryType) })
  type: LedgerEntryType;

  @ApiProperty({ example: 150000 })
  amountCents: number;

  @ApiProperty({ example: 500000 })
  totalAfterCents: number;

  @ApiProperty({ example: 150000 })
  committedAfterCents: number;

  @ApiProperty({ type: String, nullable: true, format: 'uuid' })
  lotId: string | null;

  @ApiProperty({ type: Number, nullable: true, example: 14 })
  lotNumber: number | null;

  @ApiProperty({ type: String, nullable: true, example: 'Water Lilies' })
  lotTitle: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;
}

export class LedgerPageDto implements LedgerPage {
  @ApiProperty({ type: [LedgerEntryDto] })
  entries: LedgerEntryDto[];

  @ApiProperty({ type: String, nullable: true, format: 'uuid' })
  nextCursor: string | null;
}
