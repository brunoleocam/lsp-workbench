# Comentários

Comentários são utilizados para explicar o código e são ignorados pelo compilador. Existem dois tipos de comentários na LSP:

- Comentário de uma linha: Utiliza o símbolo `@` (até o fim da linha, ou até o `@` de fechamento **na mesma linha**).
- Comentário de múltiplas linhas: Inicia com `/*` e termina com `*/`.

**Não** use `@` para abrir em uma linha e fechar em outra — isso não é comentário de bloco. O Workbench alerta **SYN011** e oferece Quick Fix para `/* … */`.

Exemplo de comentário de uma linha:

```lsp
@ Este é um comentário de uma linha
Definir Numero vnX;
```

Exemplo com fechamento na mesma linha:

```lsp
Definir Numero vnX; @ contador @
```

Exemplo de comentário de múltiplas linhas:

```lsp
/*
  Este é um comentário
  de múltiplas linhas
*/
Definir Numero vnX;
```
