# Changelog — LSP Workbench (extensão)

## 0.2.0 — 2026-09-18

### Adicionado (PDR-004 — Opção 1)

- Completion de membros Cursor / Lista + campos `AdicionarCampo` (domínio puro)
- Semantic tokens (funções, variáveis, membros)
- Snippets ~30 (Definir, blocos, SQL API, helpers) com `{ }`
- TextMate enriquecida com builtins do catálogo SENIOR (~208)
- Catálogos stub HCM / ERP mesclados por `system` do contexto
- Format SQL embutido opt-in (`lsp.format.embeddedSql.*`)
- Outline (`DocumentSymbolProvider`)
- Refactors: wrap Se/Enquanto/Para/bloco, Inicio→braces, `\`→`+`
- Camadas `domain/` / `application/` / `adapters/vscode/` (ADR-005)

### Relacionado

- Package `@lsp-workbench/analyzer` (Opção 2 foundation)
- Stub `packages/lsp-language-server` (Opção 3)

## Unreleased

-

## 0.1.3 — 2026-09-18

### Adicionado (PDR-003)

- Índice de símbolos, escopos, contextos, FUN007–009, import QF
- Allowlist `files` união; ignoreIds por contexto; refresh peers

## 0.1.0 — baseline

- Language id `senior-lsp`, TextMate, snippets, format, diagnostics iniciais
