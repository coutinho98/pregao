---
name: nest-backend-structure
description: Use ao criar ou alterar qualquer código em apps/api (NestJS) — controllers, services, acesso ao banco, helpers, main.ts, seed. Define onde cada responsabilidade mora.
---

# Estrutura do back-end (NestJS)

Origem: feedback real da Verzel num teste anterior. Os pontos criticados foram
service gigante com funções auxiliares misturadas, acesso ao banco sem separação,
seed dentro do `main.ts` e comentários de hospedagem no código. Esta skill existe
para isso não se repetir.

A meta NÃO é arquitetura complexa. É deixar óbvio onde cada regra mora.

## Camadas de cada módulo

```
src/modules/bids/
  bids.module.ts
  bids.controller.ts        # HTTP: rota, DTO, guard, chama o service. Nada de regra.
  bids.service.ts           # Orquestra o caso de uso e a transação.
  bids.repository.ts        # Todo acesso Prisma/SQL do módulo.
  bid-rules.ts              # Funções PURAS de regra (validar lance, calcular mínimo).
  dto/place-bid.dto.ts
  dto/bid-response.dto.ts
  bids.service.spec.ts
  bid-rules.spec.ts
```

| Arquivo | Pode | Não pode |
|---|---|---|
| controller | validar entrada (DTO), pegar usuário, chamar 1 método do service, documentar OpenAPI | regra de negócio, Prisma, try/catch de domínio |
| service | orquestrar: abrir transação, chamar repository e regras, emitir eventos | SQL/Prisma direto, helpers de formatação, cálculo que caberia numa função pura |
| repository | queries Prisma e `$queryRaw` (incluindo `FOR UPDATE`), recebendo o `tx` quando houver transação | decidir regra de negócio |
| `*-rules.ts` / `*.utils.ts` | funções puras, sem Nest e sem banco, fáceis de testar | depender de injeção |

- Repository recebe o client da transação como parâmetro:
  `findLotForUpdate(tx: Prisma.TransactionClient, lotId: string)`.
- Interface para o repository só quando ajuda a testar ou delimitar
  (ex.: `CatalogProvider` para a API do museu, com implementação real e fake nos testes).
  Não criar interface para tudo.
- Utilitários compartilhados entre módulos: `src/common/` (money, time, crypto, errors).
- Erros de domínio: classe `DomainError(code, message, meta)` + um exception filter
  global que mapeia para HTTP. Services lançam `DomainError`, nunca `HttpException`.

## main.ts

Só faz: criar app, pipes/filters globais, CORS, Socket.IO adapter, Scalar em `/docs`,
`listen`. Idealmente menos de 40 linhas.

Não pode conter: seed, migrations, jobs, regra de negócio, comentários sobre
Render/Railway/cold start ou qualquer limitação de ambiente. Isso vai para o README
ou `docs/deploy.md`.

## Seed e tarefas operacionais

- Seed em `prisma/seed.ts`, executado por script (`pnpm db:seed`, `pnpm seed:reset`),
  nunca no boot da aplicação.
- No deploy, rodar migrations e seed como etapa de build/release do provedor.
- Worker de liquidação é um provider próprio (`settlement.worker.ts`), não um
  `setInterval` solto no `main.ts`.

## Sinais de alerta (refatorar antes de seguir)

- Service com mais de ~200 linhas ou com funções que não usam `this`.
  As funções sem `this` devem ir para `*-rules.ts`/`*.utils.ts`.
- `prisma.` aparecendo fora de um repository.
- Mesma formatação/cálculo duplicado em dois módulos. Mover para `src/common/`.
- Comentário explicando "por que no Render precisa disso". Mover para a documentação.
