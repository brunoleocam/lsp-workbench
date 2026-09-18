Gerar uma **Lista** dinâmica LSP no ponto de inserção (ou arquivo em foco).

## Entrada (pedir se faltar)

1. Nome da lista (ex.: `Itens`) → variável `vlItens`
2. Campos no formato `NOME:tipo` separados por vírgula  
   - tipo: `Numero` (default `0`), `Alfa` (default `""`), `Data` (default conforme padrão do projeto)  
   - ex.: `CODIGO:Numero, NOME:Alfa`

## Saída

Usar skill **@lsp-linguagem** (snippets/padrões). Gerar apenas o trecho:

1. `Definir Lista vl...;`
2. Um `AdicionarCampo` por campo
3. `Adicionar();` e atribuições de exemplo opcionais
4. Blocos `{ }` se houver fluxo; **sem** `Retorna` / `Inicio`/`Fim`

Inserir no editor. Resumo curto do que foi gerado.
