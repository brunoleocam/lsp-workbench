# PDR-005 — Analyzer e Language Server (Opções 2 e 3)

| Campo | Valor |
|-------|-------|
| Status | Aceito — Opção 2 **0.3.0** + Opção 3 **0.2.0** (paridade diagnostics) |
| Data | 2026-09-18 |
| Roadmap | [ADR-006](../adr/ADR-006-roadmap-opcoes-1-2-3.md) |
| Pré-requisito | Opção 1 (PDR-004) concluída |

## Problema

Heurísticas e AST precisam ser um núcleo reutilizável; o Language Server deve emitir a **mesma** suite de diagnostics da extensão.

## Opção 2 — Analyzer (`packages/lsp-analyzer` 0.3.0)

### Entregue

- Lexer / parser / AST / `format`
- Semantic ANL*: **001, 002, 004, 010, 011, 012**
- **Lint completo** em `src/lint/` (`analyzeLsp`) — SYN/RUL/FUN/SEM/SQL/DEM + merge ANL*
- Extensão reexporta o lint do analyzer (fonte única)

### Aceite Opção 2

- [x] Package compilável + testes
- [x] Extensão consome analyzer / `analyzeLsp` sem regressão
- [x] Regras heurísticas no package analyzer (migração da pasta lint)
- [ ] Tipagem fina / unused (backlog futuro)

## Opção 3 — Language Server (`0.2.0`)

### Entregue

- Worker + sync fallback chamam **`analyzeLsp`** (não só ANL*)
- Debounce 200ms + checagem de `version`
- Sem completion stub (fica na extensão)
- Ranges com coluna quando o hit traz `startCol`/`endCol`
- Extensão: fallback se LS falhar ao subir; debounce in-process

### Aceite Opção 3

- [x] Paridade de **diagnostics** com a extensão (mesma pipeline)
- [ ] Paridade UX completa via LS (format/completion no server) — fora desta leva
- [ ] Métrica formal de não-bloqueio em arquivo grande
- [ ] Bundle `server.js` no VSIX (pré-Marketplace)

## Ordem

```text
PDR-004 → PDR-005 Opção 2 → PDR-005 Opção 3 → PDR-006 → PDR-007 → higiene → teste local → Marketplace
```
