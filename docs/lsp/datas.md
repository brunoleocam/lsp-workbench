# Manipulação Avançada de Datas

As funções de manipulação de datas na LSP permitem realizar operações complexas com datas, incluindo obtenção de datas atuais, cálculos de diferenças, formatação personalizada e validação.

### Funções de Data Atual

#### DataHoje

Obtém a data atual do sistema operacional (apenas data, sem hora).

**Sintaxe:**

```lsp
DataHoje(<data>);
```

#### DataHora

Retorna um número fracionário onde a parte inteira é a data e a fração são as horas. A parte inteira é a quantidade de dias e a parte fracionada representa as horas do dia.

**Sintaxe:**

```lsp
DataHora(<numeroDataHora>);
```

**Parâmetros:**

- `numeroDataHora`: Variável do tipo Numero que receberá a data e hora corrente

**Observação:** Para adicionar horas, minutos e segundos na data, use as frações:

- 1 Hora: 1/24 = 0.04166666666
- 1 Minuto: 1/24/60 = 0.00069444444  
- 1 Segundo: 1/24/60/60 = 0.00001157407

#### DataHoraUTC

Retorna a data em um número fracionário (onde a parte inteira é a data e a fração são as horas) em UTC (Tempo Universal Coordenado).

**Sintaxe:**

```lsp
DataHoraUTC(<numeroDataHoraUTC>);
```

**Parâmetros:**

- `numeroDataHoraUTC`: Variável do tipo Numero que receberá a data e hora corrente UTC

**Observação:** Para adicionar horas, minutos e segundos na data, use as frações:

- 1 Hora: 1/24 = 0.04166666666
- 1 Minuto: 1/24/60 = 0.00069444444
- 1 Segundo: 1/24/60/60 = 0.00001157407

**Exemplo Completo de Obtenção de Datas:**

```lsp
Definir Funcao obterDatasAtuais();

@ Variáveis globais @
Definir Data vdDataAtual;
Definir Numero vnDataHoraAtual;
Definir Numero vnDataHoraUTC;
Definir Alfa vaDataFormatada;
Definir Alfa vaNumeroStr;

obterDatasAtuais();

Funcao obterDatasAtuais(); {
  Definir Alfa vaMensagem;

  @ 1. Obtém apenas a data @
  DataHoje(vdDataAtual);
  @ Para formatação, use DataHora que retorna Numero @
  Definir Numero vnDataHora;
  DataHora(vnDataHora);
  FormatarData(vnDataHora, "dd/MM/yyyy", vaDataFormatada);
  
  @ 2. Obtém data e hora local (número fracionário) @
  DataHora(vnDataHoraAtual);
  IntParaAlfa(vnDataHoraAtual, vaNumeroStr);
  
  @ 3. Obtém data e hora UTC (número fracionário) @
  DataHoraUTC(vnDataHoraUTC);
  
  @ 4. Exibe resultados @
  vaMensagem = "Data atual: " + vaDataFormatada;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Data/Hora local (número): " + vaNumeroStr;
  Mensagem(Retorna, vaMensagem);
  
  @ Exemplo de uso das frações para calcular horas @
  Definir Numero vnSomenteParte;
  Definir Numero vnHoras;
  
  @ Calcular apenas a parte fracionária (horas do dia) @
  vnSomenteParte = vnDataHoraAtual - Truncar(vnDataHoraAtual);
  vnHoras = vnSomenteParte * 24;
  
  IntParaAlfa(vnHoras, vaNumeroStr);
  vaMensagem = "Horas do dia: " + vaNumeroStr;
  Mensagem(Retorna, vaMensagem);
}
```

### Manipulação de Componentes de Hora

Existem duas abordagens principais para extrair e manipular componentes de hora do sistema:

#### **ATENÇÃO: DataHora retorna NUMERO, não Data**

**DataHora** e **DataHoraUTC** retornam números fracionários, NÃO variáveis do tipo Data. Para formatação com FormatarData, use o número retornado por DataHora diretamente.

#### **ERRO COMUM: Confundir tipos para FormatarData**

```lsp
@ ❌ INCORRETO: FormatarData NÃO aceita tipo Data @
Definir Data vdData;
DataHoje(vdData);
FormatarData(vdData, "dd/MM/yyyy", vaData);  @ ERRO: FormatarData só aceita Numero @

@ ✅ CORRETO: FormatarData aceita apenas NUMERO (de DataHora) @
Definir Numero vnDataHora;         @ Correto: DataHora retorna Numero @
DataHora(vnDataHora);              @ Correto: Obtém número fracionário @
FormatarData(vnDataHora, "dd/MM/yyyy", vaData);  @ Correto: Funciona! @

@ ✅ ALTERNATIVA: Para datas simples, use DataHoje + outras funções @
Definir Data vdDataAtual;          @ Para comparações e operações @
DataHoje(vdDataAtual);             @ DataHoje retorna tipo Data @
@ Use DecodData, CodData, etc. para manipular vdDataAtual @
```

#### **Guia Rápido: Quando Usar Cada Função**

| **Função** | **Retorna** | **Uso** | **Exemplo** |
|------------|-------------|---------|-------------|
| `DataHoje` | Tipo Data | Comparações, operações com datas | `Se (vdDataVencimento < vdDataAtual)` |
| `DataHora` | Tipo Numero | FormatarData, cálculos matemáticos | `FormatarData(vnDataHora, "dd/MM/yyyy", vaTexto)` |
| `DataHoraUTC` | Tipo Numero | Cálculos UTC, sincronização | `vnUTC = vnDataHoraUTC + (1/24)` @ +1 hora @ |

#### **Abordagem 1: Usando HorSis + CopiarAlfa (Recomendada)**

Método direto para obter componentes específicos da hora atual:

```lsp
Definir Funcao extrairComponentesHora();

@ Variáveis globais @
Definir Alfa vaHoraCompleta;
Definir Alfa vaApenasHora;
Definir Alfa vaApenasMinuto;
Definir Alfa vaApenasSegundo;
Definir Data vdDataAtual;
Definir Alfa vaDataFormatada;

extrairComponentesHora();

Funcao extrairComponentesHora(); {
  Definir Alfa vaMensagem;
  @ Obtém a hora do sistema no formato HH:MM:SS @
  vaHoraCompleta = HorSis;
  
  @ Obtém a data atual @
  DataHoje(vdDataAtual);
  @ Para formatação, use DataHora que retorna Numero @
  Definir Numero vnDataHora;
  DataHora(vnDataHora);
  FormatarData(vnDataHora, "dd/MM/yyyy", vaDataFormatada);
  
  @ Extrai componentes usando CopiarAlfa @
  vaApenasHora = vaHoraCompleta;
  CopiarAlfa(vaApenasHora, 1, 2);     @ Extrai hora (posição 1-2) @
  
  vaApenasMinuto = vaHoraCompleta;
  CopiarAlfa(vaApenasMinuto, 4, 2);   @ Extrai minuto (posição 4-5) @
  
  vaApenasSegundo = vaHoraCompleta;
  CopiarAlfa(vaApenasSegundo, 7, 2);  @ Extrai segundo (posição 7-8) @
  
  @ Exibe resultados @
  vaMensagem = "Data: " + vaDataFormatada;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Hora completa: " + vaHoraCompleta;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Hora: " + vaApenasHora;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Minuto: " + vaApenasMinuto;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Segundo: " + vaApenasSegundo;
  Mensagem(Retorna, vaMensagem);
}
```

#### **Abordagem 2: Usando DataHora com Número Fracionário**

Método usando o número fracionário retornado por DataHora para calcular componentes:

```lsp
Definir Funcao extrairComponentesDataHora();

@ Variáveis globais @
Definir Numero vnDataHora;
Definir Numero vnParteInteira;
Definir Numero vnParteFracionaria;
Definir Numero vnHoras;
Definir Numero vnMinutos;
Definir Numero vnSegundos;
Definir Alfa vaHoraFormatada;

extrairComponentesDataHora();

Funcao extrairComponentesDataHora(); {
  @ Obtém data e hora como número fracionário @
  DataHora(vnDataHora);
  
  @ Separa parte inteira (data) da fracionária (hora) @
@ Nota: Use conversão para inteiro ou função Truncar @
vnParteInteira = Truncar(vnDataHora);
vnParteFracionaria = vnDataHora - vnParteInteira;

@ Calcula horas, minutos e segundos @
vnHoras = vnParteFracionaria * 24;
vnMinutos = (vnParteFracionaria * 24 - vnHoras) * 60;
vnSegundos = ((vnParteFracionaria * 24 - vnHoras) * 60 - vnMinutos) * 60;
  
  @ Formata resultado @
  Definir Alfa vaHorasStr;
  Definir Alfa vaMinutosStr;
  Definir Alfa vaSegundosStr;
  Definir Alfa vaDataStr;
  
  IntParaAlfa(vnParteInteira, vaDataStr);
  IntParaAlfa(vnHoras, vaHorasStr);
  IntParaAlfa(vnMinutos, vaMinutosStr);
  IntParaAlfa(vnSegundos, vaSegundosStr);
  
  vaHoraFormatada = vaHorasStr + ":" + vaMinutosStr + ":" + vaSegundosStr;
  
  @ Exibe resultados @
  Definir Alfa vaNumeroStr;
  Definir Alfa vaMensagem;
  IntParaAlfa(vnDataHora, vaNumeroStr);
  vaMensagem = "Número fracionário: " + vaNumeroStr;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Parte inteira (data): " + vaDataStr;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Hora calculada: " + vaHoraFormatada;
  Mensagem(Retorna, vaMensagem);
}
```

#### **Comparação das Abordagens:**

| Aspecto | HorSis + CopiarAlfa | DataHora + Cálculos |
|---------|---------------------|---------------------|
| **Flexibilidade** |  Formato padrão HH:MM:SS | ⚠️ Requer cálculos manuais |
| **Simplicidade** |  Direta e clara | Matemática complexa |
| **Performance** |  Rápida | ⚠️ Múltiplas operações |
| **Precisão** |  Hora formatada |  Cálculo exato |
| **Compatibilidade** |  Tradicional e confiável |  Usa função oficial |

**Recomendação:** Use a **Abordagem 1** (HorSis + CopiarAlfa) para simplicidade, ou **Abordagem 2** (DataHora) quando precisar de cálculos específicos com datas/horas.

### Construção e Decomposição de Datas

#### CodData

Possibilita a composição de uma data, montando-a através de dia, mês e ano. **Retorna** a data (usar em atribuição).

**Sintaxe:**

```lsp
vdData = CodData(<dia>, <mes>, <ano>);
```

**Parâmetros:**

- `dia`: Valor correspondente ao dia
- `mes`: Valor correspondente ao mês  
- `ano`: Valor correspondente ao ano

**Exemplo:**

```lsp
Definir Data vdData;
Definir Numero vnDia;
Definir Numero vnMes;
Definir Numero vnAno;

vnDia = 10;
vnMes = 1;
vnAno = 2002;

vdData = CodData(vnDia, vnMes, vnAno);
```

#### MontaData

Esta função concatena três variáveis, formando uma data. Diferente de `CodData` (que **retorna** a data), `MontaData` grava o resultado no **4º parâmetro**.

**Sintaxe:**

```lsp
MontaData(<dia>, <mes>, <ano>, <data>);
```

**Parâmetros:**

- `dia`: Dia da data a ser gerada
- `mes`: Mês da data a ser gerada
- `ano`: Ano da data a ser gerada (deve ter 4 dígitos, ex: 1998)
- `data`: Variável do tipo Número ou Data que receberá o resultado

**Exemplo:**

```lsp
Definir Numero vnDia;
Definir Numero vnMes;
Definir Numero vnAno;
Definir Data vdData;

vnDia = 1;
vnMes = 9;
vnAno = 1998;

MontaData(vnDia, vnMes, vnAno, vdData);
@ vdData conterá "01/09/1998" @
```

**Observação:** Quando a variável de retorno for numérica, não será necessário defini-la. No entanto, se for utilizada em um cursor, é obrigatório defini-la como Data.

#### DesMontaData

Esta função desmonta uma data, separando em três variáveis, as informações Dia/Mês/Ano da data.

**Sintaxe:**

```lsp
DesMontaData(<data>, <dia>, <mes>, <ano>);
```

**Parâmetros:**

- `data`: Campo/Variável a ser desmontada
- `dia`: Variável tipo Numero que receberá o dia da data a ser desmontada
- `mes`: Variável tipo Numero que receberá o mês da data a ser desmontada
- `ano`: Variável tipo Numero que receberá o ano da data a ser desmontada

**Exemplo:**

```lsp
Definir Data vdDataEmissao;
Definir Numero vnDia;
Definir Numero vnMes;
Definir Numero vnAno;

vdDataEmissao = E140NFV.DatEmi;
DesMontaData(vdDataEmissao, vnDia, vnMes, vnAno);
@ Se a data fosse 24/04/1995: vnDia=24, vnMes=04, vnAno=1995 @
```

#### ConverteDataBanco

Converter uma data qualquer, para o formato de data do banco de dados.

**Sintaxe:**

```lsp
ConverteDataBanco(<datNum>, <datAlf>);
```

**Parâmetros:**

- `datNum`: É o campo de tabela ou variável que se deseja converter
- `datAlf`: É uma variável que conterá o retorno da conversão

**Exemplo:**

```lsp
Definir Alfa vaDataStr;
Definir Data vdData;

vdData = 31/12/1900;
ConverteDataBanco(vdData, vaDataStr);
@ vaDataStr = "to_date('31/12/1900','DD/MM/YYYY')" ou formato do banco usado @
```

#### ConverteDataSqlSenior2

Converter datas para o formato SQL Senior 2.

**Sintaxe:**

```lsp
ConverteDataSqlSenior2(<datNum>, <datSql>);
```

**Parâmetros:**

- `datNum`: Data a ser convertida
- `datSql`: Data em formato SQL Senior 2 (retorno)

**Exemplo:**

```lsp
Definir Alfa vaSqlAux;
ConverteDataSqlSenior2(DatSis, vaSqlAux);
vaSqlAux = "E000LPA.DATINI = " + vaSqlAux;
InsClauSQLWhere("Detalhe_000LPA", vaSqlAux);
```

**Observações:** Esta função deve ser utilizada em lugar das funções ConverteDataToDB e ConverteDataBanco, quando for necessário inserir uma data em um comando SQL Senior 2.

#### ConverteDataToDB

Converter uma data qualquer, para o formato de data do banco de dados.

**Sintaxe:**

```lsp
ConverteDataToDB(<datNum>, <datAlf>);
```

**Parâmetros:**

- `datNum`: É o campo de tabela ou variável que se deseja converter
- `datAlf`: É uma variável tipo Alfa, que conterá o retorno da conversão

**Exemplo:**

```lsp
Definir Alfa vaDataStr;
Definir Data vdData;

vdData = 31/12/1900;
ConverteDataToDB(vdData, vaDataStr);
@ vaDataStr = "to_date('31/12/1900','DD/MM/YYYY')" ou formato do banco usado @
```

#### AnoBissexto

Esta função tem por objetivo retornar a informação se um ano é ou não bissexto tomando como base o ano da data passada.

**Sintaxe:**

```lsp
AnoBissexto(<data>, <bissexto>);
```

**Parâmetros:**

- `data`: Recebe a data base a ser verificada
- `bissexto`: Retorna a indicação se o ano é bissexto:
  - 0: se o ano não for bissexto
  - 1: se o ano for bissexto

**Exemplo:**

```lsp
Definir Data vdData;
Definir Numero vnBissexto;

vdData = 02/07/2018;
AnoBissexto(vdData, vnBissexto);
@ vnBissexto será 0 (não bissexto) @
```

#### DecodData

Decompõe uma data em dia, mês e ano separadamente.

**Sintaxe:**

```lsp
DecodData(<data>, <dia>, <mes>, <ano>);
```

**Exemplo de Validação de Data:**

```lsp
Definir Funcao validarDataNascimento();

@ Variáveis globais @
Definir Numero vnDia;
Definir Numero vnMes;
Definir Numero vnAno;
Definir Data vdDataNascimento;
Definir Data vdDataAtual;
Definir Numero vnIdade;

vnDia = 15;
vnMes = 8;
vnAno = 1990;

validarDataNascimento();

Funcao validarDataNascimento(); {
  @ 1. Monta a data @
  vdDataNascimento = CodData(vnDia, vnMes, vnAno);
  
  @ 2. Obtém data atual para validação @
  DataHoje(vdDataAtual);
  
  @ 3. Verifica se a data é válida (não futura) @
  Se (vdDataNascimento > vdDataAtual) {
    Mensagem(Erro, "Data de nascimento não pode ser futura!");
  } Senao {
    @ 4. Calcula idade aproximada @
    vnIdade = vnAno - 2024; @ Simplificado para exemplo @
    Se (vnIdade < 0) {
      vnIdade = vnIdade * -1;
    }
    
    Definir Alfa vaIdadeStr;
    IntParaAlfa(vnIdade, vaIdadeStr);
    Definir Alfa vaMensagem;
    vaMensagem = "Data válida! Idade aproximada: " + vaIdadeStr;
    Mensagem(Retorna, vaMensagem);
  }
}
```

### Operações Aritméticas com Datas

**⚠️ IMPORTANTE:** A LSP não possui função para calcular datas futuras ou passadas, use operações aritméticas diretas com variáveis do tipo Data ou converta para número e use `DataHora()`.

**Exemplo de Cálculo de Prazos:**

```lsp
Definir Funcao calcularPrazos();

@ Variáveis globais @
Definir Data vdDataBase;
Definir Data vdDataVencimento;
Definir Data vdDataLimite;
Definir Alfa vaDataVencimentoStr;
Definir Alfa vaDataLimiteStr;

DataHoje(vdDataBase);

calcularPrazos();

Funcao calcularPrazos(); {
  @ Para calcular datas futuras, use operação direta @
  @ vdDataVencimento = vdDataBase + 30; @
  
  @ Para formatação, converta para número @
  Definir Numero vnDataVencimento;
  vnDataVencimento = vdDataVencimento;
  FormatarData(vnDataVencimento, "dd/MM/yyyy", vaDataVencimentoStr);

  @ Para calcular datas passadas, use operação direta @
  @ vdDataLimite = vdDataBase - 15; @
  
  @ Para formatação, converta para número @
  Definir Numero vnDataLimite;
  vnDataLimite = vdDataLimite;
  FormatarData(vnDataLimite, "dd/MM/yyyy", vaDataLimiteStr);
  
  Definir Alfa vaMensagem;
  vaMensagem = "Vencimento: " + vaDataVencimentoStr;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Limite: " + vaDataLimiteStr;
  Mensagem(Retorna, vaMensagem);
}
```

### Formatação Avançada de Datas

#### FormatarData

Formata a data em milissegundos gerada pela função DataHora.

**Sintaxe:**

```lsp
FormatarData(<data>, <formato>, <dataFormatada>);
```

**Parâmetros:**

- `data`: Valor numérico da data (tipo Numero)
- `formato`: Formato da data (tipo Alfa)  
- `dataFormatada`: Variável que receberá a data formatada (tipo Alfa)

**⚠️ CRÍTICO - Case Sensitivity das Máscaras:**

- **SEMPRE use letras minúsculas**: `yyyy` para ano, `dd` para dia
- **NUNCA use maiúsculas**: `YYYY` ou `DD` geram datas inválidas!

**Máscaras Suportadas:**

- `dd`: Dia (01-31) ⚠️ **Minúsculo obrigatório**
- `MM`: Mês (01-12)
- `yyyy`: Ano com 4 dígitos ⚠️ **Minúsculo obrigatório**
- `yy`: Ano com 2 dígitos
- `HH`: Hora (00-23)
- `mm`: Minuto (00-59)
- `ss`: Segundo (00-59)

**Exemplo Correto (conforme documentação oficial):**

```lsp
Definir Numero vnDataHora;        @ Tipo NUMERO obrigatório @
Definir Alfa vaDataFormatada;

@ DataHora retorna número fracionário @
DataHora(vnDataHora);

@ FormatarData aceita NUMERO, não Data @
FormatarData(vnDataHora, "yyyy-MM-dd'T'HH:mm:ss'Z'", vaDataFormatada);
@ Resultado: "2024-01-15T14:30:45Z" @
```

**⚠️ ERRO COMUM - Confundir tipos:**

```lsp
@ ❌ INCORRETO - FormatarData NÃO aceita tipo Data @
Definir Data vdData;
DataHoje(vdData);
FormatarData(vdData, "dd/MM/yyyy", vaFormatada); @ ERRO! @

@ ✅ CORRETO - Use DataHora (retorna Numero) @
Definir Numero vnDataHora;
DataHora(vnDataHora);
FormatarData(vnDataHora, "dd/MM/yyyy", vaFormatada); @ Funciona! @
```

**Exemplo de Formatações Diversas:**

⚠️ **IMPORTANTE**: Este exemplo está **CORRETO** porque `DataHora` retorna um número fracionário, que é exatamente o que `FormatarData` precisa. Para usar `FormatarData`, você precisa de números obtidos com `DataHora` ou `DataHoraUTC`.

```lsp
Definir Funcao exemploFormatacoes();

@ Variáveis globais @
Definir Data vdDataAtual;
Definir Alfa vaFormatoBR;
Definir Alfa vaFormatoUS;
Definir Alfa vaFormatoISO;
Definir Alfa vaFormatoCompleto;
Definir Alfa vaApenasHora;

DataHoje(vdDataAtual);

exemploFormatacoes();

Funcao exemploFormatacoes(); {
  @ Para formatação, use DataHora que retorna Numero @
  Definir Numero vnDataHora;
  DataHora(vnDataHora);

  @ Formato brasileiro @
  FormatarData(vnDataHora, "dd/MM/yyyy", vaFormatoBR);

  @ Formato americano @
  FormatarData(vnDataHora, "MM/dd/yyyy", vaFormatoUS);

  @ Formato ISO 8601 @
  FormatarData(vnDataHora, "yyyy-MM-dd", vaFormatoISO);
  
  @ ⚠️ NOTA: FormatarData só formata datas, não horas para variáveis do tipo Data @
  @ Para hora atual, use HorSis ou outros métodos @
  vaFormatoCompleto = vaFormatoBR + " " + HorSis;  @ Concatena data + hora sistema @
  vaApenasHora = HorSis;                           @ Hora do sistema @
  
  @ Exibe resultados @
  Definir Alfa vaMensagem;
  vaMensagem = "Brasileiro: " + vaFormatoBR;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Americano: " + vaFormatoUS;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "ISO 8601: " + vaFormatoISO;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Completo: " + vaFormatoCompleto;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Hora: " + vaApenasHora;
  Mensagem(Retorna, vaMensagem);
}
```

### Funções de Extenso

#### Extenso

Esta função gera o extenso de um valor.

**⚠️ Importante:** Esta função contempla no máximo duas casas decimais após a vírgula. Caso o valor tenha três ou mais casas decimais após a vírgula, ele será arredondado para o valor real de duas.

**Sintaxe:**

```lsp
Extenso(<valor>, <tamanhoLinha1>, <tamanhoLinha2>, <tamanhoLinha3>, <linha1>, <linha2>, <linha3>);
```

**Parâmetros:**

- `valor`: Campo/Variável do qual se deseja obter o extenso
- `tamanhoLinha1`: Quantidade de caracteres que será usado na primeira linha para geração do extenso
- `tamanhoLinha2`: Quantidade de caracteres que será usado na segunda linha para geração do extenso
- `tamanhoLinha3`: Quantidade de caracteres que será usado na terceira linha para geração do extenso
- `linha1`: Variável que receberá a primeira linha do extenso do valor (retorno)
- `linha2`: Variável que receberá a segunda linha do extenso do valor (retorno)
- `linha3`: Variável que receberá a terceira linha do extenso do valor (retorno)

**Exemplo:**

```lsp
Definir Alfa vaExtLin1;
Definir Alfa vaExtLin2;
Definir Alfa vaExtLin3;
Definir Numero vnQuantidade;

vnQuantidade = 1577350;
Extenso(vnQuantidade, 30, 30, 30, vaExtLin1, vaExtLin2, vaExtLin3);
@ vaExtLin1 = "Um milhao, quinhentos e ******" @
@ vaExtLin2 = "setenta e sete mil e *********" @
@ vaExtLin3 = "trezentos e cinquenta reais **" @
```

#### ExtensoMes

Esta função monta o extenso do mês de uma determinada data.

**Sintaxe:**

```lsp
ExtensoMes(<datMon>, <extMes>);
```

**Parâmetros:**

- `datMon`: Campo/Variável do qual se deseja obter o extenso do mês
- `extMes`: Variável tipo Alfa que receberá o extenso do mês

**Exemplo:**

```lsp
Definir Alfa vaMesExt;
Definir Data vdData;

DataHoje(vdData);
ExtensoMes(vdData, vaMesExt);
@ Se a data fosse 31/12/1900, vaMesExt seria "Dezembro" @
```

#### ExtensoMoeda

Esta função gera o extenso de um valor com a moeda informada.

**Sintaxe:**

```lsp
ExtensoMoeda(<vlrExt>, <tamLn1>, <tamLn2>, <tamLn3>, <moeIS>, <moeIP>, <moeDS>, <moeDP>, <extLn1>, <extLn2>, <extLn3>);
```

**Parâmetros:**

- `vlrExt`: Campo/Variável do qual se deseja obter o extenso
- `tamLn1`: Quantidade de caracteres que será usado na primeira linha para geração do extenso
- `tamLn2`: Quantidade de caracteres que será usado na segunda linha para geração do extenso
- `tamLn3`: Quantidade de caracteres que será usado na terceira linha para geração do extenso
- `moeIS`: Moeda, parte inteira no singular
- `moeIP`: Moeda, parte inteira no plural
- `moeDS`: Moeda, parte decimal no singular
- `moeDP`: Moeda, parte decimal no plural
- `extLn1`: Variável que receberá a primeira linha do extenso do valor (retorno)
- `extLn2`: Variável que receberá a segunda linha do extenso do valor (retorno)
- `extLn3`: Variável que receberá a terceira linha do extenso do valor (retorno)

**Exemplo:**

```lsp
Definir Alfa vaExtLin1;
Definir Alfa vaExtLin2;
Definir Alfa vaExtLin3;
Definir Numero vnValorSalario;

vnValorSalario = 1577.95;
ExtensoMoeda(vnValorSalario, 30, 30, 30, "dólar", "dólares", "cent", "cents", vaExtLin1, vaExtLin2, vaExtLin3);
@ vaExtLin1 = "um mil, quinhentos e setenta *" @
@ vaExtLin2 = "e sete dólares e noventa e ***" @
@ vaExtLin3 = "cinco cents ******************" @
```

#### ExtensoSemana

Esta função monta o extenso do dia da semana de uma determinada data.

**Sintaxe:**

```lsp
ExtensoSemana(<datMon>, <extSem>);
```

**Parâmetros:**

- `datMon`: Campo/Variável do qual se deseja obter o extenso da semana
- `extSem`: Variável que receberá o extenso da Semana

**Exemplo:**

```lsp
Definir Alfa vaSemExt;
Definir Data vdData;

DataHoje(vdData);
ExtensoSemana(vdData, vaSemExt);
@ Se a data fosse 31/12/1900, vaSemExt seria "Sexta-Feira" @
```

#### DataExtenso

Esta função gera o extenso de determinada data.

**Sintaxe:**

```lsp
DataExtenso(<data>, <extenso>);
```

**Parâmetros:**

- `data`: Campo/Variável a partir do qual se deseja gerar o extenso
- `extenso`: Variável que retornará o extenso da data

**Exemplo:**

```lsp
Definir Data vdData;
Definir Alfa vaExtenso;

vdData = E210MVP.DatMov;
DataExtenso(vdData, vaExtenso);
@ vaExtenso vai conter a data por extenso @
```

### Operações Matemáticas e Formatação

#### MultiplicaValor

Esta função multiplica um número no formato alfanumérico por um fator de multiplicação numérico e retorna o resultado desta multiplicação em uma variável alfanumérica.

**Sintaxe:**

```lsp
MultiplicaValor(<multiplicando>, <fator>, <retorno>);
```

**Parâmetros:**

- `multiplicando`: Campo/Variável que contém o valor a ser multiplicado
- `fator`: Campo/Variável que contém o fator de multiplicação
- `retorno`: Campo/Variável que retorna o resultado da multiplicação

**Exemplo:**

```lsp
Definir Alfa vaNumOriginal;
Definir Alfa vaNumMultiplicado;
Definir Numero vnFator;

vaNumOriginal = "0000237259400000216555";
vnFator = 5;
MultiplicaValor(vaNumOriginal, vnFator, vaNumMultiplicado);
@ vaNumMultiplicado será "1186297000001082775" @
```

#### ConverteUnidadeMedida

Calcula a quantidade convertida de uma unidade de medida (de) para outra unidade de medida (para).

**Sintaxe:**

```lsp
ConverteUnidadeMedida(<codPro>, <codDer>, <uniMedDe>, <uniMedPara>, <qtde>, <codFor>, <qtdDec>, <codEmp>, <qtdCnv>);
```

**Parâmetros:**

- `codPro`: Variável que indica o código de produto (opcional)
- `codDer`: Variável que indica o código da derivação (opcional)
- `uniMedDe`: Variável que indica a unidade de medida origem (obrigatório)
- `uniMedPara`: Variável que indica a unidade de medida destino (obrigatório)
- `qtde`: Variável que indica a quantidade a ser convertida (obrigatório)
- `codFor`: Variável que indica o código do fornecedor (opcional)
- `qtdDec`: Variável que indica a quantidade de decimais usada na conversão (obrigatório), se não sabe-se a precisão, informar 5
- `codEmp`: Variável que indica o código da empresa (opcional), caso for informado zero, será utilizado a empresa logada
- `qtdCnv`: Variável que retorna a quantidade convertida da unidade de medida origem para a unidade de medida destino

**Exemplo:**

```lsp
Definir Numero vnQtdConv;
ConverteUnidadeMedida("", "", "KM", "M", 100, 0, 3, 0, vnQtdConv);
@ vnQtdConv será 100000 (100 km = 100000 metros) @
```

#### Arredonda

Esta função arredonda um valor, conforme a precisão informada.

**Sintaxe:**

```lsp
Arredonda(<valor>, <decimais>);
```

Na [documentação oficial ERP](https://documentacao.senior.com.br/gestaoempresarialerp/5.10.4/regra_funcoes/arredonda.htm), a assinatura é descrita como `Arredonda(Numero End Valor, Numero Decimais)` — ou seja, o **primeiro parâmetro é a variável que recebe o valor já arredondado** (efeito in-place sobre essa variável).

**Parâmetros:**

- `valor`: Variável que será arredondada
- `decimais`: Variável numérica que indica a quantidade de casas decimais do arredondamento

**Exemplo:**

```lsp
Definir Numero vnValor;
vnValor = 1577.87;
Arredonda(vnValor, 1);
@ vnValor será 1577.90 @

Arredonda(vnValor, 0);
@ vnValor será 1578.00 @
```

#### ArredondaABNT

Esta função aplica a regra de arredondamento da ABNT, conforme a precisão informada.

**Sintaxe:**

```lsp
ArredondaABNT(<valor>, <decimais>);
```

Referência: [Arredonda ABNT — documentação ERP](https://documentacao.senior.com.br/gestaoempresarialerp/5.10.4/regra_funcoes/arredonda-abnt.htm).

**Parâmetros:**

- `valor`: Variável que será arredondada
- `decimais`: Variável numérica que indica a quantidade de casas decimais do arredondamento

**Regras ABNT:**

- Quando o algarismo a ser conservado for seguido de algarismo inferior a 5, o algarismo a ser conservado permanece sem alteração
- Quando o algarismo a ser conservado for seguido de algarismo superior a 5, ou igual a 5 seguindo de um algorismo diferente de zero, soma-se uma unidade ao algarismo a ser conservado
- Quando o algarismo a ser conservado for ímpar, seguido de 5 e posteriormente de zeros, soma-se uma unidade ao algarismo a ser conservado
- Quando o algarismo a ser conservado for par, seguido de 5 e posteriormente de zeros, o algarismo a ser conservado permanece sem alteração

**Exemplo:**

```lsp
Definir Numero vnValor;
vnValor = 1577.87;
ArredondaABNT(vnValor, 1);
@ vnValor será 1577.90 @

ArredondaABNT(vnValor, 0);
@ vnValor será 1578.00 @
```

#### ArredondarValor

Esta função arredonda determinado valor, conforme a precisão informada.

**Sintaxe:**

```lsp
ArredondarValor(<valorVariavel>, <precisao>);
```

Referência: [ArredondarValor — documentação HCM (sintaxe `Valor`, `Qtde_Casas`)](https://documentacao.senior.com.br/gestao-de-pessoas-hcm/6.10.4/customizacoes/funcoes/funcao_arredondarvalor.htm).

**`ArredondarValorEx`:** em ambiente de teste, costuma apresentar o **mesmo comportamento** que `ArredondarValor`; padronize uma das duas no código.

**Parâmetros:**

- `valorVariavel`: Campo ou variável que deseja-se arredondar
- `precisao`: Quantidade de casas decimais para precisão do arredondamento. Se for informado 0 (zero), faz o arredondamento na parte inteira do resultado

**Exemplo:**

```lsp
Definir Numero vnVlrNum;
vnVlrNum = 1577.87;
ArredondarValor(vnVlrNum, 1); @ Retorno será 1577.90 @
ArredondarValor(vnVlrNum, 0); @ Retorno será 1578.00 @
```

#### Arredonda Valor Tipo Acerto

Esta função arredonda um valor tipo acerto, conforme a precisão informada.

**Sintaxe:**

```lsp
Arredonda Valor Tipo Acerto(<valor>, <tipoAcerto>);
```

Referência: [Arredonda Valor Tipo Acerto — documentação ERP](https://documentacao.senior.com.br/gestaoempresarialerp/5.10.4/regra_funcoes/arredondavalortipoacerto.htm).

**Parâmetros:**

- `valor`: Qualquer valor que se deseja arredondar
- `tipoAcerto`:
  - Tipo 1: O valor passado por parâmetro será arredondado para duas casas decimais
  - Tipo 2: O valor passado por parâmetro será arredondado ignorando a terceira casa decimais

**Exemplo:**

```lsp
Definir Numero vnValor;
vnValor = 1475.12845;
Arredonda Valor Tipo Acerto(vnValor, 1); @ Retorna 1475.13 @
Arredonda Valor Tipo Acerto(vnValor, 2); @ Retorna 1475.12 @
```
