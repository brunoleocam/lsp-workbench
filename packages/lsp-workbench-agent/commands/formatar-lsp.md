Formatar o código LSP em foco (arquivo ou seleção) com a skill **@lsp-formatar**.

## Objetivo

Layout canônico via **analyzer** (preferencial) ou checklist da skill. **Não** alterar lógica nem converter `Inicio`/`Fim` (para isso use `/refatorar-lsp`).

## Passos

1. Na raiz do monorepo:
   ```powershell
   node scripts/format-lsp.mjs <arquivo.lsp> --write
   ```
   (compile `packages/lsp-analyzer` se necessário.)
2. Se o script não puder rodar, aplicar o contrato de **@lsp-formatar** manualmente.
3. Se houver `Inicio`/`Fim`, não converter — informar `/refatorar-lsp` ou:
   `node scripts/refactor-lsp.mjs <arquivo> --kind braces --write`
4. Resumir o que mudou.
