import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from './prisma.service.js';

export type Tx = Prisma.TransactionClient;

/** Under a burst of bids, transactions queue on the same lot row lock; give them room. */
const TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 15_000 };

/** Lets services own a transaction boundary without touching Prisma directly. */
@Injectable()
export class TransactionRunner {
  constructor(private readonly prisma: PrismaService) {}

  run<T>(work: (tx: Tx) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(work, TRANSACTION_OPTIONS);
  }
}
