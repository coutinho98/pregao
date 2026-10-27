# DESIGN.md — Identidade visual "Salão de Pregão"

Leia junto com o CLAUDE.md antes de qualquer trabalho de front-end.
Se um componente não estiver coberto aqui, siga o espírito do conceito e pergunte.

## Conceito

Uma casa de leilões de arte de verdade, não um e-commerce. O app imita o que existe
fisicamente num pregão: paredes de galeria pintadas, plaquinhas de latão com o número
do lote, a raquete numerada que o licitante levanta, o martelo que bate, e o lacre de
cera que fecha um documento.

Isso não é decoração gratuita: cada metáfora cobre um requisito do teste.

| Objeto físico | Requisito que ele representa |
|---|---|
| Raquete numerada (paddle) | Pseudônimo por lote — o licitante é um número, nunca um nome |
| Plaquinha de latão | Ficha do lote na vitrine (título, nº do lote, lance atual) |
| Raquete levantada | Novo lance chegando em tempo real |
| Martelo batido | Lote encerrado / liquidado |
| Lacre de cera | Comprovante e cadeia de hashes; lacre partido = adulterado |

O que a concorrência faz (e evitamos): grade de cards idênticos com Tailwind/shadcn
padrão, ícones Lucide em tudo, paleta azul-marinho + verde-limão da própria Verzel,
abas genéricas "Ao vivo / Agendados / Encerrados".

## Cores

Inspiradas em paredes de salão de museu (verde-garrafa), molduras de latão e cera de lacre.

| Token | Hex | Uso |
|---|---|---|
| `--parede` | `#23392F` | Fundo da sala ao vivo, cabeçalho, superfícies de destaque |
| `--papel` | `#F1F3EE` | Fundo geral no tema claro (branco frio, levemente esverdeado — não creme) |
| `--tinta` | `#17201B` | Texto principal |
| `--latao` | `#B08D3C` | Raquetes, plaquinhas, lance atual, foco. Nunca como fundo de área grande |
| `--lacre` | `#9E2A2B` | "Você foi superado", lote ao vivo (ponto), adulteração, erros |
| `--selo` | `#3F7D5C` | "Você está ganhando", auditoria íntegra, sucesso |
| `--nevoa` | `#8A958E` | Texto secundário, bordas |

Tema escuro = "luzes da galeria apagadas": `--papel` vira `#111814`, `--parede` vira
`#1A2A23`, `--tinta` vira `#E6EAE4`. Latão, lacre e selo mantêm o tom, só ajustar
contraste (checar WCAG AA). Todas as cores como CSS variables em `:root` e
`[data-theme="dark"]`; Tailwind consome as variáveis.

Proibido: gradientes decorativos, sombra cinza genérica em tudo, a paleta da Verzel.

## Tipografia

Duas famílias, papéis bem separados (Google Fonts):

- **Big Shoulders Display / Big Shoulders Text** — números e chamadas: nº do lote,
  raquetes, lance atual, contagem regressiva, botões. Condensada e alta, como placas
  de pregão. (Foi desenhada para Chicago, e os itens vêm do Art Institute of Chicago.)
- **Source Serif 4** — texto corrido: descrição da obra, atributos, comprovante,
  explicação da auditoria. Tom de catálogo de leilão.

Escala (base 16px, razão ~1.333): 12 · 14 · 16 · 21 · 28 · 37 · 50 · 67 · 89.
O lance atual na sala ao vivo usa 89px+ em Big Shoulders Display.
Números sempre com `font-variant-numeric: tabular-nums` (valores e countdown não pulam).
Serif com line-height 1.6; linhas de texto com no máximo ~70 caracteres.

Evitar: labels em CAIXA ALTA espaçada, fonte monospace para dados, destacar uma
palavra do título com outra cor, "→" no fim de botões.

## Formas

- Raio pequeno e intencional: 2px em plaquinhas e campos; raquetes têm o formato
  próprio (círculo/oval com cabo). Nada de "tudo com rounded-xl".
- Imagens das obras sem corte forçado: respeitar a proporção original, com uma
  moldura fina de latão (borda 1px `--latao` + respiro de 8px em `--papel`).
- Bordas só quando separam informação. Sem sombras, exceto a raquete levantada.

## Telas

### Vitrine — "a parede do salão"
Pendurada como uma parede de salão (salon hang): obras em alturas diferentes, na
proporção real, em grade masonry. Embaixo de cada obra, uma plaquinha de latão.

```
┌──────────────────────────────────────────────────────────────┐
│ Casa de Leilões        Em pregão · Próximas · Martelo batido │  ← filtro
├──────────────────────────────────────────────────────────────┤
│ ┌────────┐  ┌──────────────┐  ┌──────┐   ┌────────┐          │
│ │        │  │              │  │      │   │        │          │
│ │  obra  │  │     obra     │  │ obra │   │  obra  │          │
│ │        │  └──────────────┘  │      │   └────────┘          │
│ └────────┘  ▭ Lote 014        └──────┘   ▭ Lote 021          │
│ ▭ Lote 007    R$ 4.300  ● 02:11 ▭ Lote 009   abre 28/10 14h  │
│   R$ 1.250                      martelo R$ 900               │
└──────────────────────────────────────────────────────────────┘
```
Ordem: lotes em pregão primeiro (com ponto `--lacre` pulsando discretamente), depois
próximos, depois encerrados em tons dessaturados. Busca e filtros numa linha discreta.

### Sala do lote ao vivo — o momento memorável
Toda a tela em `--parede`. A obra iluminada à esquerda; à direita, o pódio.

```
┌───────────────────────────────┬──────────────────────────────┐
│                               │ Lote 014                     │
│                               │ Lance atual                  │
│          [ obra ]             │ R$ 4.300                     │  ← Big Shoulders 89px
│                               │ (raquete #A3F9 levantada)    │
│                               │ ▬▬▬▬▬▬▬▬▬▬▬▬▱▱▱  02:11       │  ← barra que esvazia
│                               │                              │
│ Título da obra (serif)        │ ● Você está ganhando         │  ← selo / lacre
│ Artista, ano, técnica         │ Sua posição: 1º de 4         │
│                               │ [ R$ 4.400 ]  [ Dar lance ]  │
│                               │                              │
│                               │ Raquetes levantadas          │
│                               │  #A3F9  R$ 4.300   19:02:41  │
│                               │  Você   R$ 4.100   19:02:10  │
│                               │  #7C21  R$ 3.900   19:01:55  │
└───────────────────────────────┴──────────────────────────────┘
```
- A ÚNICA animação automática do app: quando chega um lance, uma raquete com o
  pseudônimo sobe no topo do histórico e o valor do lance atual troca. ~400ms.
  Respeitar `prefers-reduced-motion` (sem movimento, só troca).
- Anti-sniping: quando o prazo é estendido, a barra volta a encher e aparece a frase
  "Prazo estendido em 2 minutos por lance no fim".
- "Você foi superado" em `--lacre`, ocupando a largura do pódio, com o novo mínimo
  já preenchido no campo.
- Recusas de lance aparecem logo abaixo do botão, na voz da casa, dizendo o que
  fazer: "O lance mínimo agora é R$ 4.400." / "Seu saldo disponível é R$ 1.200.
  Deposite mais na carteira para continuar."
- Lote encerrado: a raquete do vencedor fica, e aparece "Martelo batido em R$ 4.300".

### Carteira — "livro-caixa"
Três números em Big Shoulders lado a lado (total, comprometido, disponível), com a
barra de saldo dividida em duas cores (comprometido em latão). Abaixo, o extrato
como um livro-caixa em serif, com valores alinhados à direita.

### Meus arremates
Lista simples. Cada item: miniatura emoldurada, nº do lote, situação ("Liderando",
"Superado", "Arrematado por R$ X"), e nos vencidos o botão "Copiar link do comprovante".

### Comprovante público — "nota de arremate"
Página que parece um documento de casa de leilões: cabeçalho da casa, nº do lote,
obra, valor, raquete vencedora (pseudônimo), data, e um **lacre de cera** (SVG em
`--lacre`) com os 6 primeiros caracteres do hash final gravados. Link para a auditoria.
Gerar também imagem Open Graph para o link ficar bonito quando compartilhado.

### Auditoria — "cadeia de lacres"
Os lances em sequência vertical, cada um um lacre ligado ao anterior por um fio.
Verificação no navegador, um lacre de cada vez (rápido, sem enrolação):
- Íntegro: todos os lacres em `--selo`, frase "Histórico íntegro: 12 lances
  verificados com a chave pública da casa."
- Adulterado: o primeiro lacre com problema aparece partido em `--lacre`, com o
  motivo em linguagem simples ("O valor do lance 7 foi alterado depois de registrado").
  Os seguintes ficam acinzentados.
- Uma seção recolhível "Como verificamos" explica a técnica em 4 frases.

### Painel do leiloeiro — "escritório da casa"
Aqui a metáfora recua: é uma ferramenta de trabalho. Fundo `--papel`, tabela clara.
Busca no acervo do museu com resultados em grade emoldurada; formulário do lote ao
lado com prévia da plaquinha em tempo real. Tabela de resultados com total recebido.

## Texto da interface

Vocabulário fixo (o mesmo nome do começo ao fim do fluxo):
lote, lance, dar lance, raquete, em pregão, próximas sessões, martelo batido,
arrematar, comprovante de arremate, carteira, depositar, saldo comprometido.

Frases curtas, voz ativa, sem pedir desculpas. Estado vazio convida a agir:
"Nenhum lote em pregão agora. Veja as próximas sessões."

## Implementação

- Pode usar Radix/shadcn como base de acessibilidade, mas reestilizar tudo com os
  tokens acima — nada pode ficar com a cara padrão do shadcn.
- Ícones: poucos, e desenhados no tema (raquete, martelo, lacre como SVG próprios).
  Evitar espalhar Lucide.
- Acessibilidade: foco visível em `--latao` (outline 2px), contraste AA nos dois temas,
  textos de status anunciados com `aria-live="polite"` na sala ao vivo.
- Responsivo: na sala ao vivo em mobile, obra em cima (altura limitada), pódio fixo
  embaixo com o botão de lance sempre visível.
