---
name: lsp-formatar
description: Formata código LSP (indentação, espaços, quebras, SQL embutido). Altera só layout — não muda lógica. Use com /formatar-lsp ou ao pedir formatação.
---

# lsp-formatar

Aplica layout canônico ao arquivo/seleção. **Não** altera lógica, nomes nem estrutura de controle (isso é `@lsp-refatorar`).

## Contrato

- Formatar o documento (ou seleção) por completo
- Mudar apenas espaços, indentação e quebras de linha
- Preservar conteúdo de comentários
- Preservar strings (exceto SQL embutido elegível, se formatar SQL estiver ativo no pedido)
- Preservar EOL original (CRLF ou LF)
- Blocos sempre no estilo `{ }` (se houver `Inicio`/`Fim`, **não** converter aqui — indicar `/refatorar-lsp`)

## Regras canônicas

| Item | Padrão |
|------|--------|
| Indentação | 2 espaços (não tabs) |
| Após `Se` / `Enquanto` / `Para` / `Senao` | um espaço antes de `(` ou `{` |
| Operadores | espaços em torno de `=` `+` `<>` `>` `<` etc. |
| Vírgulas | sem espaço antes, um espaço depois |
| `{` | na mesma linha do `Se`/`Funcao`/`Senao` ou na linha seguinte consistente no arquivo; preferir mesma linha do cabeçalho |
| `}` | sozinho na linha, alinhado ao `Se`/`Funcao` |
| Linha em branco | no máximo uma entre blocos lógicos; sem linhas em branco no fim demais |
| Parâmetros | até **4** por linha; se mais, quebrar e indentar +2 |
| SQL / literais longos | quebra com `\` no fim da linha (~coluna 80); indentar continuação alinhada ao conteúdo |
| Terminador | `;` colado ao fim do comando (sem espaço antes) |

## SQL embutido (opcional)

Quando o usuário pedir formatação de SQL (ou o trecho for claramente `ExecSql` / `ExecSQLEx` / `Cursor.SQL` / `SQL_DefinirComando` com literal estático):

1. Identificar o literal (ou cadeia de literais com `\` / `+` só de strings)
2. Indentar cláusulas SQL (`SELECT`, `FROM`, `WHERE`, `AND`, `ORDER`)
3. Manter placeholders `:vnNome` intactos
4. Se o SQL for dinâmico/ambíguo → **no-op** nessa parte (não inventar)

Dialeto: genérico SQL; se o usuário citar Oracle/SQL Server, preferir keywords desse dialeto só no layout (não reescrever funções).

## O que NÃO fazer

- Trocar `Inicio`/`Fim` por `{ }` (usar `@lsp-refatorar`)
- Renomear variáveis
- Extrair funções
- “Corrigir” lógica ou tipos

## Saída

1. Aplicar a formatação no arquivo
2. Resumo curto: linhas tocadas / se SQL foi formatado / trechos ignorados (dinâmicos)
