# Casa de Leilões

Casa de leilões online com lances ao vivo, carteira simulada, comprovante de arremate
e histórico de lances à prova de adulteração. Teste técnico Elite Dev (Verzel).

> README em construção. A versão completa (decisões técnicas, auditoria e limitações)
> chega ao fim do projeto.

## Deploy

| | URL |
|---|---|
| Aplicação | https://pregao-m6sh.onrender.com |
| API | https://api.168.138.151.55.sslip.io |
| Documentação da API (Scalar) | https://api.168.138.151.55.sslip.io/docs |

Front como Static Site no Render; API e PostgreSQL numa VPS com Dokploy (imagem de `apps/api/Dockerfile`).

## Contas de demonstração

Criadas pelo seed. Senha de todas: `pregao123`.

| Papel | E-mail | |
|---|---|---|
| Leiloeiro | `leiloeiro@pregao.dev` | dono de todos os lotes da demo |
| Licitante | `ana@pregao.dev` | R$ 50.000 depositados |
| Licitante | `bruno@pregao.dev` | R$ 50.000 depositados |

Lotes da demo: um em pregão por 30 dias já com lances, um que encerra em poucas horas,
um agendado, um arrematado com comprovante e um arrematado **adulterado de propósito**
direto no banco (lance #2), para ver a auditoria apontar exatamente onde quebrou.

**Veja a auditoria funcionando no deploy** (pública, sem login; a verificação roda no seu navegador):

| Lote | Auditoria | Resultado esperado |
|---|---|---|
| 001 · Water Lilies (em pregão) | [abrir](https://pregao-m6sh.onrender.com/auditoria/ce88ba51-22cb-46a6-9f06-ed1a3953fb51) | Histórico íntegro |
| 004 · Paris Street (arrematado) | [abrir](https://pregao-m6sh.onrender.com/auditoria/7cd75e65-2532-4797-a439-ec4fa8f53d1c) | Íntegro, incluindo o comprovante |
| 005 · Sainte-Adresse (adulterado) | [abrir](https://pregao-m6sh.onrender.com/auditoria/9b4d1e5b-32d9-4103-834d-77dfb76dce6c) | Adulteração detectada no lance 2 |

## Stack

- **API:** Node 22, NestJS, Prisma 7, PostgreSQL, Socket.IO. Documentação OpenAPI interativa com Scalar em `/docs`.
- **Web:** React 19, Vite, TanStack Query, React Router, Tailwind 4, Radix, motion.
- **Monorepo:** pnpm (`apps/api`, `apps/web`, `packages/shared`).

## Como rodar com Docker (do zero, com a demo)

```bash
docker compose up --build
```

Sobe Postgres, API e web. Na primeira subida a API aplica as migrations e, com o banco
vazio, cria a demo (as obras do seed vêm de `apps/api/prisma/seed-assets`, sem depender do
museu). Depois:

- Aplicação: http://localhost:8080
- API e Scalar: http://localhost:3000/docs

Portas configuráveis com `WEB_PORT`, `API_PORT` e `POSTGRES_PORT`.

## Como rodar sem Docker (desenvolvimento)

Pré-requisitos: Node 22 (`.nvmrc`), pnpm (via `corepack enable`) e Docker só para o Postgres.

```bash
pnpm install
docker compose up -d postgres          # Postgres em localhost:5440 (cria também o banco de testes)

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

pnpm --filter @pregao/api db:deploy    # aplica as migrations
pnpm seed:reset                        # apaga tudo e cria a demo
pnpm dev                               # API em :3000, web em :5173
```

- Aplicação: http://localhost:5173
- Documentação da API (Scalar): http://localhost:3000/docs
- Spec OpenAPI: http://localhost:3000/docs/openapi.json

## Scripts

| Comando | O que faz |
|---|---|
| `pnpm dev` | API, web e `packages/shared` em modo watch |
| `pnpm lint` | ESLint no monorepo |
| `pnpm typecheck` | TypeScript em todos os pacotes |
| `pnpm test` | Testes unitários e de integração (a API usa o Postgres real em `TEST_DATABASE_URL`) |
| `pnpm build` | Build de produção |
| `pnpm seed:reset` | Apaga o banco e recria a demo |
| `pnpm tamper:demo` | Adultera um lance direto no banco e imprime o link da auditoria (`--restore` desfaz) |

## Imagem Docker da API

`apps/api/Dockerfile` usa a raiz do repositório como contexto. Ao iniciar, o container
aplica as migrations (`prisma migrate deploy`) e sobe a API na porta `PORT` (padrão 3000).
O `docker-compose.yml` usa `pnpm start:demo`, que também cria a demo num banco vazio.

## Variáveis de ambiente

Veja `apps/api/.env.example` e `apps/web/.env.example`.
