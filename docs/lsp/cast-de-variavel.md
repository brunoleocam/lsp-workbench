# Cast de Variável

As funções de cast de variável na LSP permitem converter valores entre diferentes tipos de dados.

### AlfaParaData

Converte um valor alfanumérico para o tipo Data.

**Sintaxe:**

```lsp
AlfaParaData(<texto>, <data>);
```

**Exemplo:**

```lsp
Definir Alfa vaTexto;
Definir Data vdData;

vaTexto = "01/01/2020";
AlfaParaData(vaTexto, vdData); @ vdData será 01/01/2020 @
```

**⚠️ Importante:** Para grids/tabelas, use variável intermediária como mostrado em `AlfaParaDecimal`.

### AlfaParaDecimal

Converte um valor alfanumérico para o tipo Decimal.

**Sintaxe:**

```lsp
AlfaParaDecimal(<texto>, <decimal>);
```

**Parâmetros:**

- `texto`: Valor alfanumérico a ser convertido (formato brasileiro com vírgula)
- `decimal`: Variável que receberá o valor convertido

**Exemplo:**

```lsp
Definir Alfa vaTexto;
Definir Numero vnDecimal;

vaTexto = "123,45";  @ Formato brasileiro com vírgula @
AlfaParaDecimal(vaTexto, vnDecimal); @ vnDecimal será 123.45 @
```

**⚠️ Importante para Grids/Tabelas:**

```lsp
@ INCORRETO - Não funciona diretamente em campos de grid @
AlfaParaDecimal(vaTexto, MinhaGrid.CampoDecimal);

@  CORRETO - Use variável intermediária @
Definir Numero vnValor;
AlfaParaDecimal(vaTexto, vnValor);
MinhaGrid.CampoDecimal = vnValor;
```

### AlfaParaInt

Converte um valor alfanumérico para o tipo Inteiro.

**Sintaxe:**

```lsp
AlfaParaInt(<texto>, <inteiro>);
```

**Exemplo:**

```lsp
Definir Alfa vaTexto;
Definir Numero vnInteiro;

vaTexto = "123";
AlfaParaInt(vaTexto, vnInteiro); @ vnInteiro será 123 @
```

**⚠️ Importante:** Para grids/tabelas, use variável intermediária como mostrado em `AlfaParaDecimal`.

### IntParaAlfa

Converte um valor inteiro para o tipo Alfanumérico.

**Sintaxe:**

```lsp
IntParaAlfa(<inteiro>, <texto>);
```

**Exemplo:**

```lsp
Definir Numero vnInteiro;
Definir Alfa vaTexto;

vnInteiro = 123;
IntParaAlfa(vnInteiro, vaTexto); @ vaTexto será "123" @
```

### DecimalParaAlfa

Converte um valor numérico (`Numero`) para alfanumérico **preservando a parte decimal** na string resultante (formato exibido conforme o ambiente).

**Sintaxe:**

```lsp
DecimalParaAlfa(<numero>, <texto>);
```

**Parâmetros:**

- `numero`: Valor do tipo `Numero` (inteiro ou com decimais)
- `texto`: Variável `Alfa` que receberá a representação textual

**Exemplo:**

```lsp
Definir Numero vnValor;
Definir Alfa vaTexto;

vnValor = 123.45;
DecimalParaAlfa(vnValor, vaTexto); @ vaTexto adequado para exibir o decimal @
```

**⚠️ Importante:** Para mensagens e logs com quantidades monetárias, pesos, preços ou qualquer `Numero` não inteiro, prefira **`DecimalParaAlfa`** em vez de **`IntParaAlfa`**, para não perder casas decimais na conversão.

### StrParaInt

Converte um valor alfanumérico (string) para o tipo Inteiro. Esta função é equivalente a `AlfaParaInt` e é mantida para compatibilidade.

**Sintaxe:**

```lsp
StrParaInt(<texto>, <inteiro>);
```

**Parâmetros:**

- `texto`: Valor alfanumérico a ser convertido
- `inteiro`: Variável que receberá o valor convertido

**Exemplo:**

```lsp
Definir Alfa vaTexto;
Definir Numero vnInteiro;

vaTexto = "456";
StrParaInt(vaTexto, vnInteiro); @ vnInteiro será 456 @
```

**⚠️ Importante:** Para grids/tabelas, use variável intermediária como mostrado em `AlfaParaDecimal`.

### IntParaStr

Converte um valor inteiro para o tipo String (Alfanumérico). Esta função é equivalente a `IntParaAlfa` e é mantida para compatibilidade.

**Sintaxe:**

```lsp
IntParaStr(<inteiro>, <texto>);
```

**Parâmetros:**

- `inteiro`: Valor inteiro a ser convertido
- `texto`: Variável alfanumérica que receberá o resultado da conversão

**Exemplo:**

```lsp
Definir Numero vnInteiro;
Definir Alfa vaTexto;

vnInteiro = 789;
IntParaStr(vnInteiro, vaTexto); @ vaTexto será "789" @
```

**⚠️ Importante:** Para grids/tabelas, use variável intermediária como mostrado em `AlfaParaDecimal`.

### ConverteMascara

Esta função converte um valor de entrada (numérico, data, hora ou cadeia de caracteres) para o tipo de dado cadeia de caracteres.

**Sintaxe:**

```lsp
ConverteMascara(<tipoDado>, <valorOrigem>, <alfaDestino>, <mascara>);
```

**Parâmetros:**

- `tipoDado`: Código que determina o tipo do valor de origem
  - `1`: Número
  - `2`: Dinheiro (valor)
  - `3`: Data
  - `4`: Hora
  - `5`: Alfa
- `valorOrigem`: Campo/Variável/Valor a ser convertido
- `alfaDestino`: Variável que receberá o resultado da conversão
- `mascara`: Especifica o formato de apresentação do resultado

**Exemplo de CPF e CNPJ:**

```lsp
Definir Alfa vaInscricaoStr;
Definir Numero vnNumCgc;
Definir Numero vnTipoInscricao;

vnNumCgc = 12345678901;
vnTipoInscricao = 3; @ CPF @

Se (vnTipoInscricao = 1) { @ CNPJ @
  ConverteMascara(1, vnNumCgc, vaInscricaoStr, "99.999.999/9999-99");
} Senao Se (vnTipoInscricao = 3) { @ CPF @
  ConverteMascara(1, vnNumCgc, vaInscricaoStr, "999.999.999-99");
}
@ vaInscricaoStr será "123.456.789-01" @
```

**Observação:** No caso de o tipo de dado ser 5 (Alfa), o parâmetro `valorOrigem` é passado como 0 (zero) e o parâmetro `alfaDestino` receberá o campo do tipo Alfa a ser convertido, e após a conversão, receberá o resultado da conversão.
