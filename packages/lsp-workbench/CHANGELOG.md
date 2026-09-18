# Changelog — LSP Workbench (extensão)

## Unreleased (PDR-004 — Opção 1)

### Planejado

- P0: completion membros Cursor/Lista + campos; semantic tokens
- P1: snippets ~30; TextMate enriquecida; catálogos por sistema; format SQL opt-in
- P2: Outline; refactors wrap / toggle / concat

Ver [PDR-004](../../docs/product/pdr/PDR-004-paridade-ux.md).

## 0.1.3 — 2026-09-18

### Adicionado (PDR-003)

- Índice de símbolos do workspace (`Definir Funcao` + `Funcao` elegíveis, variáveis, LSPDoc)
- Escopos `lsp.symbols.scope`: `project` | `file` | `mixed`
- Contextos nomeados `lsp.contexts` (CRUD via comandos + status bar)
- Completion / hover / signature help / go-to-definition para funções custom e builtins SENIOR
- Diagnósticos FUN007 / FUN008 / FUN009 + Quick Fix de import Decl+Impl
- `lsp.contexts[].diagnostics.ignoreIds` unido ao ignore global
- Allowlist `files` como **união** com `filePattern` (não substitui o padrão)

### Corrigido

- Refresh de diagnósticos em todos os buffers LSP abertos quando um peer muda
- Documentação alinhada à versão e ao language id `senior-lsp`

### Documentação de produto

- Roadmap Opção 1→2→3 (ADR-006), Clean Architecture (ADR-005), PDR-004/005, TDD/Eval paridade

## 0.1.0 — baseline

- Language id `senior-lsp`, TextMate, snippets lista/cursor
- Format Document, diagnósticos estáticos, Quick Fixes iniciais
- Settings `lsp.format.*` / `lsp.diagnostics.ignoreIds`
