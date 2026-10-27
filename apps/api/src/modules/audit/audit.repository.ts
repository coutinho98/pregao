import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';

export type LotForAudit = Prisma.LotGetPayload<{
  include: {
    itemSnapshot: { select: { externalId: true; title: true } };
    bids: true;
    receipt: { select: { finalHash: true; amountCents: true } };
  };
}>;

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** The stored rows, untouched: the audit must see exactly what is in the database. */
  findLotForAudit(lotId: string): Promise<LotForAudit | null> {
    return this.prisma.lot.findUnique({
      where: { id: lotId },
      include: {
        itemSnapshot: { select: { externalId: true, title: true } },
        bids: { orderBy: { seq: 'asc' } },
        receipt: { select: { finalHash: true, amountCents: true } },
      },
    });
  }
}
