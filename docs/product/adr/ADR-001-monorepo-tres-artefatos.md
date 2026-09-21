# ADR-001 — Monorepo com artefatos públicos e dados locais gitignored

## Status

Aceito

## Contexto

A linguagem e o tooling IDE/Agent são públicos. Modelos de dados e regras de cliente não podem ir ao remoto público, mas precisam coexistir no workspace de desenvolvimento quando presentes localmente.

## Decisão

Um monorepo; artefatos públicos em `packages/lsp-workbench`, `packages/lsp-workbench-agent`, `packages/lsp-analyzer`, `packages/lsp-language-server`.  

- **Público:** `docs/banco-senior-base/` — exemplo de contrato JSON + SQL/scripts para o usuário gerar o catálogo **local** ([PDR-009](../pdr/PDR-009-catalogo-base-overlay.md)). O `catalog.json` completo fica **gitignore**.
- **Gitignore:** `docs/banco-senior/` (overlay de cliente), `docs/banco-senior-base/catalog.json`, `docs/senior/` e demais entradas no `.gitignore`.

## Consequências

Clone público seguro; dicionário Senior (padrão ou custom) só na máquina do cliente; completion de tabelas depende de cada um extrair R996/R998.
