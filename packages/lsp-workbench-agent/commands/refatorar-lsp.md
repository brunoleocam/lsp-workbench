---
name: refatorar-lsp
description: Refatora LSP (braces, concat, estrutura) com relatório de riscos.
---

Refatorar o trecho ou arquivo LSP com **@lsp-refatorar**.

## Objetivo

Organização (funções, blocos, literais), comentários úteis e **relatório** com riscos de lógica.

## Passos

1. Entender a responsabilidade do trecho/arquivo.
2. Mecânicos (PDR-006):
   - `node scripts/refactor-lsp.mjs <arquivo> --kind braces --write`
   - `node scripts/refactor-lsp.mjs <arquivo> --kind concat --write`
3. Demais transformações de **@lsp-refatorar**.
4. Nomenclatura `va`/`vn`/`vd`/`vl`/`Cur_`; params só `Numero`; retorno por parâmetro; `Cancel(1)`.
5. Layout: `node scripts/format-lsp.mjs <arquivo> --write`.
6. Relatório da skill; ao final **`/compilar-lsp`**.
