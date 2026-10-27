import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';

export type ReceiptWithLot = Prisma.ReceiptGetPayload<{
  include: { lot: { include: { itemSnapshot: true } } };
}>;

@Injectable()
export class ReceiptsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByToken(publicToken: string): Promise<ReceiptWithLot | null> {
    return this.prisma.receipt.findUnique({
      where: { publicToken },
      include: { lot: { include: { itemSnapshot: true } } },
    });
  }
}
