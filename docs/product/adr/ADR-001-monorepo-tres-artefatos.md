# ADR-001 — Monorepo com três artefatos + gitignore Demóbile

## Status

Aceito

## Contexto

Linguagem pública e dados Demóbile precisam conviver no mesmo workspace de desenvolvimento, sem publicar schema/regras internas.

## Decisão

Um monorepo; pastas `docs/banco-senior/`, `docs/senior/` e `packages/lsp-workbench-demobile/` no `.gitignore`.

## Consequências

Clone público seguro; máquina Demóbile mantém conteúdo local; install via script de junction.
