import { ApiProperty } from '@nestjs/swagger';
import type { CatalogItem, CatalogSearchResult } from '@pregao/shared';

export class CatalogItemDto implements CatalogItem {
  @ApiProperty({ example: '16568', description: 'ID da obra no Art Institute of Chicago' })
  externalId: string;

  @ApiProperty({ example: 'Water Lilies' })
  title: string;

  @ApiProperty({ type: String, nullable: true, example: 'Claude Monet' })
  artist: string | null;

  @ApiProperty({ type: String, nullable: true, example: '1906' })
  dateDisplay: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'Oil on canvas' })
  medium: string | null;

  @ApiProperty({ type: String, nullable: true })
  dimensions: string | null;

  @ApiProperty({ type: String, nullable: true, example: 'France' })
  placeOfOrigin: string | null;

  @ApiProperty({ example: 'https://www.artic.edu/artworks/16568' })
  sourceUrl: string;

  @ApiProperty({ description: 'Imagem IIIF (1686px) no museu' })
  imageUrl: string;

  @ApiProperty({ description: 'Miniatura IIIF (400px) no museu' })
  thumbnailUrl: string;

  @ApiProperty({ type: Number, nullable: true, description: 'Largura original, para a proporção' })
  imageWidth: number | null;

  @ApiProperty({ type: Number, nullable: true })
  imageHeight: number | null;

  @ApiProperty({ type: String, nullable: true })
  altText: string | null;
}

export class CatalogSearchResultDto implements CatalogSearchResult {
  @ApiProperty({ type: [CatalogItemDto] })
  items: CatalogItemDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 50 })
  totalPages: number;
}
