---
name: formatar-lsp
description: Formata layout LSP canônico (sem mudar lógica).
---

Formatar o código LSP em foco com **@lsp-formatar**.

## Objetivo

Layout via **analyzer** (preferencial) ou checklist. **Não** alterar lógica nem converter `Inicio`/`Fim` (use `/refatorar-lsp`).

## Passos

1. Na raiz do monorepo:
   ```powershell
   node scripts/format-lsp.mjs <arquivo.lsp> --write
   ```
2. Se não puder rodar o script, aplicar **@lsp-formatar** manualmente.
3. Se houver `Inicio`/`Fim`, informar `/refatorar-lsp` ou:
   `node scripts/refactor-lsp.mjs <arquivo> --kind braces --write`
4. Resumir o que mudou.
