# ADR-002 — Extensão vs Agent

## Status

Aceito

## Contexto

Autocomplete/hover/diagnostics em tempo real exigem extension host; geração e validação “inteligente” exigem Agent.

## Decisão

IDE features → extensão **LSP Workbench**. Raciocínio, geradores e checklists → **LSP Workbench Agent**.

## Consequências

Dois artefatos públicos; config `lsp.*` compartilhada conceitualmente.
