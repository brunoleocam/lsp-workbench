# ADR-001 — Monorepo com artefatos públicos e dados locais gitignored

## Status

Aceito

## Contexto

A linguagem e o tooling IDE/Agent são públicos. Modelos de dados e regras de cliente não podem ir ao remoto público, mas precisam coexistir no workspace de desenvolvimento quando presentes localmente.

## Decisão

Um monorepo; artefatos públicos em `packages/lsp-workbench`, `packages/lsp-workbench-agent`, `packages/lsp-analyzer`, `packages/lsp-language-server`. Pastas de dados/regras locais (`docs/banco-senior/`, `docs/senior/` e demais entradas no `.gitignore`) ficam fora do remoto.

## Consequências

Clone público seguro; conteúdo sensível permanece só na máquina / canal interno; docs públicos não descrevem install de plugins privados.
