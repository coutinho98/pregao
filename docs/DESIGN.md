# DESIGN.md — Identidade visual "Pregão"

Leia junto com o CLAUDE.md antes de qualquer trabalho de front-end.
Se um componente não estiver coberto aqui, siga o espírito do conceito e pergunte.

Linguagem visual herdada do TK7 (projeto do autor): monocromática, conversacional e
tátil. Substitui a identidade anterior "Salão de Pregão" (verde-garrafa e latão).

## Conceito

Uma casa de leilões que parece um aparelho bem feito, não um e-commerce. A interface é
quase toda em tons neutros; a cor aparece só quando carrega significado (ganhando,
superado, ao vivo). O conteúdo principal é a obra, apresentada como num catálogo de
leilão: direto no fundo da página, sem caixa nem moldura, só com uma sombra suave, em
proporção real e pousada na base do espaço, para uma fileira de obras dividir a mesma linha.

Dois objetos da casa de leilão ficam, redesenhados como peças monocromáticas em SVG,
porque cobrem requisitos do teste:

| Objeto | Requisito |
|---|---|
| Raquete numerada | Pseudônimo por lote: o licitante é um número, nunca um nome |
| Lacre | Comprovante e cadeia de hashes; lacre partido = adulterado |

A interface fala com a pessoa em frases curtas, com dados no meio do texto em chips:
"Boa tarde. Há `4 lotes` em pregão agora."

## Cores

Tokens em `:root` e `[data-theme="dark"]`; o Tailwind consome as variáveis.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--bg` | `#fafafa` | `#0a0a0b` | Fundo da página |
| `--surface` | `#f1f1f1` | `#1a1a1d` | Tiles, campos, estatísticas |
| `--surface-2` | `#e9e9e9` | `#232327` | Hover de superfícies |
| `--card` | `#ffffff` | `#121214` | Cartões, dock, barras flutuantes |
| `--chip` | `#ececec` | `#222225` | Chips no texto, campos de busca |
| `--line` / `--line-strong` | preto 7% / 13% | branco 7% / 14% | Linhas finas, bordas |
| `--ink` | `#141414` | `#ededed` | Texto principal |
| `--ink-2` | `#6c6c6c` | `#9b9ba1` | Texto secundário |
| `--ink-3` | `#a4a4a4` | `#5d5d63` | Rótulos, metadados (nunca texto essencial) |
| `--primary` / `--primary-ink` | `#141414` / branco | `#f0f0f0` / `#0a0a0b` | Ação principal |
| `--up` | `#1f9d55` | `#3ddc84` | Você está ganhando, ao vivo, sucesso |
| `--danger` | `#d4402f` | `#ff6b5b` | Você foi superado, erros, adulteração |
| `--gold` | `#b88600` | `#f5c542` | Arrematado (vencedor) |

Proibido: gradientes decorativos, cor de marca espalhada, verde/limão da Verzel.

## Tipografia

- **Inter Variable** para tudo. Base 15px, line-height 1.5. Títulos com peso 600–650 e
  `letter-spacing` negativo (−0,02em a −0,03em). Rótulos pequenos em 12–13px, `--ink-3`.
- **Geist Mono Variable** para números que mudam ou que precisam alinhar: valores,
  countdown, relógio, pseudônimos, hashes. Sempre `tabular-nums`.
- Fontes servidas pelo app (`@fontsource-variable`), sem Google Fonts.

Evitar: CAIXA ALTA espaçada, mais de dois pesos por bloco, destacar palavra com outra cor.

## Formas e superfícies

- Raios generosos: cartões 22–26px, botões 14px, campos 12px, pílulas 999px.
- Sombras discretas e em camadas (`--shadow-card`, `--shadow-pill`, `--shadow-float`).
- Elementos flutuantes (dock, barra de lance) em vidro: `--card` a 85% com `backdrop-blur`.
- Bordas do viewport com desfoque (topo e rodapé), para o conteúdo sumir suave.
- Ícones Lucide, finos (stroke 1.8; 2.2 quando ativos), tamanho 16–18px.

## Movimento

Curva única no estilo iOS: `cubic-bezier(0.32, 0.72, 0, 1)` (biblioteca `motion`).
- Página entra com opacidade + 6px de deslize (280ms).
- Dock: a pílula do item ativo desliza entre itens (`layoutId`) e o rótulo se expande.
- Controles segmentados e switches com knob que desliza.
- Novo lance na sala: a linha entra no topo do histórico (opacidade + deslize, ~350ms).
- Tudo respeita `prefers-reduced-motion`.

## Estrutura

- **Marca** no topo à esquerda (raquete pequena + "PREGÃO" em mono); à direita, tema e conta.
- **Dock** flutuante no rodapé com a navegação do papel (Vitrine, Carteira, Meus arremates
  ou Escritório). Some na sala ao vivo, onde dá lugar à barra de lance.
- **Rodapé** com relógio do servidor ao vivo: "Pregão · bons lances 14:02:11".
- Coluna estreita (máx. ~560px) para texto, formulários e sala; a vitrine abre em grade.

## Telas

### Vitrine
Saudação conversacional com chips ("Há `3 lotes` em pregão agora; o próximo encerra às
`17:30`."). Controle segmentado Todos · Em pregão · Próximos · Encerrados e busca.
Lotes como num catálogo: a obra direto na página, com sombra suave, alinhada pela base;
legenda abaixo com título, "Lote 007 · artista", valor em mono e estado
(ponto verde pulsando "ao vivo", "abre 28/10, 14:00", "encerrado").

### Sala do lote ao vivo
Coluna central. "Lote 007" em `--ink-2`, countdown grande em mono com marcas (ticks) que
apagam no fim; últimos 2 minutos em `--danger` com "um lance agora prorroga em 2 min".
Tile da obra. Frase de estado: "Lance atual `R$ 4.300` · `Licitante #A3F9C2`".
Banner "Você está ganhando" (ponto verde) / "Você foi superado" (vermelho) com a posição.
Histórico em lista com linhas finas, raquete mono em cada linha e "Você" nos seus lances.
Barra flutuante no rodapé: campo com o mínimo pré-preenchido + botão "Dar lance".
Recusas aparecem logo acima da barra, dizendo o que fazer.

### Carteira
Três tiles de estatística (total, comprometido, disponível) e uma barra fina dividida.
Depósito com chips de valores rápidos. Extrato em lista com linhas finas.

### Meus arremates
Lista: miniatura, lote, estado ("Liderando", "Superado", "Arrematado por R$ X") e
"Copiar link do comprovante" nos vencidos.

### Comprovante público
Cartão de documento com o lacre (SVG mono) e os 6 primeiros caracteres do hash final.

### Auditoria
Lista de lances encadeados, um lacre por linha; íntegro em `--up`, o primeiro problema
em `--danger` com o motivo em linguagem simples; seguintes esmaecidos.

### Escritório do leiloeiro
Busca no acervo em grade de miniaturas (✓ na selecionada); formulário em cartão com prévia;
lista "Seus lotes".

## Texto da interface

Frases curtas, voz ativa, sem pedir desculpas. Vocabulário fixo: lote, lance, dar lance,
raquete, em pregão, encerrado, arrematar, comprovante, carteira, depositar, comprometido.
Estado vazio convida a agir.

## Acessibilidade

Foco visível (outline 2px `--ink`), contraste AA nos dois temas (`--ink-3` só para
rótulos), `aria-live="polite"` para lance atual e estado na sala, alvos de toque ≥ 40px.
