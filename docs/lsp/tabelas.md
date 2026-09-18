# Definição de Tabelas

Usado com o comando definir para declarar uma variável do tipo Tabela, com linhas e colunas. Cada coluna é um nome com um tipo específico de informação e as linhas são indexadas de 1 até N.

### Sintaxe

```lsp
Definir Tabela <nome da tabela>[<número de ocorrências>] = { <tipo da variável> <nome da variável>; ... }
```

### Exemplo

Declaração de uma tabela de 12 ocorrências tendo como nome Acumulador, e como variáveis numéricas Media_Mensal e Movimento ocorrendo 31 vezes uma para cada dia do mês e a alfanumérica Nome_Mes com 14 posições:

```lsp
Definir Tabela Acumulador[12] = {
  Numero Media_Mensal;
  Numero Movimento[31];
  Alfa Nome_Mes[14];
};
```

Os caracteres `{` e `}` podem ser substituídos por `Inicio` e `Fim` respectivamente, indicando que as variáveis Media_Mensal e Movimento pertencem ao bloco "Tabela" ao qual tem nome de Acumulador.

### Forma de Acesso à Variável

```lsp
x1 = Acumulador[1].Media_Mensal + 1;
x1 = Acumulador[x2+1].Movimento[x3+1];
Acumulador[1].Nome_Mes = "Janeiro";
Acumulador[2].Nome_Mes = "Fevereiro";
```

Neste exemplo, estamos acessando e manipulando os dados da tabela Acumulador. Cada linha da tabela é indexada de 1 até N, e cada coluna tem um nome específico com um tipo de dado definido.
