import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import type { Request, Response } from 'express';

export function setupApiDocs(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Casa de Leilões API')
    .setDescription(
      'API da Casa de Leilões. Valores monetários sempre em centavos inteiros. ' +
        'Erros seguem o formato { code, message, details?, minNextBidCents? }.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  const http = app.getHttpAdapter();
  http.get('/docs/openapi.json', (_req: Request, res: Response) => res.json(document));
  app.use('/docs', apiReference({ content: document }));
}
