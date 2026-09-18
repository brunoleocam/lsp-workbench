# Retorno para Aplicação

Usado apenas no gerador de relatórios, para alterar o valor de um campo tipo Descrição ou Numérico. O valor passado para ValRet ou ValStr será impresso no lugar do valor original do campo. Essas palavras reservadas devem ser utilizadas em conjunto com o comando `Cancel(2);`.

### ValRet

A função `ValRet` é utilizada para retornar valores numéricos para a aplicação.

Exemplo de uso do `ValRet`:

```lsp
ValRet = 10;
Cancel(2);
```

### ValStr

A função `ValStr` é utilizada para retornar valores alfanuméricos para a aplicação.

Exemplo de uso do `ValStr`:

```lsp
ValStr = "Texto de Retorno";
Cancel(2);
```
