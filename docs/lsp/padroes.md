# Padrões e Boas Práticas

### Boas Práticas e Regras Gerais

✅ **Sempre termine uma instrução de código com `;`.**
✅ **Evite duplicação de código, reutilize funções sempre que possível.**
✅ **Mantenha o código modularizado e organizado em funções.**
✅ **Utilize nomes descritivos para funções.**
✅ **Teste o código extensivamente para garantir que ele funcione corretamente em todas as situações esperadas.**

### Declaração de Variáveis

✅ **Declare as variáveis no início do código ou da função.**
✅ **Inicialize as variáveis sempre que possível no início do código ou da função.**
✅ **Em relatórios, declare e inicialize variáveis nos eventos de Inicialização ou Pré-Seleção.**

### Padrão de Nomenclatura de Variáveis

✅ **Utilize nomes descritivos para as variáveis.**
✅ **Utilize o padrão CamelCase nos nomes das variáveis.**
✅ **Utilize o padrão "v + inicial do tipo de dado" antes do nome da variável:**

- `va` para variáveis do tipo `Alfa`
- `vn` para variáveis do tipo `Numero`
- `vd` para variáveis do tipo `Data`
❌ **Evite usar nomes de variáveis que possam ser confundidos com palavras reservadas ou nomes de funções.**

### Identação e Espaçamento

✅ **Utilize 2 espaços para identação.**
✅ **Mantenha o código organizado e legível, evitando linhas de código muito longas.**

### Estruturas de Bloco

✅ **Utilize `{` para abrir um bloco e `}` para fechar um bloco, delimitando assim os blocos de código.**
✅ **Se o bloco contiver apenas uma linha, não é necessário informar `{ }`, basta adicionar o código identado na linha de baixo.**

Exemplo de estrutura de bloco com apenas uma linha:

```lsp
Se (<Condição>) 
  vn = 1; @ Estrutura do bloco em uma linha @
```

Exemplo de estrutura de bloco com `{ }`:

```lsp
Se (<Condição>) {
  @ Estrutura do bloco @
}
```

### Comentários

✅ **Utilize comentários para explicar o código e facilitar a manutenção.**
✅ **Utilize `@` para comentários de uma linha e `/* */` para comentários de múltiplas linhas.**

Exemplo de comentário de uma linha:

```lsp
@ Este é um comentário de uma linha @
Definir Numero vnX;
```

Exemplo de comentário de múltiplas linhas:

```lsp
/*
  Este é um comentário
  de múltiplas linhas
*/
Definir Numero vnX;
```
