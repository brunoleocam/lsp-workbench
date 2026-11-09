---
name: "refatorar-lsp"
description: "Refatora LSP (braces, concat, estrutura) com relatório de riscos."
agent: agent
---

Refatorar o trecho ou arquivo LSP com **@lsp-refatorar**.

## Objetivo

Organização (funções, blocos, literais), comentários úteis e **relatório** com riscos de lógica.

## Passos

1. Entender a responsabilidade do trecho/arquivo.
2. Aplicar as transformações de **@lsp-refatorar** (`Inicio`/`Fim` → `{ }` opcional de estilo, `\` → `+`, extrair função, envolver bloco).
3. Nomenclatura `va`/`vn`/`vd`/`vl`/`Cur_`; params só `Numero`; retorno por parâmetro; `Cancel(1)`.
4. Layout: **Format Document** da extensão.
5. Relatório da skill; ao final **`/compilar-lsp`**.
