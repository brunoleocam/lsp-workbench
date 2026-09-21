# ADR-006 — Roadmap Opções 1 → 2 → 3

## Status

Aceito (fases 1–3 foundation + PDR-006 + PDR-007 concluídos)

## Contexto

A plataforma precisa de UX IDE rica, núcleo de análise reutilizável e Language Server opcional. Entregar tudo de uma vez atrasa o valor da extensão e do Agent.

## Decisão

Ordem **rígida** para o motor de linguagem:

| Fase | Nome | Entrega | Estado |
|------|------|---------|--------|
| 1 | UX IDE | PDR-004 — in-process, núcleo puro | **Concluída** (0.2.0) |
| 2 | Analyzer | PDR-005 — `packages/lsp-analyzer` | **Foundation** (0.2.0) |
| 3 | Language Server | PDR-005 — client + server + Worker (sem i18n) | **Foundation** (0.1.0, default off) |

Não iniciar a fase N+1 do motor antes do aceite da foundation da fase N.

Frentes após o motor:

| Doc | Foco | Estado |
|-----|------|--------|
| [PDR-006](../pdr/PDR-006-agent-analyzer.md) | Agent consome o mesmo analyzer | **Concluído** |
| [PDR-007](../pdr/PDR-007-catalogo-local-bridge.md) | Catálogo local → IDE (JSON + DEM001) | **Concluído** |

Próximo público: catálogos multi-sistema / Marketplace (PDR-001 / backlog UX). Smoke F5 da suíte de fixtures validado (2026-09-21).

### Por que a Opção 3 não descarta 1 e 2

Snippets, grammar, catálogos e use cases puros são reutilizados. Só o “cola” VS Code vira thin client. O analyzer (Opção 2) é o coração do Worker e do Agent (PDR-006).

## Consequências

- Documentação e CHANGELOG por leva.
- Marketplace permanece fora até decisão explícita (PDR-001).
- IDs canônicos: SYN/RUL/FUN/SEM/SQL + ANL* (analyzer) + DEM* (catálogo local).

## Relacionados

- PDR-004, PDR-005, PDR-006, PDR-007, ADR-005
