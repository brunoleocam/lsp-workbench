# Fixtures — smoke automatizado

Usadas por `npm test` (`smoke-fixtures.test.ts` + `MANIFEST.json`) e por EVAL F5 opcional.

## Como usar

1. `npm test` em `packages/lsp-workbench`
2. (Opcional) F5 → abrir `smoke-*.lsp` e conferir **Problems**

Projetos de relatório reais: use o comando **Gerar Relatório** / `/gerar-relatorio` (não há árvore demo versionada).

## Mapa

| Arquivo | O que exercita |
|---------|----------------|
| `00-ok-clean.lsp` | Zero diagnósticos |
| `smoke-syn.lsp` | SYN001–010 (+ RUL008) |
| `smoke-rul.lsp` | RUL001–019 (menos RUL008) |
| `smoke-fun.lsp` | FUN001–006 |
| `smoke-fun-pdr003.lsp` | FUN007–009 |
| `smoke-sem.lsp` | SEM001–003 |
| `smoke-sem004.lsp` | SEM004 |
| `smoke-sql.lsp` | SQL001–009 |
| `format-if.lsp` | Format Document |
| `smoke-ger.lsp` / `smoke-ger-pre.lsp` | GER001–GER004 (`reportContext` no MANIFEST) |
| `extracted-functions.json` | Cobertura do catálogo / TextMate |

Expectativas: [`MANIFEST.json`](./MANIFEST.json) ↔ [`docs/product/regras-estaticas-lsp.md`](../../../docs/product/regras-estaticas-lsp.md).
