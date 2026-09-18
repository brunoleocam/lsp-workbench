Refatorar o trecho ou arquivo LSP com a skill **@lsp-refatorar**, mantendo as rules do plugin (`lsp-nucleo` e correlatas).

## Objetivo

Analisar o código, melhorar organização (funções, blocos, literais), gerar comentários úteis e entregar **relatório final** com riscos de lógica.

## Passos

1. Entender a responsabilidade do trecho/arquivo.
2. Aplicar transformações de **@lsp-refatorar** (extrair funções, envolver `Se`/`Enquanto`/`Para`, `Inicio`/`Fim` → `{ }`, `\` → `+` quando fizer sentido).
3. Nomenclatura `va`/`vn`/`vd`/`vl`/`Cur_`; params só `Numero`; retorno por parâmetro; sem concat em argumentos; `Cancel(1)` sem `Retorna`.
4. Comentários `@ ... @` só onde esclarecem intenção.
5. Opcional: alinhar layout com **@lsp-formatar**.
6. Entregar o relatório obrigatório da skill (feitos / não feitos / riscos de lógica).
7. Recomendar `/validar-lsp` ao final.
