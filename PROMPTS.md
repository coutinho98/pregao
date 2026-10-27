# Roteiro de prompts para o Claude Code

Como usar:
- Coloque o `CLAUDE.md` na raiz da pasta vazia do projeto e rode `claude`.
- Uma fase por vez. Ao fim de cada fase: rode o app, teste na mão, faça commit.
- Use o plan mode (Shift+Tab) no início de cada fase: peça o plano, revise, só
  então aprove a implementação.
- Se a conversa ficar longa, use `/clear` entre fases. O CLAUDE.md segura o contexto.
- Leia o código gerado. Você vai precisar explicá-lo numa entrevista.
- Ao fim de TODA fase, antes do commit, rode: `/cleanup-pass`
  (é a "segunda passada" que faltou no teste anterior).
- Para o visual, instale também o Impeccable (citado no feedback da Verzel):
  `npx -y skills add pbakaus/impeccable --skill impeccable --agent claude-code`
  e use os comandos de crítica/polimento dele nas telas prontas, sempre respeitando
  o DESIGN.md.

---

## Fase 0 — Planejamento (plan mode)
```
Leia o CLAUDE.md. Antes de escrever código, proponha:
1) estrutura de pastas do monorepo;
2) schema Prisma completo (User, Wallet, WalletLedger, ItemSnapshot, Lot, Bid, Receipt)
   com índices e constraints (ex.: unique(lotId, seq));
3) lista de endpoints REST e eventos Socket.IO;
4) riscos e ambiguidades que você enxerga no requisito.
Não implemente nada ainda.
```

## Fase 1 — Fundação + deploy cedo
```
Implemente a fundação: monorepo pnpm, apps/api (NestJS), apps/web (Vite+React+Tailwind+shadcn),
packages/shared, docker-compose com Postgres, Prisma com o schema aprovado, migrations,
auth com JWT (register/login/me) e papéis AUCTIONEER/BIDDER, guards por papel,
.env.example, scripts lint/typecheck/test na raiz.
Documentação da API com Scalar em /docs (spec gerado pelo @nestjs/swagger, sem Swagger UI),
já documentando os endpoints de auth com DTOs e esquema Bearer.
No front: login, cadastro, layout com navegação por papel e toggle de dark mode,
seguindo os tokens de cor e tipografia do DESIGN.md.
Ao final, me diga exatamente como fazer deploy da API no Render (ou Railway), do banco
no Neon e do front na Vercel, incluindo variáveis de ambiente e CORS.
```
→ Faça o deploy AGORA, mesmo vazio.

## Fase 2 — Catálogo externo + lotes + vitrine
```
Implemente o módulo catalog para a Art Institute of Chicago API (seguindo a seção
"Detalhes da API do Art Institute of Chicago" do CLAUDE.md) com timeout, retry com
backoff, cache com TTL e circuit breaker, e o erro EXTERNAL_API_UNAVAILABLE.
Implemente criação de lote com snapshot do item (incluindo cópia da imagem), validações
(fim > início, valores > 0), listagem pública com status derivado do tempo
(live/scheduled/ended, cancelados fora) e busca/filtro.
Front: painel do leiloeiro (buscar item, prévia, formulário) e vitrine com abas.
Escreva um teste provando que a vitrine funciona com a API externa fora do ar.
```

## Fase 3 — Carteira + motor de lances (a parte mais crítica)
```
Implemente wallet (depósito simulado, saldo total/comprometido/disponível, ledger) e o
motor de lances exatamente como no CLAUDE.md: transação única, FOR UPDATE no lote,
lock das carteiras em ordem de id, todas as validações com os códigos de erro,
liberação do committed do líder anterior, anti-sniping.
Testes obrigatórios:
- cada código de erro;
- anti-sniping estende corretamente;
- concorrência: 20 lances simultâneos de usuários diferentes → um líder só, nenhum
  saldo negativo, committed consistente com os lances líderes;
- licitante liderando vários lotes ao mesmo tempo.
Rode os testes contra Postgres real (docker), não mock.
```

## Fase 4 — Tempo real + sala ao vivo
```
Implemente o gateway Socket.IO conforme o CLAUDE.md (rooms, eventos, you:outbid,
serverNow, auth opcional). Front: sala do lote com lance atual, countdown corrigido pelo
relógio do servidor, histórico atualizado ao vivo, posição do usuário, indicador
"Você está ganhando" / "Você foi superado", campo pré-preenchido com o mínimo e mensagens
claras para cada código de erro. Refetch completo ao reconectar.
```
→ Teste com dois navegadores lado a lado.

## Fase 5 — Liquidação + comprovante
```
Implemente o worker de liquidação (intervalo ~5s, FOR UPDATE SKIP LOCKED, relendo endsAt,
idempotente) e a liquidação sob demanda. Gere Receipt com publicToken aleatório.
Página pública /r/:token sem login. Painel do leiloeiro mostra resultado de cada lote
encerrado e total recebido. Tela "Meus arremates" (lotes com lance + vencidos com link).
Testes: liquidação idempotente, lote sem lance fecha sem vencedor, saldos finais corretos.
```

## Fase 6 — Prova de adulteração + privacidade
```
Implemente a cadeia de hashes com assinatura Ed25519 e headSignature conforme o CLAUDE.md,
gerada dentro da transação do lance. Pseudônimos por lote via HMAC.
Endpoint público /audit/:lotId e página de auditoria que verifica tudo no navegador com
@noble/ed25519 e mostra exatamente onde e por que quebrou.
Testes que alteram o banco diretamente (UPDATE valor, DELETE do meio, DELETE do último,
INSERT no meio, recálculo da cadeia sem chave, alteração do lote) e esperam detecção.
Crie também um script `pnpm tamper:demo` que adultera um lote de exemplo para demonstrar.
```

## Fase 7 — Opcionais + seed
```
Implemente: cancelamento com estorno automático, refinar busca/filtro, revisar dark mode.
Seed: 1 leiloeiro, 2 licitantes com saldo, 1 lote ao vivo com lances terminando daqui a
30 dias, 1 agendado, 1 encerrado com comprovante. Crie `pnpm seed:reset` para recriar a demo.
Garanta que `docker compose up` sobe tudo do zero com o seed.
```

## Fase 8 — README
```
Escreva o README.md completo: links de deploy e contas de teste; stack e diagrama de
arquitetura (mermaid); como rodar com e sem Docker; variáveis de ambiente; seed/reset;
decisões técnicas (centavos, locks, status derivado, resiliência da API); seção dedicada
à prova de adulteração com tabela de ataques detectados e limitações; interpretações de
ambiguidades; comportamentos inesperados e limitações conhecidas (ex.: cold start);
como rodar testes; seção "Uso de IA" com um rascunho que EU vou revisar e completar.
```

## Fase 9 — Revisão como avaliador
```
Aja como avaliador sênior deste teste técnico. Leia o PDF do desafio (requisitos no
CLAUDE.md) e o código inteiro. Liste, por gravidade: requisitos não atendidos, bugs de
concorrência ou de dinheiro, problemas de segurança (autorização, IDOR, vazamento de
dados pessoais, segredos), inconsistências entre README e código. Não corrija ainda.
```
Depois peça para corrigir item por item.

## Fase 10 — Entrega
```
Use a skill delivery-checklist. Rode a cleanup-pass no projeto inteiro, confira cada
item do checklist final e me entregue o roteiro do vídeo adaptado ao que foi construído,
com as URLs reais do deploy e as contas do seed.
```
→ Grave o vídeo. Ele foi o maior elogio da última vez.
