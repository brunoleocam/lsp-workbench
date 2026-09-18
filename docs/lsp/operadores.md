# Operadores

### **Operadores Lógicos**

Os operadores lógicos são utilizados para realizar comparações e operações lógicas. Os principais operadores lógicos são:

- `=`: Igual
- `<>`: Diferente
- `>`: Maior que
- `<`: Menor que
- `>=`: Maior ou igual a
- `<=`: Menor ou igual a
- `e`: E lógico
- `ou`: Ou lógico

### **Operadores Aritméticos**

Os operadores aritméticos são utilizados para realizar operações matemáticas. Os principais operadores aritméticos são:

- `+`: Adição
- `-`: Subtração
- `*`: Multiplicação
- `/`: Divisão
- `++`: Incremento de 1
- `--`: Decremento de 1

### **Operadores Extras**

Os operadores extras são utilizados para outras operações específicas. Alguns dos operadores extras são:

- `/*`: Início de comentário de múltiplas linhas
- `*/`: Fim de comentário de múltiplas linhas
- `@`: Comentário de uma linha

#### Observação sobre o operador %

O operador % (módulo) não existe na LSP. Para obter o resto da divisão, deve-se utilizar a função `RestoDivisao`.

Exemplo de uso da função RestoDivisao:

```lsp
Definir Numero vnDividendo;
Definir Numero vnDivisor;
Definir Numero vnResto;

vnDividendo = 1500;
vnDivisor = 400;

RestoDivisao(vnDividendo, vnDivisor, vnResto);
@ vnResto será 300 @
```

A função RestoDivisao retorna o resto da divisão de um número por outro. Os valores de entrada devem ser obrigatoriamente inteiros iguais ou maiores que 1. Por exemplo: ao informar 0.2, será considerado somente 0. Ao informar 1.1 será considerado 1.

Sintaxe: RestoDivisao(Dividendo, Divisor, Resto);

Parâmetros:

- Dividendo: Campo/Variável que será dividido
- Divisor: Campo/Variável pelo qual o Dividendo será dividido
- Resto: Variável que receberá o resto da divisão
