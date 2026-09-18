# Operações Numéricas Avançadas

As funções numéricas na LSP permitem realizar operações matemáticas complexas, incluindo arredondamentos, divisões especiais e validações numéricas.

### Arredondamento e Truncamento

#### Arredondamento na LSP (funções existentes)

**Não existe** `Arredondar(<numero>, <casasDecimais>, <resultado>)` de três parâmetros.

Funções usuais no ambiente Senior (detalhes adicionais em **`datas.md`**):

- **`Arredonda`** — [doc ERP](https://documentacao.senior.com.br/gestaoempresarialerp/5.10.4/regra_funcoes/arredonda.htm): `Arredonda(Numero End Valor, Numero Decimais)`; o valor arredondado fica na **mesma variável** do primeiro parâmetro. Preferir **`Decimais`** em variável `Numero` (ex.: `vnCasas`).
- **`ArredondaABNT`** — [doc ERP](https://documentacao.senior.com.br/gestaoempresarialerp/5.10.4/regra_funcoes/arredonda-abnt.htm): mesma forma geral, regra ABNT.
- **`ArredondarValor`** — [doc HCM](https://documentacao.senior.com.br/gestao-de-pessoas-hcm/6.10.4/customizacoes/funcoes/funcao_arredondarvalor.htm): `ArredondarValor(Valor, Qtde_Casas)`.
- **`ArredondarValorEx`** — em vários ambientes, **mesmo comportamento** que `ArredondarValor`; padronize uma no código.
- **`ArredondaValorTipoAcerto`** — nome **sem espaços** (não `Arredonda Valor Tipo Acerto`); tipos 1 e 2 conforme manual. Doc ERP pode listar o título com espaços; no código LSP use o identificador colado.

**Exemplo — `Arredonda`:**

```lsp
Definir Numero vnValor;
Definir Numero vnCasas;

vnValor = 1577.87;
vnCasas = 1;
Arredonda(vnValor, vnCasas);

vnCasas = 0;
Arredonda(vnValor, vnCasas);
```

**Exemplo — `ArredondaABNT`:**

```lsp
Definir Numero vnValor;
Definir Numero vnCasas;

vnValor = 1577.87;
vnCasas = 1;
ArredondaABNT(vnValor, vnCasas);
```

**Exemplo — `ArredondarValor`:**

```lsp
Definir Numero vnValor;
Definir Numero vnCasas;

vnValor = 1577.87;
vnCasas = 1;
ArredondarValor(vnValor, vnCasas);
```

**Exemplo — `ArredondarValorEx`:**

```lsp
@ Em muitos ambientes equivale a ArredondarValor @
Definir Numero vnValor;
Definir Numero vnCasas;

vnValor = 1577.87;
vnCasas = 2;
ArredondarValorEx(vnValor, vnCasas);
```

**Exemplo — `ArredondaValorTipoAcerto`:**

```lsp
Definir Numero vnValor;
Definir Numero vnTipoAcerto;

vnValor = 1475.12845;
vnTipoAcerto = 1;
ArredondaValorTipoAcerto(vnValor, vnTipoAcerto);

vnValor = 1475.12845;
vnTipoAcerto = 2;
ArredondaValorTipoAcerto(vnValor, vnTipoAcerto);
```

Versões e produtos no portal podem diferir (ERP vs HCM); validar sempre na versão do seu sistema.

#### Truncar

Trunca um número para inteiro, removendo a parte fracionária do número.

**Sintaxe:**

```lsp
vnParteInteira = Truncar(<valor>);
```

**Parâmetros:**

- `valor`: Valor do tipo Numero que necessita ter a parte fracionária removida

**Exemplo:**

```lsp
Definir Numero vnValor;
Definir Numero vnValorTruncado;

vnValor = 1.12345;
vnValorTruncado = Truncar(vnValor);
@ vnValorTruncado será 1 @
```

**Exemplo de Cálculos Financeiros:**

```lsp
Definir Funcao calculosFinanceiros();

  @ Variáveis globais @
  Definir Numero vnValorOriginal;
  Definir Numero vnValorArredondado;
  Definir Numero vnValorTruncado;
  Definir Numero vnPorcentagem;
  Definir Numero vnDesconto;
  Definir Numero vnValorFinal;
  Definir Alfa vaMensagem;

vnValorOriginal = 1234.6789;
vnPorcentagem = 15.5;

calculosFinanceiros();

Funcao calculosFinanceiros(); {
  Definir Numero vnPrecisao2;
  Definir Alfa vaValorArredondadoStr;
  Definir Alfa vaValorTruncadoStr;
  Definir Alfa vaDescontoStr;
  Definir Alfa vaValorFinalStr;

  vnPrecisao2 = 2;

  @ Arredonda para 2 casas (Arredondar de 3 parametros nao existe no LSP) @
  vnValorArredondado = vnValorOriginal;
  ArredondarValor(vnValorArredondado, vnPrecisao2);
  DecimalParaAlfa(vnValorArredondado, vaValorArredondadoStr);
  vaMensagem = "Valor arredondado: R$ " + vaValorArredondadoStr;
  Mensagem(Retorna, vaMensagem);
  
  @ Trunca para inteiro @
  vnValorTruncado = Truncar(vnValorOriginal);
  IntParaAlfa(vnValorTruncado, vaValorTruncadoStr);
  vaMensagem = "Valor truncado: R$ " + vaValorTruncadoStr;
  Mensagem(Retorna, vaMensagem);
  
  @ Calcula desconto @
  vnDesconto = (vnValorOriginal * vnPorcentagem) / 100;
  ArredondarValor(vnDesconto, vnPrecisao2);
  
  @ Valor final @
  vnValorFinal = vnValorOriginal - vnDesconto;
  ArredondarValor(vnValorFinal, vnPrecisao2);
  
  DecimalParaAlfa(vnDesconto, vaDescontoStr);
  DecimalParaAlfa(vnValorFinal, vaValorFinalStr);
  
  vaMensagem = "Desconto aplicado: R$ " + vaDescontoStr;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Valor final: R$ " + vaValorFinalStr;
  Mensagem(Retorna, vaMensagem);
}
```

### Operações Especiais

#### Dividir

Realiza divisão com controle de erro para divisão por zero.

**Sintaxe:**

```lsp
Dividir(<dividendo>, <divisor>, <resultado>);
```

#### RestoDivisao

Calcula o resto da divisão (operação módulo).

**Sintaxe:**

```lsp
RestoDivisao(<dividendo>, <divisor>, <resto>);
```

#### HoraParaMinuto

Converte em minutos os valores que representam hora e minuto.

**Sintaxe:**

```lsp
HoraParaMinuto(<hora>, <minuto>, <minutos>);
```

**Parâmetros:**

- `hora`: Valor correspondente à hora inteira
- `minuto`: Valor correspondente aos minutos de uma hora
- `minutos`: Variável que receberá o total em minutos

**Exemplo:**

```lsp
Definir Numero vnResultado;
Definir Alfa vaResultadoStr;
Definir Alfa vaMensagem;

HoraParaMinuto(1, 30, vnResultado);
IntParaAlfa(vnResultado, vaResultadoStr);

@ vnResultado será 90 (1 hora e 30 minutos = 90 minutos) @
vaMensagem = "Resultado: " + vaResultadoStr + " minutos";
Mensagem(Retorna, vaMensagem);
```

**Exemplo de Validações Numéricas:**

```lsp
Definir Funcao validacoesNumericas();

@ Variáveis globais @
Definir Numero vnDividendo;
Definir Numero vnDivisor;
Definir Numero vnResultado;
Definir Numero vnResto;
Definir Numero vnNumero;

vnDividendo = 1500;
vnDivisor = 400;
vnNumero = 12345;

validacoesNumericas();

Funcao validacoesNumericas(); {
  @ Divisão segura @
  Se (vnDivisor <> 0) {
    Dividir(vnDividendo, vnDivisor, vnResultado);
      @ Preparar mensagem da divisão @
  Definir Alfa vaDividendoStr;
  Definir Alfa vaDivisorStr;
  Definir Alfa vaResultadoStr;
  Definir Alfa vaRestoStr;
  Definir Alfa vaMensagem;
  
  IntParaAlfa(vnDividendo, vaDividendoStr);
  IntParaAlfa(vnDivisor, vaDivisorStr);
  IntParaAlfa(vnResultado, vaResultadoStr);
  
  vaMensagem = "Divisão: " + vaDividendoStr + " ÷ " + vaDivisorStr + " = " + vaResultadoStr;
  Mensagem(Retorna, vaMensagem);
  
  @ Resto da divisão @
  RestoDivisao(vnDividendo, vnDivisor, vnResto);
  IntParaAlfa(vnResto, vaRestoStr);
  vaMensagem = "Resto: " + vaRestoStr;
  Mensagem(Retorna, vaMensagem);
  } Senao {
    Mensagem(Erro, "Divisão por zero não permitida!");
  }
  
  @ Verificação de número par/ímpar @
  RestoDivisao(vnNumero, 2, vnResto);
  Definir Alfa vaNumeroStr;
  IntParaAlfa(vnNumero, vaNumeroStr);
  
  Se (vnResto = 0) {
    vaMensagem = " " + vaNumeroStr + " é par";
    Mensagem(Retorna, vaMensagem);
  } Senao {
    vaMensagem = " " + vaNumeroStr + " é ímpar";
    Mensagem(Retorna, vaMensagem);
  }
}
```
