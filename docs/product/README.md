# Documentação de produto — LSP Workbench

| Pasta / arquivo | Conteúdo |
|-----------------|----------|
| [pdr/](pdr/) | Product Design Requirements (001–005) |
| [adr/](adr/) | Architecture Decision Records (000–006) |
| [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md) | Clean Architecture + roadmap visual |
| [tdd/](tdd/) | Casos TDD |
| [eval/](eval/) | Suites de avaliação |
| [matriz-competitiva-extensoes-lsp.md](matriz-competitiva-extensoes-lsp.md) | llutti × Killer × Workbench |
| [regras-estaticas-lsp.md](regras-estaticas-lsp.md) | IDs de diagnóstico |
| [LOCAL-TEST.md](LOCAL-TEST.md) | Checklist de teste local |
| [demobile-private.md](demobile-private.md) | Conteúdo Demóbile fora do git público |

## Roadmap (ADR-006)

| Fase | Doc | Estado |
|------|-----|--------|
| **1 — Paridade UX** | [PDR-004](pdr/PDR-004-paridade-ux.md) | **Concluída** (0.2.0) |
| **2 — Compiler** | [PDR-005](pdr/PDR-005-compiler-e-language-server.md) | Foundation `lsp-analyzer` |
| **3 — Language Server** | [PDR-005](pdr/PDR-005-compiler-e-language-server.md) | Foundation LS+Worker (default off) |

Arquitetura: [ADR-005](adr/ADR-005-clean-architecture-nucleo-puro.md) · [ARCHITECTURE.md](architecture/ARCHITECTURE.md)

TDD/Eval paridade: [TDD-paridade-ux.md](tdd/TDD-paridade-ux.md) · [EVAL-paridade-ux.md](eval/EVAL-paridade-ux.md)

## Status da implementação (2026-09-18)

| Artefato | Versão / estado |
|----------|-----------------|
| Extensão `packages/lsp-workbench` | **0.2.0** — PDR-004 Opção 1 (paridade UX) |
| Analyzer `packages/lsp-analyzer` | **0.1.0** — Opção 2 foundation (tokenize/analyze) |
| Language Server `packages/lsp-language-server` | **0.1.0** — Opção 3 foundation (LS+Worker; `lsp.server.enabled` default false) |
| Agent `packages/lsp-workbench-agent` | Commands/skills PDR-002 |
| Demóbile | Plugin local gitignored |
| Remoto público | https://github.com/brunoleocam/lsp-workbench |

| Fase | Doc | Estado |
|------|-----|--------|
| **1 — Paridade UX** | [PDR-004](pdr/PDR-004-paridade-ux.md) | **Concluída** (0.2.0) |
| **2 — Compiler** | [PDR-005](pdr/PDR-005-compiler-e-language-server.md) | Foundation `lsp-analyzer` |
| **3 — Language Server** | PDR-005 | Foundation LS+Worker (opt-in) |
