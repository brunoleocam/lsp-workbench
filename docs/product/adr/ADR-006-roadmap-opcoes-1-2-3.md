# ADR-006 — Roadmap Opções 1 → 2 → 3

## Status

Aceito

## Contexto

Paridade com llutti/Killer exige features de UX e, eventualmente, compiler + LS. Implementar tudo de uma vez atrasa valor Demóbile.

## Decisão

Ordem **rígida**:

| Fase | Nome | Entrega |
|------|------|---------|
| 1 | Paridade UX | PDR-004 — in-process, núcleo puro |
| 2 | Compiler | PDR-005 — `packages/lsp-analyzer` |
| 3 | Language Server | PDR-005 — client + server + Worker (sem i18n) |

Não iniciar a fase N+1 antes do aceite da fase N.

### Por que a Opção 3 não descarta 1 e 2

Snippets, grammar, catálogos e use cases puros são reutilizados. Só o “cola” VS Code vira thin client. O analyzer (Opção 2) é o coração do Worker.

## Consequências

- Documentação e CHANGELOG por leva da Opção 1.
- Branches `feat/p0-*`, `feat/p1-*`, `feat/p2-*` a partir de `main`.
- Marketplace permanece fora até decisão explícita (PDR-001).

## Relacionados

- PDR-004, PDR-005, ADR-005
- [matriz-competitiva-extensoes-lsp.md](../matriz-competitiva-extensoes-lsp.md)
