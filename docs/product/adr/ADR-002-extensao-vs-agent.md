# ADR-002 — Extensão vs Agent

## Status

Aceito

## Contexto

Autocomplete/hover/diagnostics em tempo real exigem extension host; geração e validação “inteligente” exigem Agent.

## Decisão

IDE features → extensão **LSP Workbench**. Raciocínio, geradores e checklists → **LSP Workbench Agent**. Demóbile só no plugin privado.

## Consequências

Dois artefatos públicos + um privado; config `lsp.*` compartilhada conceitualmente.
