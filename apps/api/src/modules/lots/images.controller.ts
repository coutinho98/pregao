import { Controller, Get, Param, ParseUUIDPipe, Query, Res, StreamableFile } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { ErrorCode } from '@pregao/shared';
import type { Response } from 'express';
import { ApiDomainErrors } from '../../common/openapi/api-domain-errors.decorator.js';
import { ImageQueryDto } from './dto/image-query.dto.js';
import { LotsService } from './lots.service.js';

@ApiTags('Lotes')
@Controller('images')
export class ImagesController {
  constructor(private readonly lots: LotsService) {}

  @Get(':snapshotId')
  @ApiOperation({ summary: 'Imagem da obra copiada do museu na criação do lote' })
  @ApiProduces('image/jpeg')
  @ApiOkResponse({ description: 'Bytes da imagem, com cache imutável de 1 ano' })
  @ApiDomainErrors(ErrorCode.VALIDATION_FAILED, ErrorCode.NOT_FOUND)
  async get(
    @Param('snapshotId', ParseUUIDPipe) snapshotId: string,
    @Query() { size }: ImageQueryDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const image = await this.lots.getImage(snapshotId, size);
    // A snapshot's image never changes, so browsers and CDNs may keep it forever.
    response.set({
      'Content-Type': image.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    return new StreamableFile(image.bytes);
  }
}
