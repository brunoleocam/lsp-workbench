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

### Adicionado (PDR-010 — escopo implícito de relatório)

- Auto-escopo de símbolos sob `relatorio.json` + `Definicao`/`Secoes` (isola irmãos)
- Comandos: **Importar Contexto de…** / **Exportar Contexto para…** (pasta, arquivo ou `lsp.contexts`)
- Status bar / **Mostrar Escopo do Relatório**

### Adicionado (PDR-009 — catálogo base + overlay)

- Starter público: `catalog.example.json` + SQL R996/R998 (sem dump completo no git)
- `catalog.json` local gitignored; scripts `catalog-from-r996-tsv.mjs` / `export-banco-senior-base.mjs`
- `build-local-catalog.mjs` mescla base local + overlay `docs/banco-senior/`
- Resolução de catálogo: overlay `.generated` → base `.generated` → base `catalog.json`

### Adicionado (PDR-008 — projeto de relatório)

- Comandos: `lspWorkbench.gerarRelatorio`, `copiarRegraRelatorio`, `exportarRelatorioMultiTrecho`
- Diagnostics **GER001–GER004** (contexto Pré-Seleção / seções)
- Completion de colunas via `tabelaBase` + catálogo local (`E012FAM.`)
- Scaffold via comando / `/gerar-relatorio` (Agent); testes GER* em temp + smoke-ger*

### Corrigido

- SYN009: QF Ctrl+Espaço via comando dedicado (`applySyn009`) — evita sumir no suggest com literal longo; range do alerta no literal; CRLF no fixer
- SEM001 + SYN009 na mesma linha: ambos via `command` (mesmo mecanismo no suggest)

### Documentação

- Status produto alinhado a 0.2.0 / analyzer 0.3.0 / LS 0.2.0
- PDR-006 (Agent ↔ analyzer)
- Removida matriz competitiva / referências a extensões de terceiros

### Adicionado (analyzer 0.3 / LS 0.2)

- Lint unificado em `@lsp-workbench/analyzer` (`analyzeLsp`)
- LS Worker com paridade de diagnostics
- Debounce in-process; refactors Inicio/`\` só no range com efeito
- ANL004 (Inicio/Fim), ANL012 (Se sem parens)

### Adicionado (PDR-006 / catálogo local)

- CLI `scripts/analyze-lsp.mjs` para Agent validar ANL*
- Setting de path de catálogo JSON local + completion de tabelas (no-op se ausente)
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
