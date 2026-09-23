---
name: gerar-lista-lsp
description: Gera Lista dinâmica LSP (Definir + AdicionarCampo).
---

Gerar uma **Lista** dinâmica LSP no ponto de inserção (ou arquivo em foco).

## Entrada (pedir se faltar)

1. Nome da lista (ex.: `Itens`) → variável `vlItens`
2. Campos no formato `NOME:tipo` separados por vírgula  
   - tipo: `Numero` (default `0`), `Alfa` (default `""`), `Data`  
   - ex.: `CODIGO:Numero, NOME:Alfa`

## Saída

Usar **@lsp-linguagem**. Gerar:

1. `Definir Lista vl...;`
2. Um `AdicionarCampo` por campo
3. Sem concat em argumentos; `{ }` se houver bloco

Ao final sugerir **`@lsp-revisar`**.
