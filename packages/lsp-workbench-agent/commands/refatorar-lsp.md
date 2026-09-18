Refatorar o trecho ou arquivo LSP com a skill **@lsp-refatorar**, mantendo as rules do plugin (`lsp-nucleo` e correlatas).

## Objetivo

Analisar o código, melhorar organização (funções, blocos, literais), gerar comentários úteis e entregar **relatório final** com riscos de lógica.

## Passos

1. Entender a responsabilidade do trecho/arquivo.
2. Mecânicos primeiro (PDR-006):
   - `node scripts/refactor-lsp.mjs <arquivo> --kind braces --write`
   - `node scripts/refactor-lsp.mjs <arquivo> --kind concat --write`
3. Demais transformações de **@lsp-refatorar** (extrair funções, envolver `Se`/`Enquanto`/`Para`).
4. Nomenclatura `va`/`vn`/`vd`/`vl`/`Cur_`; params só `Numero`; retorno por parâmetro; sem concat em argumentos; `Cancel(1)` sem `Retorna`.
5. Comentários `@ ... @` só onde esclarecem intenção.
6. Layout: `node scripts/format-lsp.mjs <arquivo> --write`.
7. Entregar o relatório obrigatório da skill; recomendar `/validar-lsp` ao final.
