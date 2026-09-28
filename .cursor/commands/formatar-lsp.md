---
name: formatar-lsp
description: Formata layout LSP canônico (sem mudar lógica).
---

Formatar o código LSP em foco com **@lsp-formatar**.

## Objetivo

Layout via **analyzer** (preferencial) ou checklist. **Não** alterar lógica nem converter `Inicio`/`Fim` (use `/refatorar-lsp`).

## Passos

1. Use **Format Document** da extensão LSP Workbench.
2. Se houver `Inicio`/`Fim`, use `/refatorar-lsp`.
3. Resumir o que mudou.
