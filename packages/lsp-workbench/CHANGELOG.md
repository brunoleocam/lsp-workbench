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

- Package `@lsp-workbench/analyzer` **0.2.0** (Opção 2)
- Package `lsp-language-server` **0.1.0** (Opção 3 foundation; `lsp.server.enabled` default false)
- i18n removido (fora de escopo)

## Unreleased

### Documentação

- Status produto alinhado a 0.2.0 / analyzer 0.2.0 / LS 0.1.0
- PDR-006 (Agent ↔ analyzer) e PDR-007 (bridge Demóbile)
- Removida matriz competitiva / referências a extensões de terceiros

### Adicionado (PDR-006 / PDR-007)

- CLI `scripts/analyze-lsp.mjs` para Agent validar ANL*
- Setting `lsp.demobile.catalogPath` + completion de tabelas a partir do JSON local
- Fallback in-process se o Language Server falhar ao iniciar

### Adicionado (PDR-005 — Opção 2)

- Integração com `@lsp-workbench/analyzer` 0.2.0: merge de diagnósticos `ANL*` (AST) em `analyzeLsp`, sem duplicar `RUL007`/`SYN008`
- Analyzer: lexer com comentários `@…@` e blocos, parser/AST, `ANL010`/`ANL011`, `format`, `ignoreIds`

## 0.1.3 — 2026-09-18

### Adicionado (PDR-003)

- Índice de símbolos, escopos, contextos, FUN007–009, import QF
- Allowlist `files` união; ignoreIds por contexto; refresh peers

## 0.1.0 — baseline

- Language id `senior-lsp`, TextMate, snippets, format, diagnostics iniciais
