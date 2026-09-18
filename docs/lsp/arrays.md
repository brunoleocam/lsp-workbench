# Definição de Arrays

Arrays são variáveis com tamanhos definidos que permitem armazenar múltiplos valores do mesmo tipo. Eles são úteis para armazenar coleções de dados de tamanho fixo.

### Declaração de Arrays

Para declarar um array, utilize o comando `Definir` seguido do tipo de dado, o nome da variável e o tamanho do array entre colchetes `[]`.

Exemplo de declaração de arrays:

```lsp
Definir Alfa vaNomes[10];
Definir Numero vnIdades[5];
Definir Data vdDatas[3];
```

### Atribuição de Valores

Os valores podem ser atribuídos aos elementos do array utilizando o índice do elemento entre colchetes `[]`.

Exemplo de atribuição de valores:

```lsp
vaNomes[0] = "João";
vaNomes[1] = "Maria";
vaNomes[2] = "Pedro";

vnIdades[0] = 25;
vnIdades[1] = 30;
vnIdades[2] = 35;

vdDatas[0] = "01/01/2020";
vdDatas[1] = "15/03/2021";
vdDatas[2] = "10/10/2022";
```

### Acesso aos Valores

Os valores dos elementos do array podem ser acessados utilizando o índice do elemento entre colchetes `[]`.

Exemplo de acesso aos valores:

```lsp
Mensagem(Retorna, vaNomes[0]); @ Exibe "João" @
Definir Alfa vaIdadeStr;
IntParaAlfa(vnIdades[1], vaIdadeStr);
Mensagem(Retorna, vaIdadeStr); @ Exibe 30 @
Mensagem(Retorna, vdDatas[2]); @ Exibe "10/10/2022" @
```

### Iteração sobre Arrays

Os arrays podem ser iterados utilizando estruturas de repetição como `Para` ou `Enquanto`.

Exemplo de iteração sobre arrays:

```lsp
Definir Alfa vaIdadeStr;

Para (i = 0; i < 3; i++) {
  Mensagem(Retorna, vaNomes[i]);
}

Definir Numero j;
j = 0;
Enquanto (j < 3) {
  IntParaAlfa(vnIdades[j], vaIdadeStr);
  Mensagem(Retorna, vaIdadeStr);
  j++;
}
```

### Exemplo Completo

Aqui está um exemplo completo de declaração, atribuição, acesso e iteração sobre arrays:

```lsp
Definir Alfa vaNomes[3];
Definir Numero vnIdades[3];
Definir Data vdDatas[3];
Definir Alfa vaIdadeStr;

vaNomes[0] = "João";
vaNomes[1] = "Maria";
vaNomes[2] = "Pedro";

vnIdades[0] = 25;
vnIdades[1] = 30;
vnIdades[2] = 35;

vdDatas[0] = "01/01/2020";
vdDatas[1] = "15/03/2021";
vdDatas[2] = "10/10/2022";

Para (i = 0; i < 3; i++) {
  Mensagem(Retorna, vaNomes[i]);
}

Definir Numero j;
j = 0;
Enquanto (j < 3) {
  IntParaAlfa(vnIdades[j], vaIdadeStr);
  Mensagem(Retorna, vaIdadeStr);
  j++;
}
```
