# Sintaxe e Estrutura

A linguagem LSP possui uma sintaxe própria, estruturada para facilitar a criação de regras de negócio dentro do ecossistema da Senior. Os comandos são escritos de forma sequencial e utilizam palavras-chave específicas para definir ações e estruturas de controle.

### Estrutura Básica

Cada comando na LSP deve ser finalizado com um ponto e vírgula (`;`). O código deve seguir uma ordem lógica para garantir a execução correta.

Exemplo de um código básico na LSP:

```lsp
Definir Numero vnX;
Definir Numero vnY;
Definir Numero vnResultado;
vnX = 10;
vnY = 20;
vnResultado = vnX + vnY;
Definir Alfa vaResultadoStr;
IntParaAlfa(vnResultado, vaResultadoStr);
Mensagem(Retorna, vaResultadoStr);
```

### Case Sensitivity

A LSP **não** diferencia maiúsculas de minúsculas na declaração de variáveis. Isso significa que os seguintes exemplos são equivalentes:

```lsp
Definir Alfa vaNomeVariavel;
Definir Alfa VANOMEVARIAVEL;
```

### Identação e Espaçamento

A identação padrão na LSP é de **2 espaços** ao invés de 4.

```lsp
Definir Numero vnX;
Definir Numero vnY;
Definir Numero vnSoma;
vnX = 5;
vnY = 15;

Se (vnX < vnY) { 
  vnSoma = vnX + vnY;
}
```

### Estruturas de Bloco

Regras:

- Se o bloco contiver apenas uma linha, não é necessário informar `{ }`, basta adicionar identado na linha de baixo.
- **Padrão deste pacote:** delimitar blocos com `{ }`. A linguagem também aceita `Inicio`/`Fim;`, mas **não gerar** essa forma aqui (nem `FimSe`/`FimEnquanto`).
- Todas as condições ou estruturas de repetições devem estar entre parênteses `()`.

Exemplo de estrutura de bloco com apenas uma linha:

```lsp
Se (<Condição>) 
  vn = 1; @ Estrutura do bloco em uma linha @
```

Exemplo de estrutura de bloco com `{ }` (preferido):

```lsp
Se (<Condição>) {
  @ Estrutura do bloco @
}

Funcao Somar(Numero pnA, Numero pnB, Numero End pnResultado); {
  pnResultado = pnA + pnB;
}
```

Exemplo **a evitar** neste pacote (`Inicio`/`Fim`):

```lsp
Se (<Condição>) 
Inicio
  @ Evitar neste padrão – usar { } @
Fim;
```

Exemplo de estrutura de bloco Incorreto:

```lsp
Se vnX < vnY {
  @ Falta parênteses na condição @
}
```
