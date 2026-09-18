# Funções Avançadas de Data e Dias Úteis

### RetDiaSemana

Retorna o dia da semana em forma de número da data de entrada.

**Sintaxe:**

```lsp
RetDiaSemana(<pData>, <pDia>);
```

**Parâmetros:**

- `pData`: Variável numérica que recebe a data atual
- `pDia`: Variável numérica que retorna o dia da semana da data atual

**Valores de retorno:**

- 0 = Domingo
- 1 = Segunda-feira
- 2 = Terça-feira
- 3 = Quarta-feira
- 4 = Quinta-feira
- 5 = Sexta-feira
- 6 = Sábado

**Exemplo:**

```lsp
Definir Funcao exemploRetDiaSemana();

@ Variáveis globais @
Definir Numero vnDataSis;
Definir Numero vnDiaSemana;
Definir Alfa vaNomeDia;

exemploRetDiaSemana();

Funcao exemploRetDiaSemana(); {
  @ Obtém a data atual do sistema @
  vnDataSis = DatSis;
  
  @ Retorna o dia da semana @
  RetDiaSemana(vnDataSis, vnDiaSemana);
  
  @ Converte o número para nome do dia @
  Se (vnDiaSemana = 0) {
    vaNomeDia = "Domingo";
  } Senao Se (vnDiaSemana = 1) {
    vaNomeDia = "Segunda-feira";
  } Senao Se (vnDiaSemana = 2) {
    vaNomeDia = "Terça-feira";
  } Senao Se (vnDiaSemana = 3) {
    vaNomeDia = "Quarta-feira";
  } Senao Se (vnDiaSemana = 4) {
    vaNomeDia = "Quinta-feira";
  } Senao Se (vnDiaSemana = 5) {
    vaNomeDia = "Sexta-feira";
  } Senao {
    vaNomeDia = "Sábado";
  }
  
  Definir Alfa vaMensagem;
  vaMensagem = "Hoje é " + vaNomeDia;
  Mensagem(Retorna, vaMensagem);
}
```

### RetDiaUtilAntPos

Verifica se uma data é dia útil ou não, retornando o dia útil imediatamente anterior e o posterior. Se a data informada for dia útil, traz essa data em ambos os retornos.

**Sintaxe:**

```lsp
RetDiaUtilAntPos(<pData>, <pCEP>, <pDataAnt>, <pDataPos>);
```

**Parâmetros:**

- `pData`: Variável numérica que recebe a data atual
- `pCEP`: Variável numérica que recebe o CEP do local
- `pDataAnt`: Variável numérica que retorna o dia útil imediatamente anterior, ou a data informada caso ela já seja dia útil
- `pDataPos`: Variável numérica que retorna o dia útil imediatamente posterior, ou a data informada caso ela já seja dia útil

**Exemplo:**

```lsp
Definir Funcao exemploRetDiaUtilAntPos();

@ Variáveis globais @
Definir Numero vnData;
Definir Numero vnCEP;
Definir Numero vnDataAnt;
Definir Numero vnDataPos;
Definir Alfa vaDataAlf;
Definir Alfa vaDataAntStr;
Definir Alfa vaDataPosStr;

exemploRetDiaUtilAntPos();

Funcao exemploRetDiaUtilAntPos(); {
  @ Exemplo com data de Natal (25/12/2024) @
  vaDataAlf = "25/12/2024";
  ConvDataInt(vaDataAlf, vnData);
  vnCEP = 89107000;
  
  @ Verifica dias úteis anteriores e posteriores @
  RetDiaUtilAntPos(vnData, vnCEP, vnDataAnt, vnDataPos);
  
  @ Converte as datas para string para exibição @
  ConvDataExt(vnDataAnt, vaDataAntStr);
  ConvDataExt(vnDataPos, vaDataPosStr);
  
  Definir Alfa vaMensagem;
  vaMensagem = "Data base: " + vaDataAlf;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Dia útil anterior: " + vaDataAntStr;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Dia útil posterior: " + vaDataPosStr;
  Mensagem(Retorna, vaMensagem);
}
```

### RetornarDiasUteisMes

Retorna a quantidade de dias úteis de um mês tomando como base uma determinada data.

**Sintaxe:**

```lsp
RetornarDiasUteisMes(<aDatabase>, <aTipoRetorno>, <aQtdDiasUteis>);
```

**Parâmetros:**

- `aDatabase`: Variável do tipo Data que recebe a data base a ser verificada
- `aTipoRetorno`: Variável numérica que indica o tipo de retorno:
  - 0: Retorna a quantidade de dias úteis do mês inteiro
  - 1: Retorna a quantidade de dias úteis do primeiro dia do mês até o dia da data base
- `aQtdDiasUteis`: Variável numérica que retorna a quantidade de dias úteis encontrada

**Exemplo:**

```lsp
Definir Funcao exemploRetornarDiasUteisMes();

@ Variáveis globais @
Definir Data vdDataBase;
Definir Numero vnQtdDiasUteisTotal;
Definir Numero vnQtdDiasUteisAteData;
Definir Alfa vaQtdTotalStr;
Definir Alfa vaQtdAteDataStr;

exemploRetornarDiasUteisMes();

Funcao exemploRetornarDiasUteisMes(); {
  @ Define uma data de exemplo (21/07/2024) @
  vdDataBase = CodData(21, 7, 2024);
  
  @ Obtém quantidade de dias úteis do mês inteiro @
  RetornarDiasUteisMes(vdDataBase, 0, vnQtdDiasUteisTotal);
  
  @ Obtém quantidade de dias úteis até a data base @
  RetornarDiasUteisMes(vdDataBase, 1, vnQtdDiasUteisAteData);
  
  @ Converte para string para exibição @
  IntParaAlfa(vnQtdDiasUteisTotal, vaQtdTotalStr);
  IntParaAlfa(vnQtdDiasUteisAteData, vaQtdAteDataStr);
  
  Definir Alfa vaMensagem;
  vaMensagem = "Dias úteis no mês todo: " + vaQtdTotalStr;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Dias úteis até 21/07: " + vaQtdAteDataStr;
  Mensagem(Retorna, vaMensagem);
}
```

### RetornarDiasUteisPeriodo

Retorna a quantidade de dias úteis entre duas datas informadas.

**Sintaxe:**

```lsp
RetornarDiasUteisPeriodo(<aDataIni>, <aDataFim>, <aQtdDiasUteis>);
```

**Parâmetros:**

- `aDataIni`: Variável do tipo Data que recebe a data inicial do período
- `aDataFim`: Variável do tipo Data que recebe a data final do período
- `aQtdDiasUteis`: Variável numérica que retorna a quantidade de dias úteis entre as datas

**⚠️ Observação:** A data final deve ser maior ou igual à data inicial, ou o retorno será zero.

**Exemplo:**

```lsp
Definir Funcao exemploRetornarDiasUteisPeriodo();

@ Variáveis globais @
Definir Data vdDataInicial;
Definir Data vdDataFinal;
Definir Numero vnQtdDiasUteis;
Definir Alfa vaQtdStr;

exemploRetornarDiasUteisPeriodo();

Funcao exemploRetornarDiasUteisPeriodo(); {
  @ Define período de exemplo (21/06/2024 a 18/08/2024) @
  vdDataInicial = CodData(21, 6, 2024);
  vdDataFinal = CodData(18, 8, 2024);
  
  @ Calcula quantidade de dias úteis no período @
  RetornarDiasUteisPeriodo(vdDataInicial, vdDataFinal, vnQtdDiasUteis);
  
  @ Converte para string para exibição @
  IntParaAlfa(vnQtdDiasUteis, vaQtdStr);
  
  Definir Alfa vaMensagem;
  vaMensagem = "Dias úteis no período: " + vaQtdStr;
  Mensagem(Retorna, vaMensagem);
}
```

### RetornarQtdDiasAno

Retorna a quantidade de dias do ano tomando como base o ano da data passada, considerando diferentes tipos de ano.

**Sintaxe:**

```lsp
RetornarQtdDiasAno(<aData>, <aTipoAno>, <aQtdDiasAno>);
```

**Parâmetros:**

- `aData`: Variável do tipo Data que recebe a data base
- `aTipoAno`: Variável numérica que indica o tipo de ano:
  - 0: Ano Útil - considera 252 dias
  - 1: Ano Comercial - considera 360 dias
  - 2: Ano Civil - considera 365 ou 366 dias (ano bissexto)
- `aQtdDiasAno`: Variável numérica que retorna a quantidade de dias do ano

**Exemplo:**

```lsp
Definir Funcao exemploRetornarQtdDiasAno();

@ Variáveis globais @
Definir Data vdData;
Definir Numero vnDiasUtil;
Definir Numero vnDiasComercial;
Definir Numero vnDiasCivil;
Definir Alfa vaDiasUtilStr;
Definir Alfa vaDiasComercialStr;
Definir Alfa vaDiasCivilStr;

exemploRetornarQtdDiasAno();

Funcao exemploRetornarQtdDiasAno(); {
  @ Define uma data de exemplo (02/07/2024) @
  vdData = CodData(2, 7, 2024);
  
  @ Obtém quantidade de dias para cada tipo de ano @
  RetornarQtdDiasAno(vdData, 0, vnDiasUtil);       @ Ano útil @
  RetornarQtdDiasAno(vdData, 1, vnDiasComercial);  @ Ano comercial @
  RetornarQtdDiasAno(vdData, 2, vnDiasCivil);      @ Ano civil @
  
  @ Converte para string para exibição @
  IntParaAlfa(vnDiasUtil, vaDiasUtilStr);
  IntParaAlfa(vnDiasComercial, vaDiasComercialStr);
  IntParaAlfa(vnDiasCivil, vaDiasCivilStr);
  
  Definir Alfa vaMensagem;
  vaMensagem = "Dias úteis no ano: " + vaDiasUtilStr;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Dias comerciais no ano: " + vaDiasComercialStr;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Dias civis no ano: " + vaDiasCivilStr;
  Mensagem(Retorna, vaMensagem);
}
```

### UltimoDia

Verifica qual é o último dia do mês/ano da data informada.

**Sintaxe:**

```lsp
UltimoDia(<DatAtu>);
```

**Parâmetros:**

- `DatAtu`: Campo/Variável numérica da qual se deseja saber o último dia do mês

**⚠️ Observação:** Não pode ser campo do sistema ou de tabela, pois o retorno é na própria variável.

**Exemplo:**

```lsp
Definir Funcao exemploUltimoDia();

@ Variáveis globais @
Definir Numero vnData;
Definir Alfa vaDataOriginal;
Definir Alfa vaDataUltimoDia;

exemploUltimoDia();

Funcao exemploUltimoDia(); {
  @ Define uma data de exemplo (20/12/2024) @
  vaDataOriginal = "20/12/2024";
  ConvDataInt(vaDataOriginal, vnData);
  
  @ Aplica a função UltimoDia @
  UltimoDia(vnData);
  
  @ Converte o resultado para string @
  ConvDataExt(vnData, vaDataUltimoDia);
  
  Definir Alfa vaMensagem;
  vaMensagem = "Data original: " + vaDataOriginal;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Último dia do mês: " + vaDataUltimoDia;
  Mensagem(Retorna, vaMensagem);
  @ Resultado esperado: 31/12/2024 @
}
```

**Exemplo Prático Completo - Sistema de Controle de Prazos:**

```lsp
Definir Funcao sistemaControlePrazos();

@ Variáveis globais @
Definir Data vdDataBase;
Definir Numero vnDiaSemana;
Definir Numero vnDataUtilAnt;
Definir Numero vnDataUtilPos;
Definir Numero vnDiasUteisRestantes;
Definir Numero vnCEP;
Definir Alfa vaMensagemStatus;

sistemaControlePrazos();

Funcao sistemaControlePrazos(); {
  @ Obtém a data atual @
  DataHoje(vdDataBase);
  vnCEP = 89107000;  @ CEP de exemplo @
  
  @ Verifica se hoje é dia útil @
  Definir Numero vnDataAtual;
  vnDataAtual = vdDataBase;
  RetDiaUtilAntPos(vnDataAtual, vnCEP, vnDataUtilAnt, vnDataUtilPos);
  
  @ Verifica o dia da semana @
  RetDiaSemana(vnDataAtual, vnDiaSemana);
  
  @ Calcula dias úteis restantes no mês @
  Definir Numero vnDiasUteisTotal;
  Definir Numero vnDiasUteisAteHoje;
  RetornarDiasUteisMes(vdDataBase, 0, vnDiasUteisTotal);
  RetornarDiasUteisMes(vdDataBase, 1, vnDiasUteisAteHoje);
  vnDiasUteisRestantes = vnDiasUteisTotal - vnDiasUteisAteHoje;
  
  @ Monta relatório @
  Se (vnDataAtual = vnDataUtilAnt) {
    vaMensagemStatus = "Hoje é dia útil!";
  } Senao {
    vaMensagemStatus = "Hoje NÃO é dia útil.";
  }
  
  Mensagem(Retorna, vaMensagemStatus);
  
  Definir Alfa vaTemp;
  IntParaAlfa(vnDiasUteisRestantes, vaTemp);
  vaMensagemStatus = "Dias úteis restantes no mês: " + vaTemp;
  Mensagem(Retorna, vaMensagemStatus);
}
```

#### Formatar

Formata números de acordo com os parâmetros definidos. O formato é o mesmo usado no Borland Delphi 2.0.

**Sintaxe:**

```lsp
<variável> = Formatar(<dado>, "<formato>");
```

**Parâmetros:**

- `dado`: Variável tipo numérica a ser convertida
- `formato`: Formato de conversão. Por exemplo, %3.0f para converter o valor 354 e %3.2f para converter o valor 345,43

**Exemplo:**

```lsp
Definir Alfa vaFmt;
vaFmt = Formatar(123, "%s");
```

#### FormatarN

Formata números com casas decimais de acordo com os parâmetros definidos. O formato é o mesmo usado no Borland Delphi 2.0.

**Sintaxe:**

```lsp
FormatarN(<dado>, "<formato>", "<separador decimal>", <variável>);
```

**Parâmetros:**

- `dado`: Variável tipo numérica a ser convertida
- `formato`: Formato de conversão
- `separador decimal`: Qual será o separador de casas decimais
- `variável`: Armazena o resultado da formatação

**Exemplo:**

```lsp
Definir Alfa vaFmt;
FormatarN(123, "%3.2f", ".", vaFmt);
```

### Arrays e Listas

#### LimpaGerTabAlf

Limpa o conteúdo do Registro GerTabAlf.

**Sintaxe:**

```lsp
LimpaGerTabAlf();
```

**Exemplo:**

```lsp
GerTabAlf[1] = "xxx";
LimpaGerTabAlf();
@ Todos os elementos do GerTabAlf serão limpos @
```

#### LimpaGerTabNum

Limpa o conteúdo do Registro GerTabNum.

**Sintaxe:**

```lsp
LimpaGerTabNum();
```

**Exemplo:**

```lsp
GerTabNum[1] = 1;
LimpaGerTabNum();
@ Todos os elementos do GerTabNum serão limpos @
```

**⚠️ Observação sobre Arrays:** A estrutura do GerTabAlf e GerTabNum não permite múltiplos arrays simultâneos. Como fica em memória, não é possível atribuir valores diferentes para o mesmo indexador. Para trabalhar com múltiplos arrays, é necessário vincular valores diferentes em indexadores diferentes ou considerar o uso de listas dinâmicas.

### Validação e Comparação de Datas

**Exemplo de Sistema de Validação:**

```lsp
Definir Funcao validarPeriodo();

@ Variáveis globais @
Definir Data vdDataInicio;
Definir Data vdDataFim;
Definir Data vdDataAtual;
Definir Numero vnDiaInicio;
Definir Numero vnMesInicio;
Definir Numero vnAnoInicio;
Definir Numero vnDiaFim;
Definir Numero vnMesFim;
Definir Numero vnAnoFim;

@ Período de exemplo @
vnDiaInicio = 1;
vnMesInicio = 1;
vnAnoInicio = 2024;
vnDiaFim = 31;
vnMesFim = 12;
vnAnoFim = 2024;

validarPeriodo();

Funcao validarPeriodo(); {
  @ 1. Monta as datas @
  vdDataInicio = CodData(vnDiaInicio, vnMesInicio, vnAnoInicio);
  vdDataFim = CodData(vnDiaFim, vnMesFim, vnAnoFim);
  DataHoje(vdDataAtual);
  
  @ 2. Validações @
  Se (vdDataInicio > vdDataFim) {
    Mensagem(Erro, "Data inicial não pode ser maior que a final!");
  } Senao Se (vdDataFim < vdDataAtual) {
    Mensagem(Erro, "Período já expirado!");
  } Senao Se (vdDataInicio > vdDataAtual) {
    Mensagem(Retorna, "Período ainda não iniciado");
  } Senao Se ((vdDataAtual >= vdDataInicio) e (vdDataAtual <= vdDataFim)) {
    Mensagem(Retorna, "Período ativo");
  } Senao {
    Mensagem(Retorna, "Fora do período");
  }
}
```
