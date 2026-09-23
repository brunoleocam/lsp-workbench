Pré-compilar / validar o código LSP em foco (arquivo, seleção ou pasta/contexto) com a skill **@lsp-compilar**.

## Objetivo

Mesmos diagnósticos da IDE: **analyzer (ANL*)** + checklists **SYN/RUL/FUN/SEM/SQL** (+ **DEM**/**GER** quando aplicável).

## Passos

1. Identificar escopo (seleção > arquivo > pasta / projeto de relatório se pedido).
2. Compilar o analyzer se preciso e rodar:
   `node scripts/analyze-lsp.mjs <arquivo-ou-pasta>`
   Reportar todos os `[ANL…]`.
3. Seguir checklists de **@lsp-compilar**.
4. Consultar rules `lsp-nucleo`, `lsp-sintaxe`, `lsp-limites`, `lsp-listas`, `lsp-banco-http` quando necessário.
5. Entregar o relatório no formato da skill.
6. Se o usuário pedir correção, aplicar e reexecutar analyzer + checklist.

## Foco mínimo

- Condições compostas parentizadas
- Parâmetros só `Numero`; retorno por parâmetro
- Conversões com variável intermediária
- `Cancel(1)` em vez de `Retorna`
- Concatenação só Alfa; nunca em argumentos
- Blocos `{ }` (não `Inicio`/`Fim`)
- `ExecSQLEx`: 0 = sucesso
- Diagnostics ANL* iguais aos da extensão
- Em relatório: GER*; com catálogo: DEM001
