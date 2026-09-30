# PDR-011 — Dicas práticas no hover e na ajuda de parâmetros

| Campo | Valor |
|-------|-------|
| Status | **Implementado** |
| Data | 2026-09-30 |
| Artefato | Extensão `packages/lsp-workbench` + extrator `scripts/extract-lsp-functions.mjs` |
| Relacionados | PDR-003 (hover / signature help), PDR-004 (catálogo), `docs/lsp/` |

## Problema

A documentação em `docs/lsp/` (origem: [Documentacao-LSP](https://github.com/brunoleocam/Documentacao-LSP-Linguagem-Senior-de-Programacao)) traz dicas de uso que a documentação oficial da Senior não publica: botões de `Mensagem`, concatenação proibida no argumento, variável intermediária, códigos de retorno mostrados só no exemplo.

O editor não mostra essas dicas. O hover e a ajuda de parâmetros leem o catálogo mergeado (`function-catalog.ts`): texto gerado, depois HCM/ERP, e por último o override, que substitui a entrada inteira.

O extrator (`scripts/extract-lsp-functions.mjs`) guarda o primeiro parágrafo e as seções Parâmetros, Algoritmos, Códigos e Retorno. Descarta seção `**Exemplo**`, blocos de código e avisos. Várias funções ainda nascem da tabela de uma linha em `funcoes-gerais.md`. Um override curto apaga o que o extrator tiver achado.

Piloto já feito fora deste PDR: botões de `Mensagem` no override (`function-catalog.overrides.ts`) e no snippet `packages/lsp-workbench/snippets/lsp.json`.

## Decisão

A fonte do que o editor mostra continua sendo `docs/lsp/` neste monorepo. O repositório GitHub só serve para atualizar essa pasta. Não há segunda fonte em runtime.

Uma dica entra no catálogo só quando as três condições valem:

1. Está na seção da função em `docs/lsp/` (aviso, exemplo curto ou sintaxe que o primeiro parágrafo não cobre).
2. Não está na `documentation` do catálogo HCM/ERP da mesma função (senão já é doc oficial).
3. Cabe num bloco curto **Dica**, visível no hover da função e, quando a dica é de um argumento, na ajuda desse parâmetro.

O inventário vem antes de mudar o extrator. Sem a lista, não se sabe o tamanho do incremento.

## O que conta como dica

Na seção da função, qualquer um destes:

- título `**Exemplo**`, `**Exemplo de uso incorreto**` ou equivalente
- marca `⚠️`, `💡`, `NÃO FUNCIONA`, `uso incorreto`
- sintaxe no texto que não cabe na assinatura, como botões `[&…]`

Arquivo sem heading `### NomeDaFuncao` vale a função do tema quando o arquivo é dedicado a ela: `mensagens.md` → `Mensagem`, `cancel.md` → `Cancel`, `entrada-valor.md` → `EntradaValor`.

Não é dica: tutorial longo, exercício, caso de uso de várias funções, ou frase que já está no catálogo de produto.

## O que o editor mostra

No máximo, por função:

- uma frase de aviso
- um exemplo mínimo (o primeiro bloco `lsp` da dica, truncado)
- o retorno, quando o exemplo atribui o resultado (`vn = Funcao(...)`)

O bloco vai na `documentation` com o título `**Dica**`. A ajuda de parâmetros (`orderedCatalogParams` / `formatParamHover`) mostra a dica no argumento a que ela se refere. Se não der para saber o argumento, fica só na descrição da função (`signatureOverview` já preserva seções que não são `**Parâmetros**`).

O limite atual de `buildDocumentation` (2800 caracteres, em `scripts/extract-lsp-functions.mjs`) permanece. Dica que não cabe é registrada no relatório e não é cortada no meio de um exemplo.

## Levas

| Leva | Entrega | Pronto quando |
|------|---------|----------------|
| **0** | `scripts/report-catalog-tips.mjs` | Imprime, por função, o marcador presente em `docs/lsp/` e ausente na `documentation` do catálogo mergeado. Separa “já está no HCM/ERP” de “falta no editor”. Não grava catálogo. |
| **1** | Extrator anexa `**Dica**` | `findSupplementAfter` deixa de ignorar o primeiro aviso e o primeiro exemplo curto. `npm run extract-functions` regenera o catálogo. Função sem override passa a mostrar a dica no hover. |
| **2** | Override não apaga dica | O merge em `function-catalog.ts` mantém o bloco `**Dica**` gerado quando o override não contém os mesmos marcadores. Snippet em `snippets/lsp.json` só muda se a descrição nativa da função também omite a dica. |
| **3** | Regressão | Teste em `packages/lsp-workbench/src/test/` cobre `Mensagem` (`[&Sim`) e mais uma função cuja dica veio do extrator, não de override manual. O relatório da leva 0, rodado de novo, só lista o que ficou de fora por tamanho, com o motivo na saída. |

## Não-objetivos

- Copiar a documentação oficial da Senior para o hover (isso já vem dos catálogos HCM/ERP).
- Colar o markdown inteiro de `docs/lsp/` no Ctrl+Espaço.
- Sincronizar o GitHub no build.
- Criar diagnóstico novo (SYN/RUL/FUN/…) só porque a dica existe.
- Reescrever overrides que já contêm a dica. `Mensagem` permanece o piloto.

## Aceite

- [x] A leva 0 lista as funções com dica em `docs/lsp/` ausente no catálogo que o editor usa. Comando: `node scripts/report-catalog-tips.mjs`.
- [x] Hover e ajuda de parâmetros mostram o bloco `**Dica**` das funções que passaram no filtro.
- [x] Override não remove marcador que o markdown da função tem e o texto do override não tem.
- [x] `Mensagem` continua documentando `[&Sim,&Não]` no helper do texto e na descrição.
- [x] O que não entrou por passar de 2800 caracteres aparece no relatório, com o nome da função. Na primeira execução após a implementação: nenhuma função estourou o limite. Duas dicas ficaram de fora porque o texto já está no catálogo HCM/ERP (`LimpaGerTabAlf`, `PegarTipoVar`).
