# Casa de Leilões

Casa de leilões online com lances ao vivo, carteira simulada, comprovante de arremate
e histórico de lances à prova de adulteração. Teste técnico Elite Dev (Verzel).

> README em construção. A versão completa (deploy, decisões técnicas, auditoria e
> limitações) chega ao fim do projeto.

## Deploy

| | URL |
|---|---|
| Aplicação | https://pregao-m6sh.onrender.com |
| API | https://api.168.138.151.55.sslip.io |
| Documentação da API (Scalar) | https://api.168.138.151.55.sslip.io/docs |

Front como Static Site no Render; API e PostgreSQL numa VPS com Dokploy (imagem de `apps/api/Dockerfile`).

## Stack

- **API:** Node 22, NestJS, Prisma 7, PostgreSQL. Documentação OpenAPI interativa com Scalar em `/docs`.
- **Web:** React 19, Vite, TanStack Query, React Router, Tailwind 4, componentes shadcn/Radix reestilizados.
- **Monorepo:** pnpm (`apps/api`, `apps/web`, `packages/shared`).

## Como rodar localmente

Pré-requisitos: Node 22 (`.nvmrc`), pnpm (via `corepack enable`) e Docker.

```bash
pnpm install
docker compose up -d postgres          # Postgres em localhost:5440 (cria também o banco de testes)

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

pnpm --filter @pregao/api db:deploy    # aplica as migrations
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

## Imagem Docker da API

`apps/api/Dockerfile` usa a raiz do repositório como contexto. Ao iniciar, o container
aplica as migrations (`prisma migrate deploy`) e sobe a API na porta `PORT` (padrão 3000).

```bash
docker build -f apps/api/Dockerfile -t pregao-api .
docker run -p 3000:3000 --env-file apps/api/.env pregao-api
```

## Variáveis de ambiente

Veja `apps/api/.env.example` e `apps/web/.env.example`.
