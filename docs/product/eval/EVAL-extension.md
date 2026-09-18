# EVAL — Extensão LSP Workbench

## Fixtures (smoke real)

Pasta: `packages/lsp-workbench/fixtures/`  
Manifesto: [`MANIFEST.json`](../../../packages/lsp-workbench/fixtures/MANIFEST.json)  
Guia F5: [`fixtures/README.md`](../../../packages/lsp-workbench/fixtures/README.md)

| Fixture | Expectativa |
|---------|-------------|
| `00-ok-clean.lsp` | 0 diagnósticos |
| `smoke-syn.lsp` | SYN001–009 (+ RUL008) |
| `smoke-rul.lsp` | RUL001–018 (exceto RUL008) |
| `smoke-fun.lsp` | FUN001–005 |
| `smoke-sem.lsp` | SEM001–003 |
| `smoke-sem004.lsp` | SEM004 |
| `smoke-sql.lsp` | SQL001–003 |
| `syntax-missing-semi.lsp` | SYN001 |
| `rule-retorna.lsp` | RUL007 (+ Quick Fix) |
| `format-if.lsp` | Format Document (golden manual) |

## Runner

```powershell
cd packages\lsp-workbench
npm test
```

O suite `smoke fixtures (MANIFEST)` falha se algum `expectIds` não aparecer ou se faltar cobertura de `IMPLEMENTED_RULE_IDS`.

## Smoke manual (F5)

1. Run and Debug → **Run LSP Workbench Extension**
2. Abrir cada `smoke-*.lsp` na pasta fixtures
3. Conferir Problems com IDs `[…]`
4. Quick Fix em RUL007 / RUL014 / FUN001 / SYN004

## Paridade UX

Checklist e fixtures: [`EVAL-paridade-ux.md`](EVAL-paridade-ux.md) (PDR-004).
