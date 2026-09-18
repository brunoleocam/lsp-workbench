# Documentação de produto — LSP Workbench

| Pasta / arquivo | Conteúdo |
|-----------------|----------|
| [pdr/](pdr/) | Product Design Requirements (001–007) |
| [adr/](adr/) | Architecture Decision Records (000–006) |
| [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md) | Clean Architecture + roadmap |
| [tdd/](tdd/) | Casos TDD |
| [eval/](eval/) | Suites de avaliação |
| [regras-estaticas-lsp.md](regras-estaticas-lsp.md) | IDs de diagnóstico (SYN/RUL/FUN/SEM/SQL/ANL) |
| [LOCAL-TEST.md](LOCAL-TEST.md) | Checklist de teste local |
| [demobile-private.md](demobile-private.md) | Conteúdo Demóbile fora do git público |

## Status da implementação (2026-09-18)

| Artefato | Versão / estado |
|----------|-----------------|
| Extensão `packages/lsp-workbench` | **0.2.0** — PDR-003 + PDR-004 (UX) + merge ANL* do analyzer |
| Analyzer `packages/lsp-analyzer` | **0.2.0** — lexer/parser/AST + ANL001/002/010/011 + `format` |
| Language Server `packages/lsp-language-server` | **0.1.0** — LS+Worker; `lsp.server.enabled` default **false** |
| Agent `packages/lsp-workbench-agent` | Skills/commands PDR-002 (próximo: PDR-006) |
| Demóbile | Plugin local gitignored (próximo: PDR-007) |
| Remoto público | https://github.com/brunoleocam/lsp-workbench |

## Roadmap

| Fase | Doc | Estado |
|------|-----|--------|
| **1 — UX IDE** | [PDR-004](pdr/PDR-004-paridade-ux.md) | **Concluída** (extensão 0.2.0) |
| **2 — Analyzer** | [PDR-005](pdr/PDR-005-compiler-e-language-server.md) | **Foundation** analyzer 0.2.0 |
| **3 — Language Server** | [PDR-005](pdr/PDR-005-compiler-e-language-server.md) | **Foundation** LS+Worker (opt-in) |
| **4 — Agent ↔ analyzer** | [PDR-006](pdr/PDR-006-agent-analyzer.md) | P0: CLI + skills |
| **5 — Bridge Demóbile → IDE** | [PDR-007](pdr/PDR-007-demobile-catalog-bridge.md) | P0/P1 parcial (commands + catálogo + completion) |

Arquitetura: [ADR-005](adr/ADR-005-clean-architecture-nucleo-puro.md) · [ADR-006](adr/ADR-006-roadmap-opcoes-1-2-3.md) · [ARCHITECTURE.md](architecture/ARCHITECTURE.md)

TDD/Eval UX: [TDD-paridade-ux.md](tdd/TDD-paridade-ux.md) · [EVAL-paridade-ux.md](eval/EVAL-paridade-ux.md)
