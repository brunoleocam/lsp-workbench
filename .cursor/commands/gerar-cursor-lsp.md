Gerar um **Cursor** LSP no ponto de inserção.

## Entrada (pedir se faltar)

1. Nome (ex.: `Pedidos`) → `Cur_Pedidos`
2. Modo: `simples` (só Definir + SQL + Abrir/Fechar) ou `completo` (+ loop `Achou`/`Proximo`)
3. SQL opcional (se vazio, placeholder `SELECT ...`)

## Saída

1. `Definir Cursor Cur_...;`
2. `.SQL = "..."` com quebras `\` ~coluna 80; placeholders `:vn...` se houver
3. `.Abrir();` … `.Fechar();` (no completo: `Enquanto (Cur.Achou) { ... Proximo(); }`)
4. Fechar cursor também em caminho de erro se gerar `Cancel(1)`
5. Regras de ouro: sem concat em argumentos; `{ }`

Skill: **@lsp-linguagem**. Inserir no editor.
