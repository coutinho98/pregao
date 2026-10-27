---
name: react-frontend-structure
description: Use ao criar ou alterar qualquer código em apps/web (React) — páginas, componentes, hooks, formulários, chamadas à API, formatação de datas/dinheiro e lógica condicional de UI.
---

# Estrutura do front-end (React)

Origem: feedback real da Verzel num teste anterior. Criticaram página com
responsabilidades demais (mutation, invalidação, erro e toast tudo dentro dela),
funções de data soltas na página, pouca componentização, `useState` demais em
formulário e ternários aninhados. Elogiaram toasts, feedback de ações, estados da
aplicação e o menu mobile em sheet. Manter os elogios, corrigir as críticas.

## Organização por feature

```
src/
  app/                 # router, providers (QueryClient, tema, socket), layout
  features/
    lots/
      api.ts           # funções fetch tipadas (sem React)
      hooks/
        use-lot.ts             # useQuery
        use-cancel-lot.ts      # useMutation + invalidação + toast + mensagem de erro
      components/
        lot-plaque.tsx
        bid-panel.tsx
      pages/
        live-lot-page.tsx      # só compõe componentes e hooks
  components/ui/       # primitivos reestilizados (botão, sheet, toast...)
  lib/                 # http client, socket client, query keys
  utils/
    date.ts            # formatar data, contagem regressiva, offset do servidor
    money.ts           # centavos para BRL e vice-versa
```

## Regras

1. **Página fina.** A página monta layout e chama hooks. Se a página tem
   `useMutation`, `invalidateQueries`, `toast(...)` ou função de formatação definida
   dentro dela, extrair.
2. **Um hook por caso de uso.** `useCancelLot()` devolve `{ cancelLot, isPending }`
   e cuida sozinho de invalidar as queries certas e mostrar o toast certo.
3. **Formulários com React Hook Form + zod** (`@hookform/resolvers/zod`). Nada de um
   `useState` por campo. O schema zod mora junto da feature e reaproveita os limites
   de `packages/shared` quando existirem.
4. **Nada de ternário aninhado.** Para estados com mais de dois casos, usar mapa ou
   função com nome:
   ```ts
   const bidStatusLabel: Record<BidStatus, string> = {
     WINNING: 'Você está ganhando',
     OUTBID: 'Você foi superado',
     NONE: 'Você ainda não deu lance',
   };
   ```
   Ou early return dentro de um componente pequeno. Mensagens de erro de lance vêm de
   um mapa `errorCode → mensagem`.
5. **Componentizar** quando um bloco de JSX tem nome próprio no domínio (plaquinha,
   raquete, barra de tempo, linha do extrato) ou passa de ~40 linhas.
6. **Datas e dinheiro** só via `utils/date.ts` e `utils/money.ts`. Nunca
   `toLocaleString` espalhado nas páginas.
7. **Query keys centralizadas** em `lib/query-keys.ts`.
8. **Socket** num provider/hook (`useLotRoom(lotId)`), que atualiza o cache do
   TanStack Query. Componentes não falam com o socket diretamente.

## Manter (pontos elogiados)

- Toast em toda ação com resultado (sucesso e erro), com texto específico.
- Estados de carregando, vazio e erro em toda tela que busca dados.
- Menu mobile em sheet/modal bem resolvido, com foco preso e fechamento por Esc.
- Botões desabilitados com feedback enquanto a ação está pendente.

## Sinais de alerta

- Arquivo de página com mais de ~150 linhas.
- Mais de 3 `useState` num componente de formulário.
- `? ... : ... ? ...` em qualquer lugar.
- Função `formatDate`/`formatMoney` definida dentro de componente.
