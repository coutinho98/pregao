---
name: delivery-checklist
description: Use antes de entregar o teste técnico, ao escrever o README, preparar o vídeo de apresentação ou revisar se o projeto está pronto para envio.
---

# Checklist de entrega

Baseado no PDF do desafio e no feedback real da Verzel num teste anterior.

## O que o avaliador já elogiou (repetir)

- **Vídeo explicando a solução.** Foi chamado de diferencial muito positivo.
  Gravar de 5 a 8 minutos e colocar o link no topo do README.
- **Bônus praticamente completos.** Fazer todos os opcionais do PDF.
- **UX real:** toasts, feedback de cada ação, estados tratados, mobile bem resolvido.
- **Uso de IA com direção**, não um monte de telas geradas.

## O que faltou da outra vez (não pode faltar agora)

- **Documentação interativa da API.** Agora é Scalar em `/docs`. No README,
  escrever "Documentação OpenAPI (Swagger) interativa com Scalar" e colocar o link
  do deploy, para o avaliador reconhecer na hora que o pedido foi atendido.
- **Organização do código.** Rodar a skill `cleanup-pass` no projeto inteiro antes
  de entregar.
- **Visual com identidade própria.** Seguir o DESIGN.md. Nada de neobrutalismo
  ou visual de template.

## Roteiro do vídeo

1. (30s) Quem você é e o que construiu, com a aplicação aberta.
2. (2min) Fluxo do licitante em dois navegadores: depósito, lance, "você foi
   superado" ao vivo, anti-sniping estendendo o prazo, arremate e comprovante.
3. (1min) Fluxo do leiloeiro: busca no acervo, criação de lote, resultados.
4. (1min30) Auditoria: mostrar íntegro, rodar `pnpm tamper:demo`, mostrar o lacre
   partido no lance exato. É o momento mais forte do vídeo.
5. (1min) Decisões técnicas: centavos, transação com lock, cadeia de hashes com
   assinatura, resiliência da API, organização em camadas.
6. (30s) Documentação no Scalar, testes rodando, onde a IA ajudou e o que você revisou.

## Checklist final

- [ ] Deploy público funcionando em aba anônima
- [ ] Contas de teste do seed no README e lote ao vivo disponível
- [ ] Scalar acessível em `/docs` no deploy
- [ ] `docker compose up` sobe do zero
- [ ] `pnpm lint && pnpm typecheck && pnpm test` passando
- [ ] `cleanup-pass` rodada no projeto inteiro
- [ ] README completo, com a seção de prova de adulteração e a de comportamentos
      inesperados
- [ ] Vídeo gravado e linkado
- [ ] Seção "Uso de IA" escrita por você, honesta
- [ ] Repositório público, sem `.env`
