# Referência – padrões LSP (SQL, HTTP, erros)

## Cursores e SQL

Padrão típico:

```lsp
Definir Cursor Cur_Consulta;

Cur_Consulta.SQL "SELECT CAMPO1, CAMPO2 \
                  FROM TABELA \
                  WHERE CODIGO = :vnCodigo";

Cur_Consulta.AbrirCursor;
Enquanto (Cur_Consulta.Achou);
  vaCampo = Cur_Consulta.CAMPO1;
  Cur_Consulta.Proximo;
FimEnquanto;
Cur_Consulta.FecharCursor;
```

Placeholders LSP em SQL: `:vnCodigo`, `:vaNome` (conforme tipo).

### SQL Senior 2 (dialeto dentro da string)

Com Senior 2 ativo (padrão do cursor `SQL_Criar`), use funções do dialeto — não nativas do banco:

- Datas/números/texto: `STRTODATE`, `DATETOSTR`, `IFNULL`, `SUBSTR` (**índice inicia em 0**), `LENGTH`, `UPPER`/`LOWER`, `||` para concatenar colunas
- Não usar `TO_DATE` / `CONVERT` no comando
- Agregação (`SUM`/`COUNT`/…) **não** no `SELECT` do cursor em regra Senior 2
- JOIN/subquery → SQL nativo: `SQL_UsarAbrangencia(h, 0)` + `SQL_UsarSQLSenior2(h, 0)` antes de `DefinirComando`

Catálogo completo: `docs/lsp/sql.md` (seção SQL Senior 2). Oficial: [funções](https://documentacao.senior.com.br/tecnologia/5.10.3/linguagem-sql-senior-2/funcoes.htm).

### ExecSQLEx

```lsp
ExecSQLEx(vaComandoSQL, vnRetorno);
Se (vnRetorno = 0);
  @ sucesso @
Senao;
  @ erro @
  Cancel(1);
FimSe;
```

**Atenção:** `0` = sucesso, `1` = erro (invertido em relação a muitas APIs).

## HTTP / JSON (visão geral)

- Preferir variáveis intermediárias para URL, body e headers
- Não concatenar expressões dentro de parâmetros de funções HTTP
- Validar código HTTP e tratar corpo em Alfa antes de parse JSON
- Ver exemplos em `exemplos/ExemploHTTP_*.lsp`, `ManipulacaoJSON.lsp`, `ExemplosAutenticacaoHTTP.lsp`

## Erros comuns de LLM em LSP

1. Tratar LSP como Pascal/Java (atribuir retorno de função)
2. Concatenar número com string sem `IntParaAlfa`
3. Passar `Grid.Campo` direto para função
4. Usar `Retorna` / `Break` / `%`
5. Inventar nomes de tabela/coluna do ERP sem documentação do cliente
6. `FormatarData` com tipo Data em vez de Numero

## Boas práticas

- Separar preparação de dados (conversões/concat) da chamada de função
- Mensagens de erro claras + `Cancel(1)`
- Evitar `Mensagem` com JSON/XML enorme (usar trecho/resumo)
- Manter funções curtas e nomes ≤ 30 caracteres
