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
| **1 — Paridade UX** | [PDR-004](pdr/PDR-004-paridade-ux.md) | Em implementação (levas P0–P2) |
| **2 — Compiler** | [PDR-005](pdr/PDR-005-compiler-e-language-server.md) | Spec; após fase 1 |
| **3 — Language Server** | [PDR-005](pdr/PDR-005-compiler-e-language-server.md) | Spec; após fase 2 |

Arquitetura: [ADR-005](adr/ADR-005-clean-architecture-nucleo-puro.md) · [ARCHITECTURE.md](architecture/ARCHITECTURE.md)

TDD/Eval paridade: [TDD-paridade-ux.md](tdd/TDD-paridade-ux.md) · [EVAL-paridade-ux.md](eval/EVAL-paridade-ux.md)

## Status da implementação (2026-09-18)

| Artefato | Versão / estado |
|----------|-----------------|
| Extensão `packages/lsp-workbench` | **0.1.3** — PDR-001 + PDR-003; PDR-004 em levas |
| Agent `packages/lsp-workbench-agent` | Commands/skills PDR-002 |
| Demóbile | Plugin local gitignored |
| Remoto público | https://github.com/brunoleocam/lsp-workbench |
