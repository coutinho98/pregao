# CLAUDE.md — Casa de Leilões (Teste técnico Verzel)

Este arquivo é a fonte da verdade do projeto. Leia antes de qualquer tarefa.
Se algo aqui conflitar com um pedido, PERGUNTE antes de seguir.

## Contexto
Casa de Leilões online. Leiloeiro (AUCTIONEER) cria lotes a partir de itens de uma
API pública; licitantes (BIDDER) depositam saldo simulado, dão lances ao vivo e,
se vencerem, recebem comprovante compartilhável. Qualquer pessoa, sem login,
audita o histórico de lances e verifica que não foi adulterado.

Prioridade absoluta: CORREÇÃO das regras de negócio > tempo real > UI bonita.
Deploy público é obrigatório. README detalhado é obrigatório.

## Stack (não trocar sem perguntar)
- Monorepo pnpm: `apps/api`, `apps/web`, `packages/shared` (tipos e códigos de erro)
- API: Node 22 LTS + NestJS + TypeScript + Prisma + PostgreSQL + Socket.IO
- Web: React + Vite + TypeScript + TanStack Query + React Router + Tailwind + shadcn/ui
- Testes: Vitest (ou Jest no Nest) + Supertest
- Cripto: `node:crypto` (SHA-256) + `@noble/ed25519` (assinatura; também usado no browser)
- Docker Compose: postgres + api + web
- API externa de itens: Art Institute of Chicago (https://api.artic.edu/docs/), sem chave
  (decisão final; Rijksmuseum descartado: a busca nova devolve só IDs e exige N+1 chamadas)
- Documentação da API: Scalar (`@scalar/nestjs-api-reference`) em `/docs`, NÃO Swagger UI.
  O spec OpenAPI é gerado pelos decorators do `@nestjs/swagger` (só para o spec, sem
  `SwaggerModule.setup`). Também expor o JSON em `/docs/openapi.json`.
  Todo endpoint documentado: summary, DTOs de entrada/saída, códigos de erro, auth Bearer.

## Regras inegociáveis
1. Dinheiro SEMPRE em centavos inteiros (`BigInt`/`Int` no Prisma). Nunca float.
2. Toda operação que mexe em saldo ou lance roda em UMA transação com lock
   (`SELECT ... FOR UPDATE` via `$queryRaw` dentro de `$transaction`).
   Travar carteiras em ordem crescente de id (evita deadlock).
3. Status do lote: o banco persiste só `ACTIVE | CANCELLED | SETTLED`.
   "Agendado / ao vivo / encerrado" é DERIVADO de `now` vs `startsAt`/`endsAt`.
4. Erros de lance retornam código + mensagem + `minNextBidCents` quando aplicável:
   `NOT_STARTED`, `LOT_ENDED`, `ALREADY_WINNING`, `BELOW_MINIMUM`,
   `INSUFFICIENT_FUNDS`, `AUCTIONEER_CANNOT_BID`. Códigos ficam em `packages/shared`.
5. Nunca expor nome/e-mail de licitante em auditoria, comprovante ou eventos públicos.
6. Segredos só via env. Manter `.env.example` atualizado. Nunca commitar `.env`.

## Regras de negócio
- Lance só em lote ao vivo (startsAt <= now < endsAt e status ACTIVE).
- 1º lance >= startingPrice. Seguintes >= currentBid + minIncrement.
- Líder atual não pode cobrir o próprio lance.
- Saldo: disponível = total - committed. Ao liderar, valor vai p/ committed;
  ao ser superado, o committed do anterior é liberado NA MESMA transação.
  Lance só aceito se valor <= disponível.
- Anti-sniping: lance aceito com (endsAt - now) <= 2min → endsAt = now + 2min.
  (Interpretação documentada no README.)
- Liquidação (worker a cada ~5s com `FOR UPDATE SKIP LOCKED`, relendo endsAt na
  transação, IDEMPOTENTE): vencedor tem total e committed debitados; leiloeiro
  creditado; gera Receipt com `publicToken` aleatório (crypto.randomBytes).
  Sem lances → SETTLED sem vencedor. Também liquidar sob demanda ao ler lote vencido.
- Cancelamento: leiloeiro dono, lote sem lances (base). Opcional: com lances,
  liberando committed do líder (estorno) e registrando no ledger.
- Toda movimentação gera linha em `WalletLedger`
  (DEPOSIT, HOLD, RELEASE, DEBIT, CREDIT, REFUND).

## API externa (resiliência)
- Ao criar lote, fazer SNAPSHOT do item (título, atributos, imagem) no banco.
  Imagem é baixada e salva em storage próprio (ou servida pela própria API).
  Depois disso nada (vitrine, sala, auditoria, comprovante) depende da API.
- Busca: timeout 5s, retry com backoff (2x), cache com TTL, circuit breaker simples.
  Falha → erro amigável `EXTERNAL_API_UNAVAILABLE`, app continua funcionando.

### Detalhes da API do Art Institute of Chicago
- Base: `https://api.artic.edu/api/v1`. Busca: `POST /artworks/search` com uma query
  Elasticsearch que exige todas as palavras (o `q` simples só ordena e devolve o acervo
  inteiro; ver README), sempre com `fields` (ex.: `id,title,artist_title,date_display,medium_display,
  dimensions,place_of_origin,image_id,is_public_domain`) para respostas leves.
- Só obras em domínio público: `query[term][is_public_domain]=true`
  (licenciamento; citar no README). Descartar resultados com `image_id` nulo.
- Imagem (IIIF): `{config.iiif_url}/{image_id}/full/1686,/0/default.jpg`
  (o dobro do tamanho sugerido, para ficar nítida em tela retina; ~1 MB por obra).
  Ler `iiif_url` do campo `config` da resposta, não hardcodar. Miniatura: `400,`.
- Limite: 60 req/min por IP (anônimo). Cache + circuit breaker são obrigatórios.
- Enviar o header `AIC-User-Agent: casa-de-leiloes-verzel (<email do .env>)`.
- Detalhe de um item: `GET /artworks/{id}?fields=...` (usado no snapshot).

## Histórico à prova de adulteração
- Serialização canônica: string com campos em ordem fixa separados por `|`,
  timestamps em ISO UTC, valores em centavos.
- Gênese: `h0 = sha256("GENESIS|lotId|itemId|startingPrice|minIncrement|startsAt")`.
- Lance n: `hash = sha256(prevHash|lotId|seq|bidderPseudonym|amountCents|createdAt)`,
  `signature = ed25519.sign(hash, PRIVATE_KEY)`.
- Cabeça do lote: `headSignature = sign("HEAD|lotId|bidCount|lastHash")`
  (detecta remoção do último lance).
- Comprovante guarda o hash final.
- Endpoint público `/audit/:lotId` devolve dados canônicos + hashes + assinaturas
  + chave pública. A página de auditoria verifica NO NAVEGADOR e aponta o lance
  exato onde quebrou e o motivo.
- Limitação conhecida (documentar): quem tiver banco + chave privada forja.

## Privacidade
- Pseudônimo por lote: `"Licitante #" + HMAC_SHA256(PSEUDONYM_SECRET, userId|lotId)`
  em hex, 6 chars maiúsculos. O próprio usuário vê "Você".

## Tempo real (Socket.IO)
- Room `lot:{id}`. Eventos: `bid:new`, `lot:extended`, `lot:closed`.
- Evento privado ao usuário: `you:outbid`. Socket autenticado por JWT (opcional
  para espectadores).
- Payloads incluem `serverNow` para o front corrigir o countdown.
- Front refaz fetch completo ao reconectar.

## Design
Toda tela segue o `docs/DESIGN.md` (identidade "Salão de Pregão"). Leia antes de mexer no front.

## Lições do teste anterior na Verzel (feedback real)
Elogiado: UX real (toasts, feedback de ações, estados, menu mobile em sheet), vídeo
explicando a solução, bônus completos, uso de IA com direção. MANTER tudo isso.
Criticado: falta de organização (services gigantes, Prisma fora de repository, seed e
comentários de hospedagem no main.ts, páginas com mutation/toast/datas misturados,
useState em excesso, ternários aninhados), falta de Swagger, visual com cara de
"AI slop" (neobrutalismo igual ao dos outros). NÃO repetir.
Skills do projeto (em .claude/skills/):
- `nest-backend-structure`: obrigatória ao mexer em apps/api.
- `react-frontend-structure`: obrigatória ao mexer em apps/web.
- `cleanup-pass`: rodar ao fim de TODA fase, antes do commit.
- `delivery-checklist`: README, vídeo e revisão final.

## Convenções
- Código e nomes em inglês; textos da UI em português.
- Validação de entrada com class-validator (API) e zod (web).
- Um módulo Nest por domínio: auth, users, wallet, catalog (API externa), lots,
  bids, settlement, audit, receipts, realtime.
- Commits pequenos, mensagens em Conventional Commits.
- Não criar arquivos/abstrações desnecessárias. Não adicionar dependência sem motivo.

## Definition of Done de cada tarefa
1. `pnpm lint` e `pnpm typecheck` passam.
2. Testes da área tocada existem e passam (`pnpm test`).
3. `.env.example` e README atualizados se algo mudou.
4. Resumir ao final: o que foi feito, decisões tomadas, pendências.

## Fora de escopo
Nota fiscal, revenda entre usuários, app nativo, recuperação de senha.
