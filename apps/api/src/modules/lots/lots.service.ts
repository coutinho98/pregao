import { Injectable } from '@nestjs/common';
import {
  ErrorCode,
  LOT_PAGE_SIZE,
  type LotDetail,
  type LotPage,
  type LotSummary,
} from '@pregao/shared';
import { randomUUID } from 'node:crypto';
import { DomainError } from '../../common/errors/domain-error.js';
import { TransactionRunner, type Tx } from '../../common/prisma/transaction-runner.js';
import { Clock } from '../../common/time/clock.js';
import { AuditChainService } from '../audit/audit-chain.service.js';
import { CATALOG_SOURCE } from '../catalog/catalog-provider.js';
import { CatalogService } from '../catalog/catalog.service.js';
import type { CreateLotDto } from './dto/create-lot.dto.js';
import type { LotListQueryDto } from './dto/lot-list-query.dto.js';
import { lotScheduleProblem } from './lot-rules.js';
import { toLotDetail, toLotSummary } from './lots.mapper.js';
import { type ImageSize, LotsRepository } from './lots.repository.js';

const ALREADY_LISTED_MESSAGE = 'Esta obra já está em um lote aberto. Escolha outra obra do acervo.';

@Injectable()
export class LotsService {
  constructor(
    private readonly lots: LotsRepository,
    private readonly catalog: CatalogService,
    private readonly auditChain: AuditChainService,
    private readonly transactions: TransactionRunner,
    private readonly clock: Clock,
  ) {}

  async create(auctioneerId: string, input: CreateLotDto): Promise<LotDetail> {
    const now = this.clock.now();
    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);
    const scheduleProblem = lotScheduleProblem(startsAt, endsAt, now);
    if (scheduleProblem) throw new DomainError(ErrorCode.INVALID_LOT_SCHEDULE, scheduleProblem);

    // Cheap early check so we don't download images for an artwork that is already listed.
    await this.ensureArtworkIsFree(input.externalId, now);
    const item = await this.catalog.getItem(input.externalId);
    const image = await this.catalog.downloadImage(item);

    const lotId = randomUUID();
    const seal = await this.auditChain.sealGenesis({
      lotId,
      itemId: item.externalId,
      startingPriceCents: input.startingPriceCents,
      minIncrementCents: input.minIncrementCents,
      startsAt,
    });

    const lot = await this.transactions.run(async (tx) => {
      await this.lots.lockArtwork(tx, CATALOG_SOURCE, item.externalId);
      await this.ensureArtworkIsFree(item.externalId, now, tx);
      return this.lots.createWithSnapshot(tx, {
        lot: {
          id: lotId,
          auctioneerId,
          startingPriceCents: BigInt(input.startingPriceCents),
          minIncrementCents: BigInt(input.minIncrementCents),
          startsAt,
          endsAt,
          originalEndsAt: endsAt,
          genesisHash: seal.genesisHash,
          lastHash: seal.genesisHash,
          headSignature: seal.headSignature,
        },
        snapshot: {
          source: CATALOG_SOURCE,
          externalId: item.externalId,
          title: item.title,
          artist: item.artist,
          dateDisplay: item.dateDisplay,
          medium: item.medium,
          dimensions: item.dimensions,
          placeOfOrigin: item.placeOfOrigin,
          sourceUrl: item.sourceUrl,
          imageWidth: item.imageWidth,
          imageHeight: item.imageHeight,
          altText: item.altText,
        },
        image: {
          imageMime: image.mime,
          imageBytes: new Uint8Array(image.full),
          thumbBytes: new Uint8Array(image.thumbnail),
        },
      });
    });
    return toLotDetail(lot, now);
  }

  async list({ phase, q, page }: LotListQueryDto): Promise<LotPage> {
    const now = this.clock.now();
    const { lots, total } = await this.lots.findPage({
      phase,
      q,
      page,
      pageSize: LOT_PAGE_SIZE,
      now,
    });
    return {
      items: lots.map((lot) => toLotSummary(lot, now)),
      page,
      pageSize: LOT_PAGE_SIZE,
      total,
    };
  }

  async listByAuctioneer(auctioneerId: string): Promise<LotSummary[]> {
    const now = this.clock.now();
    const lots = await this.lots.findByAuctioneer(auctioneerId);
    return lots.map((lot) => toLotSummary(lot, now));
  }

  async getDetail(id: string): Promise<LotDetail> {
    const lot = await this.lots.findById(id);
    if (!lot) throw new DomainError(ErrorCode.NOT_FOUND, 'Lote não encontrado.');
    return toLotDetail(lot, this.clock.now());
  }

  async getImage(
    snapshotId: string,
    size: ImageSize,
  ): Promise<{ mime: string; bytes: Uint8Array }> {
    const image = await this.lots.findImage(snapshotId, size);
    if (!image) throw new DomainError(ErrorCode.NOT_FOUND, 'Imagem não encontrada.');
    return image;
  }

  private async ensureArtworkIsFree(externalId: string, now: Date, tx?: Tx): Promise<void> {
    const openLots = await this.lots.countOpenLotsForArtwork(CATALOG_SOURCE, externalId, now, tx);
    if (openLots > 0)
      throw new DomainError(ErrorCode.ARTWORK_ALREADY_LISTED, ALREADY_LISTED_MESSAGE);
  }
}
