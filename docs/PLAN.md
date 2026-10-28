# Plano aprovado (Fase 0)

Referência para as fases seguintes. Em caso de conflito, o `CLAUDE.md` prevalece.

## Estrutura

```
apps/api/      NestJS: prisma/, scripts/, src/{main.ts, common/, modules/}, test/
apps/web/      React: src/{app, features, components/ui, lib, utils}
packages/shared/  error-codes, lot-status, bid-rules, audit-chain, socket-events, roles
```

`packages/shared/audit-chain.ts` contém a serialização canônica e a verificação da
cadeia, usadas pela API (geração) e pelo navegador (verificação). Uma implementação só.

## Schema (resumo)

- `User` (role AUCTIONEER | BIDDER) 1:1 `Wallet` (totalCents, committedCents).
- `WalletLedger`: type, amountCents (> 0), totalAfterCents, committedAfterCents, lotId?, bidId?.
- `ItemSnapshot` 1:1 `ItemImage` (imageMime, imageBytes, thumbBytes). Consultas do
  snapshot nunca carregam bytes. `GET /images/:id` responde com
  `Cache-Control: public, max-age=31536000, immutable`.
- `Lot`: preços, startsAt, endsAt, originalEndsAt, status, currentBidCents, leaderId,
  bidCount, genesisHash, lastHash, headSignature.
- `Bid`: unique(lotId, seq), hash unique, prevHash, signature, bidderPseudonym,
  createdAt definido pela app (entra no hash).
- `Receipt`: lotId unique (idempotência), publicToken unique, finalHash.
- CHECKs via SQL: carteira `total >= committed >= 0`; lote `endsAt > startsAt`, preços > 0;
  lance `amount > 0`, `seq >= 1`; ledger `amount > 0`.

## Riscos tratados

1. Lance x liquidação: ambos travam o lote; lance revalida `now < endsAt` sob lock;
   worker usa `SKIP LOCKED` e relê `endsAt`.
2. Troca de `bidderId` no banco: liquidação recalcula o pseudônimo e recusa se divergir.
3. `createdAt` do lance definido pela app em ms; coluna `timestamptz(3)`.
4. **Pendência para o README (limitações):** a cadeia de hashes não cobre prorrogação
   de `endsAt`, `status` nem cancelamento. A auditoria confere o comprovante contra o
   último lance, mas mudanças nesses campos não são detectadas pela cadeia.
5. Teste de concorrência verifica invariantes, não "N lances aceitos".
6. Imagens em `bytea`, para não depender do disco do servidor (planejado para o Render, cujo disco é efêmero).
7. ~~Neon com `pgbouncer=true`~~ — superado: a API e o Postgres foram para uma VPS com Dokploy. `DIRECT_URL` segue existindo para migrations caso se use um pooler.
8. Cold start: planejado para a API no Render; com a API na VPS, a liquidação sob demanda cobre só o caso de a API ficar fora do ar no encerramento.
9. Rate limit da AIC é por IP do servidor: cache desde o início.
10. JWT via Bearer (domínios diferentes); trade-off documentado.

## Decisões de ambiguidade (aprovadas)

| # | Decisão |
|---|---|
| A | Anti-sniping: `endsAt = now + 2min` |
| B | Lance em `now >= endsAt` é rejeitado |
| C | Lote não é editável; só criar e cancelar |
| D | Mesma obra não pode ter dois lotes ativos não encerrados |
| E | Papel escolhido no cadastro |
| F | Posição = ranking pelo maior lance de cada licitante |
| G | Início >= agora - 1min; duração entre 5 min e 60 dias |
| H | Leiloeiro tem carteira, só recebe CREDIT |
| I | Saque fora de escopo |
| J | Servidor em UTC; UI em `America/Sao_Paulo` |
| — | Runtime: Node 22 LTS (Node 20 em EOL) |
