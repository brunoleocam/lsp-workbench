---
name: gerar-cursor-lsp
description: Gera Cursor LSP simples ou completo (+ SQL e loop).
---

Gerar um **Cursor** LSP no ponto de inserção.

## Entrada (pedir se faltar)

1. Nome (ex.: `Pedidos`) → `Cur_Pedidos`
2. Modo: `simples` ou `completo` (+ loop `Achou`/`Proximo`)
3. SQL opcional (se vazio, placeholder `SELECT ...`)

## Saída

1. `Definir Cursor Cur_...;`
2. `.SQL = "..."` com `\` ~coluna 80; placeholders `:vn...`
3. `.AbrirCursor();` … `.FecharCursor();` (completo: `Enquanto (Cur.Achou)`)
4. Fechar também em caminho de erro se gerar `Cancel(1)`
5. Tabelas/colunas: **`@lsp-banco`** se citadas

Ao final sugerir **`@lsp-revisar`**.
