---
name: compilar-lsp
description: Pré-compilação LSP com IDs (analyzer + checklists), alinhada à extensão.
---

Pré-compilar / validar o código LSP em foco com **@lsp-compilar**.

## Objetivo

Mesmos diagnósticos da IDE: **ANL*** + **SYN/RUL/FUN/SEM/SQL** (+ **DEM**/**GER** quando aplicável).

| Rápido (~30s) | Completo |
|---------------|----------|
| `@lsp-revisar` | **`/compilar-lsp`** (este) |

## Passos

1. Escopo: seleção > arquivo > pasta. Se existir `relatorio.json` acima, tratar como **projeto de relatório** (GER*).
2. Diagnósticos: Problems da extensão IDE; se monorepo aberto, `node scripts/analyze-lsp.mjs <arquivo-ou-pasta>`. Reportar `[ANL…]`.
3. Seguir **@lsp-compilar** (IDs em `docs/ids-estaticos.md`; DEM se catálogo; GER se relatório).
4. Rules: `lsp-nucleo`, `lsp-sintaxe`, `lsp-limites`, `lsp-listas`, `lsp-banco-http`.
5. Entregar relatório no formato da skill.
6. Se pedir correção: aplicar e reexecutar.

## Foco mínimo

- Condições parentizadas; params `Numero`; retorno por parâmetro
- `Cancel(1)`; `{ }`; concat só Alfa; `ExecSQLEx` 0=ok
- Relatório: GER*; catálogo: DEM001 + `@lsp-banco`
