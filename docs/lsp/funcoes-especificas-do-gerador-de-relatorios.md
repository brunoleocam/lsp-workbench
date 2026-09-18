# Funções Específicas do Gerador de Relatórios

As funções específicas do Gerador de Relatórios são utilizadas para manipular controles, SQL, imagens, gráficos e outros elementos específicos dos relatórios no sistema Senior. Estas funções permitem customização avançada dos modelos de relatório.

### **Controles de Grade**

#### **AdicionaDadosGrade**

Adiciona ou define texto em uma célula específica de um controle tipo grade.

**Sintaxe:**

```lsp
AdicionaDadosGrade(Alfa ControlName, Numero Linha, Numero Coluna, Alfa Texto);
```

**Parâmetros:**

- `ControlName`: Nome do controle tipo grade onde será adicionada/setada a linha ou coluna
- `Linha`: Número da linha onde será adicionado/setado o texto
- `Coluna`: Número da coluna onde será adicionado/setado o texto
- `Texto`: Texto a ser adicionado/setado

**Exemplo:**

```lsp
AdicionaDadosGrade("Grade001", 2, 1, "Quarto teste da grade.");
AdicionaDadosGrade("Grade001", 2, 2, "Gestão Empresarial | ERP da Senior Sistemas.");
AdicionaDadosGrade("Grade001", 2, 3, "Inconstitucionalicimamentemente.");
AdicionaDadosGrade("Grade001", 3, 1, "Sétimo teste para ver se imprime certo.");
AdicionaDadosGrade("Grade001", 3, 2, "Oitavo");
AdicionaDadosGrade("Grade001", 3, 3, "Nono");
```

**⚠️ Observação:** Se a propriedade "Tamanho Automático" estiver definida como FALSO e a linha ou coluna adicionada for maior que a configurada para o controle, aparecerá uma mensagem informando erro na execução do evento. Se estiver como VERDADEIRO, a quantidade de linhas e colunas será calculada automaticamente.

#### **LimpaDadosGrade**

Limpa todos os dados de um controle tipo grade.

**Sintaxe:**

```lsp
LimpaDadosGrade(Alfa ControlName);
```

**Parâmetros:**

- `ControlName`: Nome do controle tipo GRADE que se deseja limpar os dados

**Exemplo:**

```lsp
LimpaDadosGrade("Grade001");
```

**⚠️ Observação:** Se a propriedade "Tamanho Automático" estiver definida como VERDADEIRO, a quantidade de linhas e colunas será zerada e será recalculada quando as linhas e colunas forem adicionadas novamente.

#### **TruncaDadosGrade**

Permite que o dado de uma determinada célula seja truncado, evitando a quebra de linha.

**Sintaxe:**

```lsp
TruncaDadosGrade(Alfa ControlName, Numero Linha, Numero Coluna);
```

**Parâmetros:**

- `ControlName`: Nome do controle grade que será truncado
- `Linha`: Número da linha da célula a ser truncada
- `Coluna`: Número da coluna da célula a ser truncada

**Exemplo:**

```lsp
TruncaDadosGrade("Grade001", 2, 1);
```

### **Controles de Imagem**

#### **CarregaImagemControle**

Carrega uma imagem do tipo .BMP ou .JPG a partir de um arquivo ou banco de dados.

**Sintaxe:**

```lsp
CarregaImagemControle(Alfa NomeDoControle, Numero ArquivoOuBanco, Alfa CaminhoOuCampo, Alfa SQL);
```

**Parâmetros:**

- `NomeDoControle`: Nome do controle do modelo ao qual se quer carregar a imagem
- `ArquivoOuBanco`: 0 para carregar a partir de arquivo ou 1 para carregar do banco de dados
- `CaminhoOuCampo`: Caminho do arquivo ou TABELA.CAMPO (se do banco)
- `SQL`: Condição WHERE para busca da imagem no banco (somente se ArquivoOuBanco = 1)

**Exemplos:**

```lsp
@ Carregando a partir de um endereço @
CarregaImagemControle("Imagem001", 0, "c:\\ICO.ICO", "");
CarregaImagemControle("Imagem002", 0, "\\\\Micro01\\temp\\JPG.JPG", "");

@ Carregando do banco @
CarregaImagemControle("Imagem001", 1, "R034FOT.FotEmp", "NUMCAD = 321");

@ Carregando dinamicamente @
Definir Alfa VEndFot;
VEndFot = E075FOT.EndFot;
EstaNulo(VEndFot, VRet);
Se (VRet = 0) {
  @ Se estiver gravado apenas o caminho da imagem no banco @
  CarregaImagemControle("Imagem001", 0, VEndFot, "");
} Senao {
  @ Se a imagem estiver gravada no banco @
  CarregaImagemControle("Imagem001", 1, "E075FOT.ImgFot", "");
}
```

#### **CarregaImgControle**

Carrega uma imagem do banco, arquivo ou variável para um controle imagem do modelo.

**Sintaxe:**

```lsp
CarregaImgControle(Alfa NomeDoControleImagem, Numero Arquivo0Banco1Variavel2, Alfa CaminhoCampoNome, Alfa SQL, Numero SqlSenior2);
```

**Parâmetros:**

- `NomeDoControleImagem`: Nome do controle imagem do modelo
- `Arquivo0Banco1Variavel2`:
  - 0: Carrega de arquivo (ex: c:\Fig.BMP)
  - 1: Carrega do banco do campo especificado
  - 2: Carrega de variável de sistema (ICO, BMP ou EMF)
- `CaminhoCampoNome`: Caminho do arquivo, tabela.campo ou nome da variável
- `SQL`: Cláusula WHERE para busca da imagem da tabela
- `SqlSenior2`: 0 para SQL Senior 1, 1 para SQL Senior 2

**Exemplos:**

```lsp
@ Imagem BMP a partir de um arquivo @
CarregaImgControle("Imagem001", 0, "C:\\temp\\Teste.BMP", "", 0);

@ Imagem a partir do banco @
Definir Alfa xSQL;
Definir Alfa P1, P2, P3, D1;
IntParaAlfa(R034FOT.NUMEMP, P1);
IntParaAlfa(R034FOT.TIPCOL, P2);
IntParaAlfa(R034FOT.NUMCAD, P3);
ConverteDataBanco(R034FOT.DATFOT, D1);
xSQL = "R034FOT.NUMEMP = " + P1 + " AND R034FOT.TIPCOL = " + P2 + " AND R034FOT.NUMCAD = " + P3 + " AND R034FOT.DATFOT = " + D1;
CarregaImgControle("Imagem002", 1, "R034FOT.FotEmp", xSQL, 1);

@ Imagem ICO a partir de uma variável @
CarregaImgControle("Imagem002", 2, "ImgICOGerador", "", 0);

@ Imagem EMF a partir de uma variável @
CarregaImgControle("Imagem003", 2, "ImgEMFGerador", "", 0);
```

#### **CarregaImgVetorialControle**

Carrega uma imagem DXF a partir de um arquivo para o controle Imagem e ImagemVetorial do modelo.

**Sintaxe:**

```lsp
CarregaImgVetorialControle(Alfa NomeDoControleImagem, Alfa Caminho, Numero Xms, Numero Xmx);
```

**Parâmetros:**

- `NomeDoControleImagem`: Nome do controle imagem do modelo
- `Caminho`: Caminho físico do arquivo (local ou na rede)
- `Xms`: Tamanho em MB da heap mínimo Java (0 para valores padrões)
- `Xmx`: Tamanho máximo em MB da heap Java (0 para valores padrões)

**⚠️ Observações:**

- Tamanho automático deve estar definido como Falso
- Centralizado deve estar definido como Verdadeiro
- Ampliar deve estar definido como Verdadeiro
- O controle não deve possuir Tabela/Campo ou Conexão
- O controle não deve possuir imagem de Transparência
- Esta função não suporta cor de fundo, o fundo sempre será Branco

### **Controles de Gráfico**

#### **ConfiguraPontoGrafico**

Configura pontos em gráficos de figuras variáveis (linhas) antes de adicionar valores.

**Sintaxe:**

```lsp
ConfiguraPontoGrafico(Alfa ControlName, Alfa Caractere, Numero TipoPonto, Numero IndiceFigura, Numero Interrompido);
```

**Parâmetros:**

- `ControlName`: Nome do controle gráfico do modelo
- `Caractere`: Caractere que será colocado no ponto do gráfico
- `TipoPonto`:
  - 1: Tipo Caractere (IndiceFigura será ignorado)
  - 0: Tipo Padrão (ponto padrão cadastrado, Caractere e IndiceFigura ignorados)
  - 2: Tipo Figura (Caractere será ignorado)
- `IndiceFigura`: Número da figura cadastrada para o tipo de gráfico
- `Interrompido`:
  - 1: Terá linha de ligação com outros pontos
  - 0: Não terá linha de ligação

**Exemplo:**

```lsp
@ Configuração dos pontos no gráfico @
CRea.SQL "SELECT INDMAS,INDRES,INDTES FROM R108REA WHERE NUMEMP = :xNumEmp AND CODFIC = :xCodFic AND CODEXA = :xCodExa AND DATSOL = :xDatSol AND SEQIEX = :xSeqIex";
CRea.AbrirCursor();
Se (CRea.Achou) {
  Componente = "FEXA" + R108IEX.IndOre + R108IEX.IndExa;
  Se ((R108IEX.IndOre = "D") E (R108IEX.IndExa = "A")) {
    Se (CRea.IndTes = "N") {
      ConfiguraPontoGrafico(Componente, " ", 1, 0, 0);
    } Senao {
      Se ((CRea.IndRes = "S") E (CRea.IndMas = "N")) {
        ConfiguraPontoGrafico(Componente, " ", 2, 0, 1);
      } Senao {
        Se ((CRea.IndRes = "S") E (CRea.IndMas = "S")) {
          ConfiguraPontoGrafico(Componente, " ", 2, 1, 1);
        } Senao {
          Se ((CRea.IndRes = "N") E (CRea.IndMas = "N")) {
            ConfiguraPontoGrafico(Componente, " ", 2, 2, 0);
          } Senao {
            Se ((CRea.IndRes = "N") E (CRea.IndMas = "S")) {
              ConfiguraPontoGrafico(Componente, " ", 2, 3, 0);
            }
          }
        }
      }
    }
  }
}
CRea.FecharCursor();
```

#### **LimpaDadosGrafico**

Zera e reutiliza um componente do tipo gráfico no mesmo relatório.

**Sintaxe:**

```lsp
LimpaDadosGrafico(Alfa ControlName);
```

**Parâmetros:**

- `ControlName`: Nome do controle tipo GRAFICO que se deseja limpar os dados

**Exemplo:**

```lsp
LimpaDadosGrafico("Grafico001");
```

### **Manipulação de Controles**

#### **AlteraControle**

Permite alterar o conteúdo de algumas propriedades dos controles.

**Sintaxe:**

```lsp
AlteraControle("Nome do Controle", "Propriedade", "Parametro");
```

**Parâmetros:**

- `Nome do Controle`: Nome do controle entre aspas duplas
- `Propriedade`: Nome da propriedade entre aspas duplas
- `Parametro`: Valor que a propriedade vai assumir

**Propriedades Suportadas:**

| **Propriedade** | **Parâmetros** |
|-----------------|----------------|
| **Descrição** | Cadeia de caracteres desejada |
| **Alinhamento** | Esquerda, Centro ou Direita |
| **Cor** | Nome da cor ou notação hexadecimal ($FF0000 ou #FF0000) |
| **Fonte** | NomeFonte;Estilo;Tamanho;Cor |
| **Tam.Automático** | Verdadeiro ou Falso |
| **Salto Página** | Sim ou Não |
| **Imprimir** | Verdadeiro ou Falso |
| **Edição Campo** | Edição do campo vide tipos de edição |
| **Transparente** | Verdadeiro ou Falso |
| **Imprimir Seção Vazia** | Verdadeiro ou Falso |
| **Conf. Gráfico** | Pano Fundo;Verdadeiro/Falso |
| **Justificado** | Verdadeiro; Falso; Nenhum; Modo 1; Modo 2 |

**Exemplos:**

```lsp
AlteraControle("Subtitulo2", "Salto Página", "Não");
AlteraControle("Desenho001", "Configurar Desenho", "Desenho=1;Cor Textura=$005E20;Cor Linha=Preto;Espessura=2");
AlteraControle("Grafico001", "Conf. Gráfico", "Pano Fundo;Verdadeiro");
AlteraControle("Grafico001", "Conf. Gráfico", "Pano Fundo;Falso");
```

**⚠️ Observação sobre Cores:** Quando utilizada cor em notação hexadecimal, ela não segue o formato RGB(Red, Green, Blue), mas sim BGR(Blue, Green, Red). Por exemplo, a cor vermelha em RGB é #FF0000 enquanto em BGR #0000FF.

#### **AlteraValorFormula**

Altera o valor de um controle fórmula pelo seu nome.

**Sintaxe:**

```lsp
AlteraValorFormula(Alfa NomeFormula, Numero Valor);
```

**Parâmetros:**

- `NomeFormula`: O nome do controle fórmula
- `Valor`: O novo valor do controle fórmula

**Exemplo:**

```lsp
Definir Alfa vNome;
Definir Numero vValor;
Definir Numero vOption;

vOption = 3;

@ O nome do controle e o valor serão definidos dinamicamente @
Se (vOption = 1) {
  vNome = "Formula001";
  vValor = 1;
} Senao {
  Se (vOption = 2) {
    vNome = "Formula002";
    vValor = 2;
  } Senao {
    vNome = "Formula003";
    vValor = 3;
  }
}

AlteraValorFormula(vNome, vValor);
```

### **Controle de Execução**

#### **CancelarRelatorio**

Cancela o relatório que está sendo executado.

**Sintaxe:**

```lsp
CancelarRelatorio();
```

**⚠️ Observação:** Nas regras de Inicialização e Pré-Seleção, esta função não cancela a execução, pois ela ainda não foi iniciada.

### **Manipulação de Datas**

#### **DataInicialFinal**

Retorna o início e o fim de um período.

**Sintaxe:**

```lsp
DataInicialFinal(Data pDatAtu, Numero pTipDat, Data pDatRef, Data End pDatIni, Data End pDatFim);
```

**Parâmetros:**

- `pDatAtu`: Data referência para o período
- `pTipDat`: Tipo do período:
  - 0: Início e fim iguais à data referência
  - 1: Primeiro e último dia da semana (pDatRef = primeiro dia da semana)
  - 2: Se dia < 15: 1º até 15, senão 16 até último dia do mês
  - 3: 1º até último dia do mês
  - 4: Período de 2 meses
  - 5: Período de 3 meses
  - 6: Período de 4 meses
  - 7: Período de 6 meses
  - 8: 1º de janeiro até 31 de dezembro do ano
- `pDatRef`: Usado quando pTipDat = 1, representa o primeiro dia da semana
- `pDatIni`: Início do período (retorno)
- `pDatFim`: Final do período (retorno)

**Exemplo:**

```lsp
Definir Alfa xDatIni;
Definir Alfa xDatFim;
Definir Numero xHoje;
Definir Data pDatIni;
Definir Data pDatFim;

DataHoje(xHoje);
DataInicialFinal(xHoje, 3, 0, pDatIni, pDatFim);
DataExtenso(pDatIni, xDatIni);
DataExtenso(pDatFim, xDatFim);
ValStr = "O mês atual começa em: " + xDatIni + " e termina em " + xDatFim;
Cancel(2);
```

#### **DateToDB**

Converte um valor do tipo data para uma variável alfa com uma data compatível com o banco de dados.

**Sintaxe:**

```lsp
DateToDB(Numero Date, Numero Native, Alfa End DateAlfa);
```

**Parâmetros:**

- `Date`: Data que deve ser convertida para alfa
- `Native`: Obsoleto, mantido apenas para compatibilidade
- `DateAlfa`: Retorno da função com data compatível com SQL nativo

**Exemplo:**

```lsp
Definir Alfa xData;
DateToDB(1234, 0, xData);
ValStr = "Data no Formato do Banco = " + xData;
Cancel(2);
```

### **Manipulação de SQL**

#### **CriaView**

Cria uma View temporária no banco para otimizar a execução do relatório.

**Sintaxe:**

```lsp
CriaView(Alfa SQL, Alfa End NomeView);
```

**Parâmetros:**

- `SQL`: SQL contendo todo o código (SELECT) da View a ser criada (formato SQLSenior2)
- `NomeView`: Retorna o nome temporário da View que foi criada

**Exemplo:**

```lsp
Definir Alfa xSql2;
Definir Alfa xNomeView2;

xSql2 = "SELECT NUMEMP, TIPCOL, NUMCAD, SUM(PROVEN) PROVEN, SUM(DESCON) DESCON FROM R034FUN GROUP BY NUMEMP, TIPCOL, NUMCAD";
CriaView(xSql2, xNomeView2);
```

**⚠️ Observação:** Após o término da execução do relatório, todas as Views criadas temporariamente serão excluídas automaticamente do banco.

#### **DeleteFieldSQL**

Retira um campo do SELECT da seção passada como parâmetro.

**Sintaxe:**

```lsp
DeleteFieldSQL(Alfa SectionName, Alfa TableFieldName);
```

**Parâmetros:**

- `SectionName`: Nome da seção que contém o SELECT onde o campo será excluído
- `TableFieldName`: Campo a ser excluído no padrão TABELA.CAMPO

**Exemplo:**

```lsp
InsClauSQLGroupBy("Detalhe_1", "NUMEMP, TIPCOL");
InsClauSQLCampoDireto("Detalhe_1", "Max(ValSal) ValorSal");
DeleteFieldSQL("Detalhe_1", "R034FUN.NUMCAD");
```

#### **InsClauSQLCampoDireto**

Insere um campo novo no SELECT que poderá ser utilizado para agrupamentos e outros tipos de funções.

**Sintaxe:**

```lsp
InsClauSQLCampoDireto(Alfa SectionName, Alfa CampoDireto);
```

**Parâmetros:**

- `SectionName`: Nome da seção onde será inserido o campo
- `CampoDireto`: Campo a ser inserido no SELECT

**Exemplo:**

```lsp
InsClauSQLCampoDireto("Detalhe_1", "Max(ValSal) ValorSal");
```

#### **InsClauSQLField**

Inclui um campo de tabela no código SQL montado pelo gerador.

**Sintaxe:**

```lsp
InsClauSQLField("Seção Detalhe", Variavel);
```

**Parâmetros:**

- `Seção Detalhe`: Nome da seção detalhe
- `Variavel`: Código SQL para inclusão dos campos de tabela

**Exemplo:**

```lsp
Definir Alfa xsql;
xsql = "CEPCLI AS E085CLI";
InsClauSQLField("Detalhe_Clientes", xsql);
```

**⚠️ Observação:** Esta função deve ser usada somente no evento da Pré-Seleção do modelo e utilizará sempre o SQL Senior 2.

#### **InsClauSQLFrom**

Inclui uma tabela no código SQL montado pelo gerador.

**Sintaxe:**

```lsp
InsClauSQLFrom("Seção Detalhe", Variavel);
```

**Parâmetros:**

- `Seção Detalhe`: Nome da seção Detalhe
- `Variavel`: Código SQL para inclusão da tabela

**Exemplo:**

```lsp
Definir Alfa xsql;
xsql = "E085CLI";
InsClauSQLFrom("Detalhe_Clientes", xsql);
```

**⚠️ Observação:** Esta função deve ser usada somente no evento da Pré-Seleção do modelo e utilizará sempre o SQL Senior 2.

#### **InsClauSQLGroupBy**

Insere uma cláusula GROUP BY no SELECT da seção passada como parâmetro.

**Sintaxe:**

```lsp
InsClauSQLGroupBy(Alfa SectionName, Alfa GroupByClau);
```

**Parâmetros:**

- `SectionName`: Nome da seção onde será inserida o GROUP BY
- `GroupByClau`: Cláusula a ser inserida

**Exemplo:**

```lsp
InsClauSQLGroupBy("Detalhe_1", "NUMEMP, TIPCOL, NUMCAD");
```

**⚠️ Observação:** Esta função utilizará sempre o SQL Senior 2, independente da configuração do modelo de relatório.

#### **InsClauSQLOrderBy**

Inclui uma cláusula de ordenação no código SQL montado pelo gerador.

**Sintaxe:**

```lsp
InsClauSQLOrderBy("Seção Detalhe", Variavel);
```

**Parâmetros:**

- `Seção Detalhe`: Nome da seção Detalhe
- `Variavel`: Código SQL para inclusão da cláusula de ordenação

**Exemplo:**

```lsp
Definir Alfa xsql;
xsql = "R034FUN.DatAdm Desc";
InsClauSQLOrderBy("Detalhe_Colaborador", xsql);
```

**⚠️ Observação:** Esta função utilizará sempre o SQL Senior 2 e deve ser usada somente no evento da Pré-Seleção do modelo.

#### **InsClauSQLWhere**

Inclui uma cláusula WHERE no código SQL montado pelo gerador.

**Sintaxe:**

```lsp
InsClauSQLWhere("Seção Detalhe", Variavel);
```

**Parâmetros:**

- `Seção Detalhe`: Nome da seção Detalhe
- `Variavel`: Código SQL para inclusão da cláusula WHERE

**Exemplo:**

```lsp
Definir Alfa xsql;
xsql = "R034FUN.SITAFA <> 7";
InsClauSQLWhere("Detalhe_Clientes", xsql);
```

**⚠️ Observação:** Esta função deve ser usada somente no evento da Pré-Seleção do modelo e utilizará sempre o SQL Senior 2.

#### **InsSQLWhereSimples**

Insere uma cláusula WHERE dentro de um SQL durante a execução da regra de pré-seleção.

**Sintaxe:**

```lsp
InsSQLWhereSimples("Seção Detalhe", Variavel);
```

**Parâmetros:**

- `Seção Detalhe`: Nome da seção Detalhe
- `Variavel`: Código SQL para inclusão da cláusula WHERE

**Exemplo:**

```lsp
Definir Alfa vDatStr;
Definir Alfa xsql;

ConverteDataBanco(EDatRef, vDatStr);
xsql = " AND EXISTS(SELECT 1 FROM R040PRG A WHERE A.NUMEMP = R040PER.NUMEMP AND A.TIPCOL = R040PER.TIPCOL AND A.NUMCAD = R040PER.NUMCAD AND A.INIPER = R040PER.INIPER AND A.PRGDAT >= " + vDatStr + ")";
InsSQLWhereSimples("Detalhe_1", xsql);
```

**⚠️ Observação:** Esta função utilizará sempre o SQL Senior 2 e as tabelas referenciadas no SQL não são incluídas na cláusula FROM.

#### **SubstituiFrom**

Substitui uma cláusula FROM no SELECT da seção passada como parâmetro.

**Sintaxe:**

```lsp
SubstituiFrom(Alfa SectionName, Alfa NovaClausula, Alfa TabelaSubstituida);
```

**Parâmetros:**

- `SectionName`: Nome da seção onde será substituída o FROM
- `NovaClausula`: Cláusula que irá substituir o FROM atual
- `TabelaSubstituida`: Nome da tabela que será substituída (opcional)

**Junções Suportadas:**

- CROSS JOIN (Produto Cartesiano)
- INNER JOIN (Junção)
- LEFT OUTER JOIN (Junção Externa a Esquerda)
- RIGHT OUTER JOIN (Junção Externa a Direita)
- NATURAL JOIN (Junção Natural)
- KEYED JOIN (Junção por Chave)

**Exemplos:**

```lsp
@ Cross Join @
SubstituiFrom("Detalhe_1", "(R034FUN CROSS JOIN R036DEP)", "");

@ Inner Join @
SubstituiFrom("Detalhe_1", "(R034FUN INNER JOIN R036DEP ON R034FUN.NUMEMP = R036DEP.NUMEMP)", "");

@ Left Outer Join @
SubstituiFrom("Detalhe_1", "(R034FUN LEFT OUTER JOIN R036DEP ON R034FUN.NUMEMP = R036DEP.NUMEMP AND R034FUN.NUMCAD = R036DEP.NUMCAD)", "");

@ Right Outer Join @
SubstituiFrom("Detalhe_1", "(R034FUN RIGHT OUTER JOIN R036DEP ON R034FUN.NUMEMP = R036DEP.NUMEMP AND R034FUN.NUMCAD = R036DEP.NUMCAD)", "");

@ Natural Inner Join @
SubstituiFrom("Detalhe_1", "(R034FUN NATURAL INNER JOIN R036DEP ON R034FUN.NUMEMP = R036DEP.NUMEMP)", "");

@ Keyed Join @
SubstituiFrom("Detalhe_1", "(R034FUN KEYED INNER JOIN R030EMP)", "");
```

### **Manipulação de Listas e Campos**

#### **DesCamLista**

Permite pegar a descrição de um campo lista.

**Sintaxe:**

```lsp
DesCamLista(Alfa TabelaCampo, Alfa Item, Alfa End Descricao);
```

**Parâmetros:**

- `TabelaCampo`: Nome da Tabela/Campo entre aspas
- `Item`: Valor do Item na lista entre aspas
- `Descricao`: Variável alfa com a descrição do campo da lista

**Exemplo:**

```lsp
Definir Alfa Strdescr;
DesCamLista("R034FUN.TIPCOL", "1", Strdescr);
@ Strdescr conterá "Colaborador" @
```

#### **DetPrimConector**

Permite determinar qual será o primeiro conector a ser inserido para concatenar na cláusula WHERE.

**Sintaxe:**

```lsp
DetPrimConector(Alfa Seção, Alfa Operador);
```

**Parâmetros:**

- `Seção`: Nome da seção entre aspas
- `Operador`: Nome do operador entre aspas

**Exemplo:**

```lsp
DetPrimConector("Detalhe_1", " OR");
```

#### **InsEspAlinhDireita**

Insere espaços a direita de todos os controles no modelo.

**Sintaxe:**

```lsp
InsEspAlinhDireita(Numero Valor);
```

**Parâmetros:**

- `Valor`: Quantos espaços serão inseridos a direita do controle

**Exemplo:**

```lsp
InsEspAlinhDireita(1);
```

**⚠️ Observação:** Deve ser usada somente no evento da Pré-Seleção do modelo.

### **Históricos**

#### **MontarSQLHisCampo**

Monta o comando SQL para consulta em tabelas de histórico que não possuem sequência.

**Sintaxe:**

```lsp
MontarSQLHisCampo(Alfa NomeTabela, Alfa CampoTabela, Alfa End SQLMontado);
```

**Parâmetros:**

- `NomeTabela`: Nome da tabela
- `CampoTabela`: Nome do campo da tabela
- `SQLMontado`: Retorno da função (cláusula SQL)

**Exemplo:**

```lsp
Definir Alfa xauxsql;
MontarSQLHisCampo("R038HLO", "DatAlt", xauxsql);
```

#### **MontarSQLHisCampoSeq**

Monta o comando SQL para consulta em tabelas de histórico que possuem sequência.

**Sintaxe:**

```lsp
MontarSQLHisCampoSeq(Alfa Tabela, Alfa Campo, Alfa End SQLMontado);
```

**Parâmetros:**

- `Tabela`: Nome da tabela
- `Campo`: Nome do campo da tabela
- `SQLMontado`: Retorno da função (cláusula SQL)

**Exemplo:**

```lsp
Definir Alfa xauxsql;
MontarSQLHisCampoSeq("R038HSA", "DatAlt", xauxsql);
```

#### **MontarSQLHistorico**

Monta o comando SQL para uso com os históricos do sistema, com base em uma data.

**Sintaxe:**

```lsp
MontarSQLHistorico(Alfa Tabela, Data Data, Alfa End Xretorno);
```

**Parâmetros:**

- `Tabela`: Nome da tabela
- `Data`: Data do histórico
- `Xretorno`: Variável alfanumérica que conterá o SQL montado

**Exemplo:**

```lsp
Definir Alfa xdatref;
Definir Alfa auxsql;
Definir Data EDatRef;

EDatRef = FimCmp;
ConverteDataBanco(EDatRef, xdatref);

@ Relacionamento Histórico de Local @
auxsql = " ";
MontarSQLHistorico("R038HLO", EDatRef, auxsql);
InsClauSQLWhere("Detalhe_Aposentados", auxsql);
```

#### **MontarSQLHistoricoSeq**

Monta o comando SQL para uso com os históricos do sistema, com base em uma data e sequência.

**Sintaxe:**

```lsp
MontarSQLHistoricoSeq(Alfa Tabela, Data Data, Alfa End Xretorno);
```

**Parâmetros:**

- `Tabela`: Nome da tabela
- `Data`: Data do histórico
- `Xretorno`: Variável alfanumérica que conterá o SQL montado

**Exemplo:**

```lsp
@ Relacionamento Histórico Tipo Salário (DINÂMICO) @
Se (EAbrTsa <> "") {
  @ Monta a restrição para data de alteração @
  MontarSQLHistoricoSeq("R038HSA", EDatRef, AuxSQLHist);
  
  @ Monta a restrição para campo de abrangência @
  MontaAbrangencia("R038HSA.TipSal", EAbrTsa, AuxSQLAbr);
  
  AuxSql = AuxRelac + " R038HSA.NUMEMP = R034FUN.NUMEMP " + " AND R038HSA.TIPCOL = R034FUN.TIPCOL " + " AND R038HSA.NUMCAD = R034FUN.NUMCAD " + " AND " + AuxSQLHist + " AND " + AuxSQLAbr;
  
  InsClauSQLWhere("Detalhe_1", AuxSql);
  AuxRelac = " AND ";
}
```

### **Controle de Páginas**

#### **PreenchePagina**

Determina que uma página seja preenchida com rasuras.

**Sintaxe:**

```lsp
PreenchePagina(Numero Formato, Numero FormatoLinha, Numero GrossuraLinha, Alfa CorLinha, Alfa CorTextura);
```

**Parâmetros:**

- `Formato`: Valor numérico entre 0 e 8
- `FormatoLinha`: Valor numérico entre 0 e 7
- `GrossuraLinha`: Valor numérico
- `CorLinha`: Nome da cor
- `CorTextura`: Nome da cor da textura entre aspas

**Exemplo:**

```lsp
PreenchePagina(8, 1, 2, "", "Preto");
ListaSecao("Adicional_Salto_Pagina");
```

#### **ProximaPagina**

Permite verificar se uma determinada seção será impressa na próxima página.

**Sintaxe:**

```lsp
ProximaPagina(Alfa Secao, Numero End Retorno);
```

**Parâmetros:**

- `Secao`: Nome da seção a ser verificada
- `Retorno`: Retorna 1 quando a seção será impressa na próxima página, e 0 quando não será

**Exemplo:**

```lsp
Definir Numero RetProx;
ProximaPagina("Subtitulo_Horario", RetProx);
Se (RetProx = 1) {
  ListaSecao("Adicional_Saltar");
}
```

#### **SaltarPagina**

Salta de página manualmente.

**Sintaxe:**

```lsp
SaltarPagina();
```

### **Controle de Impressão**

#### **SelecionaImpressora**

Define a impressora padrão para o modelo.

**Sintaxe:**

```lsp
SelecionaImpressora(Alfa pNomeImp);
```

**Parâmetros:**

- `pNomeImp`: Nome/modelo da impressora a ser usada

**Exemplo:**

```lsp
SelecionaImpressora("HP DEKJET 660C");
```

### **Funções de Verificação**

#### **CodigoEspNivel**

Retorna o código especial de acordo com um determinado nível.

**Sintaxe:**

```lsp
CodigoEspNivel(Numero Nivel, Alfa End CodigoNivel);
```

**Parâmetros:**

- `Nivel`: Nível do código que deve ser retornado
- `CodigoNivel`: Retorno da função com o código do nível

**Exemplo:**

```lsp
Definir Alfa xCod;
x = esplevel;
CodigoEspNivel(x, xCod);
ValStr = xCod;
Cancel(2);
```

#### **OrdenacaoSelecionada**

Permite saber qual a ordenação variável selecionada.

**Sintaxe:**

```lsp
OrdenacaoSelecionada(Alfa SelectionName, Alfa End Ordenacao);
```

**Parâmetros:**

- `SelectionName`: Nome da seção
- `Ordenacao`: Variável alfanumérica que conterá o nome da ordenação variável selecionada

**Exemplo:**

```lsp
Definir Alfa pOrdenacao;
OrdenacaoSelecionada("Detalhe_1", pOrdenacao);
Se (pOrdenacao <> "Cadastro") {
  Cancel(1);
}
```

#### **UltimoRegistro**

Verifica se o registro que está sendo listado na seção detalhe é o último elemento.

**Sintaxe:**

```lsp
UltimoRegistro("Seção Detalhe", Numero Retorno);
```

**Parâmetros:**

- `Seção Detalhe`: Nome da seção Detalhe desejada
- `Retorno`: Retorna 0 caso não seja o último registro, ou 1 caso seja o último

**Exemplo:**

```lsp
Definir Numero xvalor;
UltimoRegistro("Detalhe_Clientes", xvalor);
Se (xvalor = 0) {
  @ Comandos @
}
```

### **Views Temporárias**

#### **RetornaCampoAlfaTabela**

Busca o conteúdo atual de um campo alfanumérico de uma VIEW temporária.

**Sintaxe:**

```lsp
RetornaCampoAlfaTabela(Alfa NomeCampo, Alfa NomeTabelaView, Alfa OpcionalWhere, Alfa End pRetorno, Numero End pAchou);
```

**Parâmetros:**

- `NomeCampo`: Nome do campo da View a ser retornado
- `NomeTabelaView`: Nome da View temporária
- `OpcionalWhere`: Cláusula WHERE de filtro (opcional)
- `pRetorno`: Variável onde o conteúdo buscado será retornado
- `pAchou`: Retorna 0 caso tenha encontrado resultados, ou 1 caso não tenha encontrado

**Exemplo:**

```lsp
Definir Alfa xNomeView;
Definir Alfa xRetorno;
Definir Numero xAchou;
Definir Alfa xSQL;

xSQL = "SELECT UPPER(NOMFUN) NOMMAISC FROM R034FUN WHERE NUMCAD = 1";
CriaView(xSQL, xNomeView);
RetornaCampoAlfaTabela("NOMMAISC", xNomeView, "", xRetorno, xAchou);

Se (xAchou = 0) {
  ValStr = xRetorno;
} Senao {
  ValStr = "";
  Cancel(2);
}
```

#### **RetornaCampoNumeroTabela**

Busca o conteúdo atual de um campo numérico de uma VIEW temporária.

**Sintaxe:**

```lsp
RetornaCampoNumeroTabela(Alfa NomeCampo, Alfa NomeTabelaView, Alfa OpcionalWhere, Numero End pRetorno, Numero End pAchou);
```

**Parâmetros:**

- `NomeCampo`: Nome do campo da View a ser retornado
- `NomeTabelaView`: Nome da View temporária
- `OpcionalWhere`: Cláusula WHERE de filtro (opcional)
- `pRetorno`: Variável onde o conteúdo buscado será retornado
- `pAchou`: Retorna 0 caso tenha encontrado resultados, ou 1 caso não tenha encontrado

**Exemplo:**

```lsp
Definir Alfa xNomeView;
Definir Numero xRetorno;
Definir Numero xAchou;
Definir Alfa xSQL;

xSQL = "SELECT NUMEMP, TIPCOL, SUM(VALSAL) VALORSAL FROM R034FUN GROUP BY NUMEMP, TIPCOL";
CriaView(xSQL, xNomeView);
RetornaCampoNumeroTabela("VALORSAL", xNomeView, "NUMEMP = 1 and TIPCOL = 1", xRetorno, xAchou);

Se (xAchou = 0) {
  Formula001 = xRetorno;
} Senao {
  Formula001 = 0;
}
```

### **Seções Adicionais**

#### **ListaSecao**

Lista uma seção adicional do modelo a partir de um evento ou regra.

**Sintaxe:**

```lsp
ListaSecao(Alfa Seção);
```

**Parâmetros:**

- `Seção`: Nome da seção entre aspas

**Exemplo:**

```lsp
ListaSecao("Adicional_1");
```

**⚠️ Observação:** Esta função já estava documentada anteriormente no arquivo, mas é incluída aqui para completude da seção de funções específicas do Gerador de Relatórios.

### **Personalização do Nome do Arquivo Gerado**

É possível alterar o nome do arquivo gerado pelo relatório utilizando a variável **vNomeRelatorio**.

> **Atenção:** Isso só funcionará se o campo "Nome do Arquivo (Opcional)" na parametrização de saída do modelo estiver em branco.

**Como funciona:**

- Na regra de inicialização do relatório, atribua o valor desejado à variável `vNomeRelatorio`.
- O valor atribuído será utilizado como nome do arquivo de saída (por exemplo, PDF).

**Exemplo prático:**

```lsp
Definir Alfa EAbrEmp;
Definir Alfa vNomeRelatorio;

vNomeRelatorio = EAbrEmp;
```

**Chamada do relatório:**

```lsp
SetaAlfaTelaEntrada("EAbrEmp", "1-3");
ExecutaRelatorio("HRCL001.GER", "N");
```

**Resultado:**
O arquivo gerado será salvo com o nome informado em `vNomeRelatorio` (ex: `1-3.PDF`), desde que o campo de nome do arquivo na tela de parametrização esteja vazio.

**Resumo visual do processo:**

- **Tela de saída:** Deixe o campo "Nome do Arquivo (Opcional)" em branco.
- **Regra de inicialização:** Atribua o valor desejado à variável `vNomeRelatorio`.
- **Arquivo gerado:** O nome do arquivo será o valor da variável, com a extensão do formato escolhado (PDF, TXT, etc).

### **SetaNumeroTelaEntrada**

Permite alterar os valores numéricos da tela de entrada do modelo de relatório.

**Sintaxe:**

```lsp
SetaNumeroTelaEntrada(<NomeCampo>, <Valor>);
```

**Parâmetros:**

- `NomeCampo`: Nome do campo da tela de entrada (tipo Alfa)
- `Valor`: Valor para o campo (tipo Numero)

**Exemplo:**

```lsp
Definir Funcao exemploSetaParametrosRelatorio();

@ Variáveis globais @
Definir Numero vnCodEmpresa;
Definir Numero vnCodFilial;
Definir Alfa vaAbrangenciaEmpresa;

exemploSetaParametrosRelatorio();

Funcao exemploSetaParametrosRelatorio(); {
  @ Definir parâmetros de entrada @
  vnCodEmpresa = 1;
  vnCodFilial = 5;
  vaAbrangenciaEmpresa = "1..3";
  
  @ Configurar campos numéricos da tela de entrada @
  SetaNumeroTelaEntrada("ECodEmp", vnCodEmpresa);
  SetaNumeroTelaEntrada("ECodFil", vnCodFilial);
  
  @ Configurar campos alfa da tela de entrada @
  SetaAlfaTelaEntrada("EAbrEmp", vaAbrangenciaEmpresa);
  
  @ Executar relatório com parâmetros pré-definidos @
  ExecutaRelatorio("REL001.GER", "S");
  
  Mensagem(Retorna, "Relatório executado com parâmetros automatizados");
}
```

**⚠️ Observações importantes:**

- Esta função grava os valores numa lista que será usada na próxima execução de `ExecutaRelatorio`
- A lista de valores é zerada após a execução da função `ExecutaRelatorio`
- Utilize para automatizar a execução de relatórios sem intervenção do usuário
- Complementa a função `SetaAlfaTelaEntrada` para campos alfanuméricos
