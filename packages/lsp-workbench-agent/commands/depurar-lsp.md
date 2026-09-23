---
name: depurar-lsp
description: Depura fluxo LSP — resumo, ordem de execução, funções, cursores/SQL e resultado final.
---

Depurar o código ou contexto LSP em foco com **@lsp-depurar**.

## Objetivo

Explicar a execução (não só a sintaxe): o que faz, em que ordem, o que cada função/cursor faz e o resultado final esperado.

## Passos

1. Definir escopo (seleção > arquivo > pasta / relatório / `lsp.contexts` — `@lsp-contexto` se ambíguo).
2. Seguir o fluxo e o formato de relatório de **@lsp-depurar**.
3. Para SQL/Cursor: descrever busca, binds, retorno e uso; usar **@lsp-banco** se houver catálogo.
4. Não inventar dados de negócio; se faltar arquivo do escopo, declarar lacuna.
5. Só alterar código se o usuário pedir correção; nesse caso fechar com **`/compilar-lsp`**.

## Não fazer

- Tratar como review de PR / push de `.lsp` para GitHub (código LSP de cliente não vai ao remoto público).
- Substituir `/compilar-lsp` (diagnósticos estáticos).
