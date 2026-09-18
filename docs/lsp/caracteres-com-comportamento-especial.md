# Caracteres com Comportamento Especial

Existem determinados caracteres que, quando inseridos em uma expressão literal nas regras, devem ser precedidos do caractere `\` (barra) para indicar que estes caracteres serão usados literalmente e não como caracteres especiais. Estes caracteres são: `"` (aspas) e `\` (barra).

Exemplo:

```lsp
EnviaEMail("Joao","joao@senior.com.br", "", "", "Teste","\"\\\\Servidor\\teste.txt\"", "");
```
