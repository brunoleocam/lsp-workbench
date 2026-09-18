---
name: lsp-demobile
description: Orquestra desenvolvimento LSP no contexto Demóbile — regras Senior internas, docs/banco-senior, fluxo da operação e skills locais. Use ao editar regras .lsp Demóbile, SQL Oracle Senior (E*/R*/USU_*), CODEMP/CODFIL/NUMPED, ou quando o usuário mencionar Demóbile, docs/senior ou docs/banco-senior.
---

# LSP Demóbile (interno)

Skill **interna** da Demóbile. Depende deste workspace (pasta do pacote aberta no Cursor), com docs e `.cursor` locais.

## Pré-requisitos

Workspace = raiz deste pacote, contendo:

- `docs/banco-senior/`
- `docs/senior/` (inclui `regras/`, `insights-regras-senior.md`, `fluxo-operacao/`)
- `docs/lsp/` (linguagem)
- Skills irmãs em `.cursor/skills/`

Se faltar pasta crítica, avisar e não inventar schema/regras.

## Fluxo obrigatório

### 1. Linguagem LSP

Seguir **`lsp-gerar`** (e **`lsp-linguagem`** para sintaxe/padrões).

Índice de linguagem: `docs/lsp/README.md` — abrir só o tópico necessário.

### 2. Regra de negócio / comportamento Demóbile

Ordem sugerida:

1. `docs/senior/indice.md`
2. `docs/senior/insights-regras-senior.md` (visão por domínio)
3. `docs/senior/fluxo-operacao/` (domínio: vendas, compras, estoque, etc.) — **o que pode / não pode**
4. `docs/senior/regras/indice.csv` → arquivo `.lsp` correspondente em `docs/senior/regras/`

Não inventar regra que não esteja no índice, no fluxo ou no `.lsp`.

### 3. SQL / tabelas / colunas / enums Senior

**Obrigatório:** skill **`lsp-banco`**.

Ordem mínima:

1. `docs/banco-senior/README.md`
2. Convenções / fluxos / tabelas / chaves conforme a dúvida
3. Enums: `docs/banco-senior/dicionario-dados/dominios-enumeracoes*.md`
4. `docs/banco-senior/dicionario-dados/tabelas/<TABELA>.md` para tabela específica

Sem entrada no dicionário → declarar lacuna; não inventar coluna.

### 4. Antes de encerrar

1. Checklist **`lsp-revisar`**, e/ou
2. **`lsp-validar`** + `node scripts/analyze-lsp.mjs <arquivo>` (ANL*)
3. Confirmar tabelas/campos no dicionário (`lsp-banco`); se existir, pode regenerar índice:
   `node scripts/build-demobile-catalog.mjs`

Commands Cursor: `/consultar-tabela` · `/fluxo-regra` · `/gerar-com-banco`

Corrigir violações críticas. Logs: skill **`lsp-logs`** se a tarefa incluir logging.

## Mapa rápido

| Necessidade | Onde |
|-------------|------|
| Sintaxe LSP | `docs/lsp/` + `lsp-gerar` |
| Insights regras | `docs/senior/insights-regras-senior.md` |
| Código de uma regra | `docs/senior/regras/` + `indice.csv` |
| Fluxo / pode-não-pode | `docs/senior/fluxo-operacao/` |
| Modelo de dados | `docs/banco-senior/` + `lsp-banco` |
| Rules Cursor | `.cursor/rules/` (`lsp-nucleo`, `lsp-regras-senior`, `lsp-banco-senior`, …) |

## Anti-padrões Demóbile

- Inventar `E*`/`R*`/`USU_*` sem dicionário
- Alterar regra sem ler a `.lsp` atual e o domínio no fluxo/insights
- Tratar sucesso de `ExecSQLEx` como `1`
- Publicar `docs/banco-senior` ou `docs/senior/regras` em repositório público
