Formatar o código LSP em foco (arquivo ou seleção) com a skill **@lsp-formatar**.

## Objetivo

Layout canônico: indentação, espaçamentos, quebras de linha e SQL embutido elegível. **Não** alterar lógica nem converter `Inicio`/`Fim` (para isso use `/refatorar-lsp`).

## Passos

1. Ler o arquivo/seleção.
2. Aplicar o contrato de **@lsp-formatar**:
   - 2 espaços; sem tabs
   - espaços em operadores e após vírgulas
   - até 4 parâmetros por linha
   - literais longos / SQL com `\` ~coluna 80
   - preservar comentários, strings (salvo SQL elegível) e EOL
3. Se houver `Inicio`/`Fim`, não converter — informar que a conversão é `/refatorar-lsp`.
4. Gravar o arquivo e resumir o que mudou (e trechos SQL ignorados se dinâmicos).
