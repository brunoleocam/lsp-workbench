# Changelog de plataforma — LSP Workbench

Histórico de implementação do monorepo (não confundir com o [CHANGELOG da extensão](../../packages/lsp-workbench/CHANGELOG.md)).

## 2026-09-21 — PDR-010 (escopo implícito por projeto de relatório)

| Artefato | Estado |
|----------|--------|
| Docs | [PDR-010](pdr/PDR-010-escopo-projeto-relatorio.md); ADR-007 / schema `contextoExtra` |
| Extensão | Overlay em `resolvePeerFiles`; comandos adicionar/mostrar escopo |
| Analyzer | `isReportProjectLayout`, `parseRelatorioMeta.contextoExtra` |

## 2026-09-21 — Licença MIT + política de reuso (llutti)

| Artefato | Estado |
|----------|--------|
| [`LICENSE`](../../LICENSE) | MIT na raiz (Copyright Bruno Campos) — packages já declaravam MIT |
| [`CREDITS.md`](../../CREDITS.md) | Atribuição a [llutti/vscode-language-lsp](https://github.com/llutti/vscode-language-lsp) |
| [PDR-001](pdr/PDR-001-plataforma-lsp.md) | Removido não-objetivo “não copiar terceiros”; permitido copiar/inspirar com créditos |

## 2026-09-21 — PDR-009 (catálogo base + overlay)

| Artefato | Estado |
|----------|--------|
| Docs | [PDR-009](pdr/PDR-009-catalogo-base-overlay.md); PDR-007 atualizado |
| Base / contrato | `docs/banco-senior-base/` (`catalog.example.json`; `catalog.json` **local**/gitignore) |
| Build | `scripts/build-local-catalog.mjs` mescla base + `docs/banco-senior/` |
| Extensão | Fallback de path: overlay `.generated` → base `.generated` |

## 2026-09-21 — PDR-008 / ADR-007 (projeto de relatório)

| Artefato | Estado |
|----------|--------|
| Docs | [PDR-008](pdr/PDR-008-projeto-relatorio.md), [ADR-007](adr/ADR-007-formato-projeto-relatorio.md), schemas em `docs/gerador-relatorios/schema/` |
| Scaffold / testes | comando Gerar Relatório; `report-scaffold.test.ts` + smoke-ger* |
| Extensão | `lspWorkbench.gerarRelatorio`, copiar regra, export multi-trecho, completion de colunas |
| Analyzer | Resolver de projeto + diagnostics **GER001–GER004** |
| Agent | `/gerar-relatorio` |

### Roadmap

| Fase | Estado |
|------|--------|
| P0 Docs + fixture | Feito |
| P1 Scaffold | Feito |
| P2 GER* | Feito |
| P3 Banco / colunas | Feito (quando catálogo local existir) |
| P4 Copiar / export | Feito |
| Visual / `.GER` | Fora de escopo |

## 2026-09-18 — analyzer 0.3.0 / LS 0.2.0 (paridade diagnostics)

| Artefato | Versão / estado |
|----------|-----------------|
| Extensão `packages/lsp-workbench` | **0.2.0** — lint via analyzer; debounce; refactors no range |
| Analyzer `packages/lsp-analyzer` | **0.3.0** — `analyzeLsp` + ANL004/012 + lint em `src/lint/` |
| Language Server `packages/lsp-language-server` | **0.2.0** — Worker usa `analyzeLsp` (paridade SYN/RUL/…) |
| Agent | PDR-006 concluído |
| Catálogo local | PDR-007 concluído |

### Roadmap

| Fase | Estado |
|------|--------|
| 1 UX IDE | Concluída |
| 2 Analyzer | **0.3.0** (lint unificado) |
| 3 Language Server | **0.2.0** (paridade diagnostics) |
| 4–5 Agent + catálogo | Concluídos |
| Próximo | **Pré-Marketplace** (VSIX / publicação) |

## 2026-09-18 — foundation 0.2.0 / LS 0.1.0 (histórico)

| Artefato | Versão / estado |
|----------|-----------------|
| Extensão `packages/lsp-workbench` | **0.2.0** — PDR-003 + PDR-004 (UX) + merge ANL* do analyzer |
| Analyzer `packages/lsp-analyzer` | **0.2.0** — lexer/parser/AST + ANL001/002/010/011 + `format` |
| Language Server `packages/lsp-language-server` | **0.1.0** — LS+Worker; `lsp.server.enabled` default **false** |
| Agent `packages/lsp-workbench-agent` | Skills/commands PDR-002; PDR-006 (Agent ↔ analyzer) **concluído** (P0–P3) |
| Remoto público | https://github.com/brunoleocam/lsp-workbench |


### Roadmap (motor de linguagem)

| Fase | Doc | Estado |
|------|-----|--------|
| **1 — UX IDE** | [PDR-004](pdr/PDR-004-paridade-ux.md) | **Concluída** (extensão 0.2.0) |
| **2 — Analyzer** | [PDR-005](pdr/PDR-005-compiler-e-language-server.md) | **Foundation** analyzer 0.2.0 |
| **3 — Language Server** | [PDR-005](pdr/PDR-005-compiler-e-language-server.md) | **Foundation** LS+Worker (opt-in) |
| **4 — Agent ↔ analyzer** | [PDR-006](pdr/PDR-006-agent-analyzer.md) | **Concluído** (P0–P3) |

Próximo foco público: Marketplace / catálogos multi-sistema (PDR-001 / backlog UX).  
Smoke F5 da suíte `fixtures/smoke-*.lsp` (QF Ctrl+Espaço / Ctrl+.) validado em 2026-09-21.

### Extensão 0.2.0 (resumo)

- Membros Cursor/Lista, semantic tokens, snippets, TextMate + builtins
- Outline, refactors, format SQL embutido opt-in
- Camadas domain / application / adapters (ADR-005)
- Completion opcional de tabelas a partir de JSON local (no-op se o arquivo estiver ausente)
- Fallback in-process se o Language Server falhar ao iniciar

### Extensão 0.1.x

- 0.1.3 — símbolos, contextos, FUN007–009 (PDR-003)
- 0.1.0 — language id `senior-lsp`, format e diagnostics iniciais
