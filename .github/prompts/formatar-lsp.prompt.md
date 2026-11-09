---
name: "formatar-lsp"
description: "Formata layout LSP canônico (sem mudar lógica)."
agent: agent
---

Formatar o código LSP em foco com **@lsp-formatar**.

## Objetivo

Layout via **analyzer** (preferencial) ou checklist. **Não** alterar lógica nem converter `Inicio`/`Fim` (use `/refatorar-lsp`).

## Passos

1. Use **Format Document** da extensão LSP Workbench.
2. `Inicio`/`Fim` são válidos; para convertê-los em `{ }` (opcional), use `/refatorar-lsp`.
3. Resumir o que mudou.
