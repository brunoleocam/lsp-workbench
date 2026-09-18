Validar o código LSP em foco (arquivo, seleção ou pasta/contexto indicado) com a skill **@lsp-validar**.

## Objetivo

Validação alinhada à IDE: **analyzer (ANL*)** + checklists **SYN/RUL/FUN/SEM/SQL**.

## Passos

1. Identificar escopo (seleção > arquivo > contexto multiarquivo se pedido).
2. Compilar o analyzer se preciso e rodar:
   `node scripts/analyze-lsp.mjs <arquivo-ou-pasta>`
   Reportar todos os `[ANL…]`.
3. Seguir checklists de **@lsp-validar** (SYN / RUL / FUN / SEM / SQL / ANL).
4. Consultar rules `lsp-nucleo`, `lsp-sintaxe`, `lsp-limites`, `lsp-listas`, `lsp-banco-http` quando necessário.
5. Entregar o relatório no formato da skill.
6. Se o usuário pedir para corrigir, aplicar as correções e revalidar (analyzer + checklist).

## Foco mínimo

- Condições compostas parentizadas
- Parâmetros só `Numero`; retorno por parâmetro
- Conversões com variável intermediária
- `Cancel(1)` em vez de `Retorna`
- Concatenação só Alfa; nunca em argumentos
- Blocos `{ }` (não `Inicio`/`Fim`)
- `ExecSQLEx`: 0 = sucesso
- Diagnostics ANL* do analyzer iguais aos da extensão
