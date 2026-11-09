# ADR-008 — Aceitar `Inicio`/`Fim` e `Retorna`

## Status

Aceito (2026-11-06) — decisões D1/D2 do [PDR-012](../pdr/PDR-012-paridade-compilador-senior.md); aplicar na etapa 0.

## Contexto

Hoje a extensão, o analyzer e as rules/skills do Agent tratam como erro:

- `Inicio` / `Fim;` / `FimSe` / `FimEnquanto` — **SYN004** (lint) e **ANL004** (analyzer), com quick fix para `{ }`;
- `Retorna;` / `Retorne;` — **RUL007** (lint) e **ANL010** (analyzer), com quick fix para `Cancel(1);`.

A lista de palavras reservadas do compilador Senior (extraída do compilador Java, `compilador_senior.json` da extensão interna `senior-lsp`) contém `INICIO`, `FIM` e `RETORNA`, e as mensagens do compilador incluem "falta valor de retorno". A extensão interna trata `retorna` como embutido de aridade 0–1 e como constante (`Mensagem(Retorna, …)`). Por decisão do usuário, os dados extraídos do Senior valem mais que a nossa doc (PDR-012, D1). A própria doc local já diz que `Inicio` equivale a `{` e `Fim;` a `}` (`docs/lsp/palavras-reservadas.md`, `docs/lsp/tabelas.md`, `docs/lsp/sintaxe.md`).

`FimSe` e `FimEnquanto` **não** estão na lista de reservadas.

## Decisão

1. `Inicio` abre bloco e `Fim` fecha bloco, como `{` e `}`, no parser, no balanceamento (SYN008, ANL001, ANL002), na formatação e no escopo de símbolos. Sem diagnóstico de estilo.
2. `Retorna(x)` e `Retorna()` são comando embutido com 0–1 argumento (como a tabela de embutidos da `senior-lsp`). `Retorna` como 1º argumento de `Mensagem` é constante válida.
3. `Retorna;` e `Retorne;` **sem parênteses** continuam erro. **RUL007** (lint) e **ANL010** (analyzer) são mantidos com escopo reduzido a essa forma, com a mensagem do compilador "falta valor, expressão ou comando". O quick fix "→ `Cancel(1);`" continua.
4. `FimSe` / `FimEnquanto` continuam inválidos, agora com ID próprio **SYN016** (erro, mesma mensagem do compilador).
5. **SYN004 e ANL004 são revogados.** Os IDs não são reutilizados; ficam marcados "revogado (ADR-008)" em `regras-estaticas-lsp.md`. `lsp.ignoreIds` com esses IDs vira no-op.
6. Padrão de **geração** do Agent não muda: gerar `{ }` e usar `Cancel(1);` após erro. A conversão `Inicio`/`Fim` → `{ }` continua como refactor opcional (`/refatorar-lsp`), não como correção obrigatória. `Retorna(x)` pode aparecer em código existente; o Agent não o sugere no lugar de `Cancel(1)`.

Manter os IDs RUL007/ANL010 (em vez de criar novos) preserva `lsp.ignoreIds`, comentários de ignorar e o mapa de equivalência que já citam esses IDs; só a descrição e o padrão de detecção mudam.

## Alternativas

- **Manter `Inicio`/`Fim` como aviso de estilo.** Rejeitada: continua acusando código que compila no Senior, e o usuário pediu paridade.
- **Revogar RUL007/ANL010 por completo.** Rejeitada: `Retorna;` sem parênteses não compila no Senior.
- **Novo ID para `Retorna;`.** Rejeitada: quebraria `ignoreIds` existentes sem ganho.
- **Remover só o diagnóstico SYN004 e manter o quick fix ligado ao ID.** Rejeitada: quick fix sem diagnóstico não aparece; o caminho certo é o refactor.

## Consequências

- Regras coladas do Senior com `Inicio`/`Fim` ou `Retorna(x)` deixam de ficar vermelhas.
- Rules e skills do Agent precisam parar de dizer que `Retorna` "não existe" (afirmação falsa); passam a dizer "`Retorna;` sem parênteses não compila; após erro, preferir `Cancel(1)`".
- Testes que esperam SYN004/ANL004 mudam para esperar ausência; testes de RUL007/ANL010 ganham casos de `Retorna(x)` e `Mensagem(Retorna, …)` sem diagnóstico; SYN016 para `FimSe`.
- `.github/` é espelhado a partir de `.cursor/` por `scripts/sync-copilot-from-cursor.mjs`; `.agents/skills/` e `packages/lsp-workbench-agent/` são espelhos que precisam ser atualizados junto.

## Arquivos a atualizar

Levantamento por Grep (`SYN004|ANL004|RUL007|ANL010|Retorn[ae];|` + "`Retorna`" + `|Retorne|` + "`Inicio`" + `|Fim;|FimSe|FimEnquanto`). Exemplos `.lsp` que usam `Inicio`/`Fim` passam a ser válidos e **não** precisam mudar.

### Código e testes

| Arquivo | O que muda |
|---------|------------|
| `packages/lsp-analyzer/src/parser.ts` | `Inicio`/`Fim` como abre/fecha bloco; `Retorna(` como chamada embutida; `Retorna;`/`Retorne;` segue nó próprio |
| `packages/lsp-analyzer/src/semantic.ts` | remover ANL004; ANL010 só para `Retorna;`/`Retorne;` |
| `packages/lsp-analyzer/src/lint/diagnostics.ts` | remover SYN004 e `hasSyn004`; RUL007 só sem parênteses (mantém dedup `hasRul007`); mensagem do compilador; criar SYN016; `Inicio`/`Fim` no balanceamento |
| `packages/lsp-analyzer/src/lint/rule-catalog.ts` | tirar SYN004; incluir SYN016; descrição nova de RUL007 |
| `packages/lsp-analyzer/src/lint/quick-fixes.ts` | remover fixer SYN004 (conversão vira refactor); fixer RUL007 só para a forma sem parênteses |
| `packages/lsp-workbench/src/code-actions.ts` | remover `syn004Actions` |
| `packages/lsp-workbench/src/completion.ts` | remover sugestão SYN004; voltar `Retorna` ao completion (snippet `Retorna($1);`) |
| `packages/lsp-workbench/src/application/refactors.ts`, `src/adapters/vscode/refactors-provider.ts`, `scripts/refactor-lsp.mjs` | manter conversão `Inicio`/`Fim` → `{ }` como refactor (revisar textos) |
| `packages/lsp-workbench/syntaxes/lsp.tmLanguage.json`, `scripts/generate-tmgrammar.mjs` | tirar `FimSe`/`FimEnquanto` de `keyword.control` |
| `packages/lsp-workbench/snippets/lsp.json` | revisar menções |
| `packages/lsp-analyzer/src/test/analyzer.test.ts` | ANL004 some; ANL010 continua para `Retorna;`, some para `Retorna(x)` |
| `packages/lsp-workbench/src/test/rules-expanded.test.ts`, `formatter-diagnostics.test.ts`, `quick-fixes.test.ts`, `completion.test.ts`, `pdr003-symbols.test.ts`, `call-site.test.ts`, `parity-ux.test.ts` | expectativas |
| `packages/lsp-workbench/fixtures/smoke-rul.lsp`, `smoke-syn.lsp`, `MANIFEST.json` | remover caso SYN004; RUL007 só com `Retorna;`; caso SYN016 |
| `packages/lsp-workbench/README.md`, `packages/lsp-workbench/CHANGELOG.md` | nota de revogação/restrição |

### Rules, skills e comandos do Agent (`.cursor/` + espelhos)

Cada item abaixo existe também em `.github/` (via sync), `.agents/skills/` e `packages/lsp-workbench-agent/`.

| Arquivo (`.cursor/…`) | Trecho |
|-----------------------|--------|
| `rules/lsp-nucleo.mdc` | anti-padrão 1 ("`Retorna` não existe" → "`Retorna;` sem parênteses não compila; após erro, `Cancel(1);`"), anti-padrão 11 (blocos: `{ }` é padrão de geração, `Inicio`/`Fim` são válidos), regra de ouro "Interrupção" |
| `rules/lsp.mdc` | blocos `{ }`; explicação "`Retorna;` não existe" (ajustar para a forma sem parênteses) |
| `rules/lsp-sintaxe.mdc` | "não usar `Inicio`/`Fim;`" |
| `rules/lsp-limites.mdc` | "não existe `Retorna`" |
| `rules/lsp-logs.mdc` | "(não `Retorna`)" |
| `rules/lsp-validacao-obrigatoria.mdc` | menção à regra revogada |
| `skills/lsp-linguagem/SKILL.md` | itens 1 e 11 e checklist |
| `skills/lsp-linguagem/reference-sintaxe.md` | blocos; tabela `Retorna`→`Cancel(1)` e `Inicio`/`Fim`→`{ }` |
| `skills/lsp-linguagem/reference-padroes.md` | exemplos com `FimSe`/`FimEnquanto`; "usar `Retorna`" como erro |
| `skills/lsp-linguagem/snippets.md` | revisar |
| `skills/lsp-gerar/SKILL.md` | lista de anti-padrões |
| `skills/lsp-revisar/SKILL.md` | checklist blocos / interrupção |
| `skills/lsp-compilar/SKILL.md` | tabelas: ANL004/SYN004 revogados; ANL010/RUL007 só `Retorna;`/`Retorne;`; exemplo de relatório |
| `skills/lsp-refatorar/SKILL.md` | manter conversão `Inicio`/`Fim` como opcional; "`Retorna;` → `Cancel(1)`" só para a forma sem parênteses |
| `skills/lsp-formatar/SKILL.md` | menções a `Inicio`/`Fim` |
| `commands/refatorar-lsp.md`, `commands/formatar-lsp.md` | idem |
| (só `.agents/skills/`) `source-command-refatorar-lsp/SKILL.md`, `source-command-formatar-lsp/SKILL.md` | idem |
| `packages/lsp-workbench-agent/docs/ids-estaticos.md` | SYN004/ANL004 revogados; RUL007/ANL010 restringidos; SYN016 |
| `.github/copilot-instructions.md`, `.github/instructions/lsp*.instructions.md`, `.github/prompts/{refatorar,formatar}-lsp.prompt.md` | regenerar pelo sync |

### Docs

| Arquivo | Trecho |
|---------|--------|
| `docs/product/regras-estaticas-lsp.md` | SYN004 e ANL004 "revogado"; RUL007 e ANL010 com nova descrição/detecção (só sem parênteses) e mensagem do compilador; SYN016 |
| `docs/lsp/avisos-iniciantes.md` | seção "`Retorna;` não existe" (linhas ~50–61): manter o erro para `Retorna;`, explicar `Retorna(x)` válido |
| `docs/lsp/sintaxe.md` | "não gerar `Inicio`/`Fim`" vira preferência, não proibição |
| `docs/lsp/palavras-reservadas.md`, `docs/lsp/tabelas.md`, `docs/lsp/mensagens.md` | já corretos; conferir |
| `docs/lsp/evolucao-regras-lsp.md` | registrar revogação (SYN004/ANL004) e restrição (RUL007/ANL010) |
| `docs/product/eval/EVAL-extension.md`, `EVAL-agent.md` | casos de avaliação |
| `docs/product/tdd/TDD-paridade-ux.md`, `TDD-extension.md`, `TDD-agent-skills.md` | referências |
| `docs/product/pdr/PDR-002-geradores-trechos.md`, `docs/product/CHANGELOG-plataforma.md` | referências (histórico: só nota) |

## Relacionados

- [PDR-012](../pdr/PDR-012-paridade-compilador-senior.md)
- [regras-estaticas-lsp.md](../regras-estaticas-lsp.md)
- PDR-005 (analyzer), ADR-005
