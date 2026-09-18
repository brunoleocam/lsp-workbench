# Fixtures — smoke real (F5)

Pasta aberta pelo launch **Run LSP Workbench Extension**.

## Como usar

1. `npm test` em `packages/lsp-workbench` (cobertura automática via `MANIFEST.json`)
2. F5 → Extension Development Host abre esta pasta
3. Abrir cada `smoke-*.lsp` e conferir **Problems** (IDs `[SYN…]` / `[RUL…]` …)
4. Em `rule-retorna.lsp` / linhas RUL007·RUL014·FUN001·SYN004: **Quick Fix** (💡)

## Mapa rápido

| Arquivo | O que exercita |
|---------|----------------|
| `00-ok-clean.lsp` | Zero diagnósticos |
| `smoke-syn.lsp` | SYN001–009 (+ RUL008) |
| `smoke-rul.lsp` | RUL001–018 (menos RUL008) |
| `smoke-fun.lsp` | FUN001–006 |
| `smoke-fun-pdr003.lsp` | FUN007–009 (FUN009 com `scopedExternal` no MANIFEST) |
| `smoke-sem.lsp` | SEM001–003 |
| `smoke-sem004.lsp` | SEM004 |
| `smoke-sql.lsp` | SQL001–003 |
| `syntax-missing-semi.lsp` / `rule-retorna.lsp` | Legado EVAL |
| `format-if.lsp` | Format Document |

Expectativas canônicas: [`MANIFEST.json`](./MANIFEST.json) ↔ [`docs/product/regras-estaticas-lsp.md`](../../../docs/product/regras-estaticas-lsp.md).
