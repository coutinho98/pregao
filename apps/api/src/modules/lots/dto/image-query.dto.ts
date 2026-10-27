import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { ImageSize } from '../lots.repository.js';

const IMAGE_SIZES: ImageSize[] = ['full', 'thumb'];

export class ImageQueryDto {
  @ApiPropertyOptional({
    enum: IMAGE_SIZES,
    default: 'full',
    description: 'full = 843px, thumb = 400px',
  })
  @IsIn(IMAGE_SIZES)
  size: ImageSize = 'full';
}
