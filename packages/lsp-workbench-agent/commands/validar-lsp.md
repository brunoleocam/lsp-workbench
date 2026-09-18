Validar o código LSP em foco (arquivo, seleção ou pasta/contexto indicado) com a skill **@lsp-validar**.

## Objetivo

Validação em 3 camadas: **regras de ouro**, **sintaxe** e **semântica** (Cursor, Lista, SQL, tipos, escopo), com IDs de diagnóstico e correções sugeridas.

## Passos

1. Identificar escopo (seleção > arquivo > contexto multiarquivo se pedido).
2. Seguir checklists e IDs de **@lsp-validar** (SYN / RUL / FUN / SEM / SQL).
3. Consultar rules `lsp-nucleo`, `lsp-sintaxe`, `lsp-limites`, `lsp-listas`, `lsp-banco-http` quando necessário.
4. Entregar o relatório no formato da skill.
5. Se o usuário pedir para corrigir, aplicar as correções e revalidar os itens críticos.

## Foco mínimo

- Condições compostas parentizadas
- Parâmetros só `Numero`; retorno por parâmetro
- Conversões com variável intermediária
- `Cancel(1)` em vez de `Retorna`
- Concatenação só Alfa; nunca em argumentos
- Blocos `{ }` (não `Inicio`/`Fim`)
- `ExecSQLEx`: 0 = sucesso
