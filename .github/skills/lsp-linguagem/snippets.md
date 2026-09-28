# Snippets LSP (trechos prontos)

Usar como base ao gerar código; adaptar nomes e caminhos.

## Função com parâmetro Numero

```lsp
Funcao calcularTotal(Numero vnQtde);
Definir Numero vnTotal;
{
  vnTotal = vnQtde * 10;
  @ retorno via variável global ou parâmetro de saída, conforme o caso @
}
```

## Se / Senao

```lsp
Se ((vnCodigo > 0) e (vaStatus = "A")) {
  Mensagem(Retorna, "ok");
} Senao {
  Mensagem(Erro, "inválido");
  Cancel(1);
}
```

## Enquanto

```lsp
Enquanto (vnI < vnLimite) {
  vnI = vnI + 1;
}
```

## Cursor + SQL

```lsp
Definir Cursor Cur_Dados;
Cur_Dados.SQL = "SELECT COLUNA \
  FROM TABELA \
  WHERE ID = :vnId";
Cur_Dados.Abrir();
Enquanto (Cur_Dados.Achou) {
  vaValor = Cur_Dados.COLUNA;
  Cur_Dados.Proximo();
}
Cur_Dados.Fechar();
```

## Lista dinâmica

```lsp
Definir Lista vlItens;
vlItens.AdicionarCampo("CODIGO", 0);
vlItens.AdicionarCampo("NOME", "");
vlItens.Adicionar();
vlItens.CODIGO = 1;
vlItens.NOME = "Item";
```

## ExecSQLEx

```lsp
Definir Numero vnRetSql;
vnRetSql = ExecSQLEx("UPDATE TABELA SET COL = :vnVal WHERE ID = :vnId");
Se (vnRetSql <> 0) {
  Mensagem(Erro, "Falha no SQL");
  Cancel(1);
}
```

## HTTP / JSON (esqueleto)

```lsp
@ montar URL e corpo em variáveis Alfa antes de chamar a API @
@ nunca concatenar dentro do argumento da função HTTP @
```
