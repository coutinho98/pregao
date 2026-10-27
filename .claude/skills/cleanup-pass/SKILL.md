---
name: cleanup-pass
description: A "segunda passada" de organização e limpeza. Use ao fim de cada fase do projeto, antes de cada commit grande, ou quando o usuário pedir revisão, refatoração, limpeza ou /cleanup-pass.
---

# Segunda passada de organização

O feedback anterior da Verzel resumiu o problema: o código funcionava, mas faltou
uma segunda passada de organização e limpeza. Esta skill é essa passada.
Não adiciona funcionalidade. Só organiza.

## Processo

1. Listar os arquivos alterados desde o último commit (`git diff --name-only`)
   ou, se pedido, o projeto inteiro.
2. Rodar o checklist abaixo e produzir um relatório curto: arquivo, problema, correção.
3. Mostrar o relatório ao usuário antes de mudar algo grande (mover arquivos,
   criar repository novo). Correções pequenas podem ser feitas direto.
4. Aplicar as correções em commits pequenos (`refactor: ...`).
5. Rodar `pnpm lint`, `pnpm typecheck` e `pnpm test`. Nada pode quebrar.

## Checklist

### Back-end (ver skill nest-backend-structure)
- [ ] `main.ts` só faz bootstrap. Sem seed, jobs ou comentários de hospedagem.
- [ ] `prisma.` só aparece em repositories.
- [ ] Services sem funções auxiliares que não usam `this`.
- [ ] Nenhum service acima de ~200 linhas.
- [ ] Erros lançados como `DomainError` com código de `packages/shared`.
- [ ] Todo endpoint com documentação OpenAPI completa (aparece no Scalar).

### Front-end (ver skill react-frontend-structure)
- [ ] Páginas finas. Mutation/invalidação/toast em hooks próprios.
- [ ] Formulários com React Hook Form + zod.
- [ ] Zero ternário aninhado.
- [ ] Datas e dinheiro só via `utils/`.
- [ ] Blocos com nome de domínio viraram componentes.
- [ ] Estados de carregando, vazio e erro presentes.

### Geral
- [ ] Sem `console.log`, código comentado, TODO esquecido, import não usado.
- [ ] Sem comentários que repetem o código. Comentário só explica o porquê.
- [ ] Sem comentários sobre limitações de ambiente (vão para o README).
- [ ] Nomes dizem o que a coisa é no domínio (`committedCents`, não `val2`).
- [ ] Nenhuma lógica duplicada entre arquivos.
- [ ] Nenhum arquivo, dependência ou abstração criada sem uso.
- [ ] `.env.example` e README batem com o código.
