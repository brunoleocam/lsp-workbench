# Manipulação Avançada de Strings

As funções de manipulação de strings na LSP permitem realizar operações complexas de processamento de texto, desde operações básicas até transformações avançadas e limpeza de dados.

### **Resumo das Funções de String**

| **Categoria** | **Função** | **Uso** | **Exemplo** |
|---|---|---|---|
| **📏 Tamanho** | `TamanhoAlfa` | Obtém tamanho de texto | `TamanhoAlfa(vaTexto, vnTamanho)` |
| **🔍 Busca** | `PosicaoAlfa` | Encontra posição de texto | `PosicaoAlfa("@", vaEmail, vnPos)` |
| **✂️ Extração** | `CopiarAlfa` | Extrai parte do texto | `CopiarAlfa(vaTexto, 1, 5)` |
| **🔄 Substituição** | `SubstAlfa` | Substitui texto | `SubstAlfa("old", "new", vaTexto)` |
| **🔤 Conversão** | `ConverteParaMaiusculo` | Maiúsculo/minúsculo | `ConverteParaMaiusculo(vaTexto)` |
| **📝 Limpeza** | `DeixaNumeros` | Remove não-números | `DeixaNumeros(vaCEP)` |

### **Exemplo Prático: Processamento de Email**

```lsp
@ === EXEMPLO COMPLETO: VALIDAÇÃO DE EMAIL === @
Definir Funcao validarEmail();

@ Variáveis globais @
Definir Alfa vaEmail;
Definir Numero vnPosArroba;
Definir Numero vnPosPonto;
Definir Numero vnTamanho;
Definir Alfa vaUsuario;
Definir Alfa vaDominio;

vaEmail = "joao.silva@empresa.com.br";
validarEmail();

Funcao validarEmail(); {
  @ 1. Verificar tamanho @
  TamanhoAlfa(vaEmail, vnTamanho);
  Se (vnTamanho < 5) {
    Mensagem(Erro, "Email muito curto!");
    Cancel(1);
  }
  
  @ 2. Encontrar @ @
  PosicaoAlfa("@", vaEmail, vnPosArroba);
  Se (vnPosArroba = 0) {
    Mensagem(Erro, "Email deve conter @");
    Cancel(1);
  }
  
  @ 3. Extrair usuário @
  vaUsuario = vaEmail;
  CopiarAlfa(vaUsuario, 1, vnPosArroba - 1);
  
  @ 4. Extrair domínio @
  vaDominio = vaEmail;
  CopiarAlfa(vaDominio, vnPosArroba + 1, vnTamanho - vnPosArroba);
  
  @ 5. Verificar domínio @
  PosicaoAlfa(".", vaDominio, vnPosPonto);
  Se (vnPosPonto = 0) {
    Mensagem(Erro, "Domínio deve conter ponto");
  } Senao {
    Definir Alfa vaMensagem;
    vaMensagem = "Email válido! Usuário: " + vaUsuario + ", Domínio: " + vaDominio;
    Mensagem(Retorna, vaMensagem);
  }
}
```

### Conceitos Fundamentais

#### Concatenação de Strings

**⚠️ REGRA FUNDAMENTAL: Apenas variáveis do tipo `Alfa` podem ser concatenadas em LSP.**

Na LSP, **não é possível concatenar diretamente uma variável do tipo `Numero` com uma variável do tipo `Alfa`** ou com strings literais. Para realizar concatenação, é necessário:

1. **Todos os elementos** da concatenação devem ser do tipo `Alfa`
2. **Converter variáveis numéricas** para `Alfa` usando funções como `IntParaAlfa()` ou `DecimalParaAlfa()`
3. **Definir uma variável Alfa** com o mesmo nome da variável numérica, mudando apenas o prefixo de `vn` para `va`

**✅ Exemplo CORRETO:**

```lsp
Definir Numero vnNumero;
Definir Alfa vaNumero;     @ Variável Alfa para receber conversão @
Definir Alfa vaResultado;

vnNumero = 10;
IntParaAlfa(vnNumero, vaNumero);  @ Converte número para Alfa @
vaResultado = "O número é " + vaNumero;  @ Concatena apenas Alfas @
```

**❌ Exemplo INCORRETO:**

```lsp
Definir Numero vnNumero;
Definir Alfa vaResultado;

vnNumero = 10;
vaResultado = "O número é " + vnNumero;  @ ERRO: Numero não pode ser concatenado! @
```

**📋 Regras de Concatenação:**

- ✅ `Alfa` + `Alfa` = **Permitido**
- ✅ `"string"` + `Alfa` = **Permitido**
- ❌ `Alfa` + `Numero` = **ERRO**
- ❌ `"string"` + `Numero` = **ERRO**
- ❌ `Numero` + `Numero` = **ERRO** (use operadores aritméticos)

#### Quebra de Linha

Na LSP, não existe o caractere `\n` para quebra de linha. Para realizar a quebra de linha em uma string, deve-se:

1. Definir uma variável Alfa para armazenar o caractere de quebra de linha
2. Utilizar a função `CaracterParaAlfa(13, vaEnter)` para obter o caractere de quebra de linha (13 na tabela ASCII)
3. Concatenar essa variável na string onde se deseja a quebra de linha

**Exemplo:**

```lsp
Definir Alfa vaEnter;
Definir Alfa vaMensagem;

CaracterParaAlfa(13, vaEnter);
vaMensagem = "Primeira linha" + vaEnter + "Segunda linha";
```

#### CaracterParaAlfa

Converte um caracter (que fica armazenado pelo código ASCII) para o valor Alfanumérico correspondente.

**Sintaxe:**

```lsp
CaracterParaAlfa(<caractere>, <destino>);
```

**Parâmetros:**

- `caractere`: Campo/Variável que mantém o código ASCII de um caracter
- `destino`: Variável que receberá o resultado da conversão

**Exemplo:**

```lsp
Definir Alfa vaLetra;
Definir Alfa vaEnter;

@ Conversão de código ASCII para caracter @
CaracterParaAlfa(65, vaLetra); @ vaLetra será "A" @

@ Quebra de linha @
CaracterParaAlfa(13, vaEnter); @ vaEnter será quebra de linha @
```

**⚠️ Importante:** Se for utilizar para inserir quebras de linha em envio de e-mail e na Central de Configurações Senior estiver habilitada a opção "Converter quebras de linha para HTML", todas as quebras de linha Windows (caracteres ASCII 13 e 10) serão convertidas para tags `<br/>`.

### Funções Básicas de Manipulação

#### CopiarAlfa e CopiarStr

Copiam parte do conteúdo de uma variável/campo alfanumérico modificando a própria variável de origem.

**Sintaxe:**

```lsp
CopiarAlfa(<variavel>, <posicao>, <tamanho>);
CopiarStr(<variavel>, <posicao>, <tamanho>);
```

**Parâmetros:**

- `variavel`: Variável que contém o texto e que será modificada para conter apenas a parte copiada
- `posicao`: Posição inicial (baseada em 1)
- `tamanho`: Quantidade de caracteres a copiar

**⚠️ Importante:** A função **modifica diretamente** a variável de origem, substituindo seu conteúdo pela parte copiada.

**Exemplo Prático:**

```lsp
Definir Alfa vaTexto;
Definir Alfa vaNome;
Definir Alfa vaSobrenome;

@ Para extrair "João" @
vaTexto = "João Silva Santos";
vaNome = vaTexto;  @ Faz uma cópia primeiro @
CopiarAlfa(vaNome, 1, 4); @ vaNome será "João" @

@ Para extrair "Silva" @
vaSobrenome = vaTexto;  @ Faz uma cópia primeiro @
CopiarAlfa(vaSobrenome, 6, 5); @ vaSobrenome será "Silva" @
```

**📋 Exemplo da Documentação Oficial Senior:**

```lsp
Definir Alfa exemplo;
exemplo = "texto de exemplo";
CopiarAlfa(exemplo, 12, 3);
@ Após o uso da função, o conteúdo da variável "exemplo" seria "emp" @
```

#### TamanhoAlfa e TamanhoStr

Retornam o tamanho de uma variável/campo alfanumérico através de parâmetro de retorno.

**Sintaxe:**

```lsp
TamanhoAlfa(<origem>, <tamanho>);
TamanhoStr(<origem>, <tamanho>);
```

**Parâmetros:**

- `origem`: Campo/Variável que se deseja saber o tamanho
- `tamanho`: Variável Numero que receberá o tamanho

**Exemplo de Validação:**

```lsp
Definir Alfa vaSenha;
Definir Numero vnTamanho;
Definir Alfa vaMensagem;
Definir Alfa vaNumeroStr;

vaSenha = "minhasenha123";
TamanhoAlfa(vaSenha, vnTamanho);

Se (vnTamanho < 8) {
  vaMensagem = "Senha deve ter pelo menos 8 caracteres";
  Mensagem(Erro, vaMensagem);
} Senao {
  IntParaAlfa(vnTamanho, vaNumeroStr);
  vaMensagem = "Senha válida com " + vaNumeroStr + " caracteres";
  Mensagem(Retorna, vaMensagem);
}
```

**⚠️ Importante:** Essas funções **não retornam valor diretamente**. O resultado é passado através do parâmetro de retorno.

#### PosicaoAlfa e PosicaoStr

Procuram por uma parte de texto dentro de um campo/variável, retornando a posição inicial através de parâmetro.

**Sintaxe:**

```lsp
PosicaoAlfa(<subtexto>, <texto>, <posicao>);
PosicaoStr(<subtexto>, <texto>, <posicao>);
```

**Parâmetros:**

- `subtexto`: Texto que se está procurando
- `texto`: Campo/variável onde fazer a busca
- `posicao`: Variável que receberá a posição inicial (0 se não encontrar)

**Exemplo de Validação de Email:**

```lsp
Definir Alfa vaEmail;
Definir Numero vnPosArroba;
Definir Numero vnPosPonto;

vaEmail = "usuario@empresa.com.br";
PosicaoAlfa("@", vaEmail, vnPosArroba);
PosicaoAlfa(".", vaEmail, vnPosPonto);

Se (vnPosArroba = 0) {
  Mensagem(Erro, "Email inválido: falta @");
} Senao Se (vnPosPonto = 0) {
  Mensagem(Erro, "Email inválido: falta domínio");
} Senao {
  Mensagem(Retorna, "Email válido!");
}
```

**⚠️ Importante:** Essas funções **usam parâmetro de retorno**, não retorno direto.

#### SubstAlfa e SubstAlfaUmaVez

Substituem trechos específicos dentro de um texto por outro texto.

**Sintaxe:**

```lsp
SubstAlfa(<subtexto>, <novoTexto>, <texto>);      @ Substitui todas as ocorrências @
SubstAlfaUmaVez(<subtexto>, <novoTexto>, <texto>); @ Substitui apenas a primeira @
```

**Parâmetros:**

- `subtexto`: Texto a ser localizado e substituído
- `novoTexto`: Texto que irá substituir
- `texto`: Variável que contém o texto original e receberá o resultado

**Exemplo de Limpeza de Dados:**

```lsp
Definir Alfa vaTexto;
Definir Alfa vaTextoLimpo;

vaTexto = "João--Silva--Santos";
vaTextoLimpo = vaTexto;

@ Substitui todos os traços duplos por espaço simples @
SubstAlfa("--", " ", vaTextoLimpo);
@ vaTextoLimpo será "João Silva Santos" @

@ Exemplo com SubstAlfaUmaVez @
vaTexto = "teste teste teste";
SubstAlfaUmaVez("teste", "TESTE", vaTexto);
@ vaTexto será "TESTE teste teste" (apenas o primeiro) @
```

#### Concatena

Concatena até 3 campo/variáveis tipo alfa, formando uma só variável.

**Sintaxe:**

```lsp
Concatena(<str1>, <str2>, <str3>, <destino>);
```

**Parâmetros:**

- `str1`: Campo/Variável que será concatenado
- `str2`: Campo/Variável que será concatenado  
- `str3`: Campo/Variável que será concatenado
- `destino`: Variável que receberá o resultado da concatenação (retorno)

**Exemplo:**

```lsp
Definir Alfa vaTexto1;
Definir Alfa vaTexto2;
Definir Alfa vaTexto3;
Definir Alfa vaResultado;

vaTexto1 = "Pedro Luiz Souza";
vaTexto2 = " - ";
vaTexto3 = "Pedrão";

Concatena(vaTexto1, vaTexto2, vaTexto3, vaResultado);
@ vaResultado será "Pedro Luiz Souza - Pedrão" @
```

### Funções Avançadas de Manipulação

#### DeletarAlfa

Remove uma quantidade específica de caracteres de uma posição determinada.

**Sintaxe:**

```lsp
DeletarAlfa(<texto>, <posicao>, <quantidade>);
```

**Exemplo de Formatação de CPF:**

```lsp
Definir Alfa vaCPF;

vaCPF = "123.456.789-10";

@ Remove formatação do CPF @
DeletarAlfa(vaCPF, 4, 1);  @ Remove primeiro ponto @
DeletarAlfa(vaCPF, 7, 1);  @ Remove segundo ponto @
DeletarAlfa(vaCPF, 10, 1); @ Remove traço @
@ vaCPF será "12345678910" @

#### DeletarStr

Elimina parte de um texto.

**Sintaxe:**

```lsp
DeletarStr(<origem>, <posicao>, <quantidade>);
```

**Parâmetros:**

- `origem`: Variável que passará o texto cuja parte será deletada
- `posicao`: Variável que indica a posição de início da eliminação
- `quantidade`: Variável que indica a quantidade de caracteres a serem eliminados

**Exemplo:**

```lsp
Definir Alfa vaOrigem;
vaOrigem = "Senior empresa de Sistemas";
DeletarStr(vaOrigem, 8, 11);
@ vaOrigem será "Senior Sistemas" @
```

#### InserirAlfa

Insere um ou mais caracteres em uma variável/campo, a partir da posição indicada.

**Sintaxe:**

```lsp
InserirAlfa(<valor>, <origem>, <posicao>);
```

**Parâmetros:**

- `valor`: Variável que contém a string que deseja-se inserir
- `origem`: Variável que contém a string de origem e que receberá o conteúdo da inserção
- `posicao`: Variável que indica a posição em Origem a partir de onde Valor será inserido

**Exemplo:**

```lsp
Definir Alfa vaOrigem;
vaOrigem = "Senior Sistemas";
InserirAlfa("empresa de ", vaOrigem, 8);
@ vaOrigem será "Senior empresa de Sistemas" @
```

**Observação:** O conteúdo da variável Origem será truncado caso o tamanho definido para o campo/variável não for respeitado.

#### InserirStr

Esta função insere um ou mais caracteres em uma Variável/Campo, a partir da posição indicada.

**Sintaxe:**

```lsp
InserirStr(<valor>, <origem>, <posicao>);
```

**Parâmetros:**

- `valor`: Variável que contém a string que deseja-se inserir
- `origem`: Variável que contém a string de origem e que receberá o conteúdo da inserção
- `posicao`: Variável que indica a posição em Origem a partir de onde Valor será inserido

**Exemplo:**

```lsp
Definir Alfa vaOrigem;
vaOrigem = "Senior Sistemas";
InserirStr("empresa de ", vaOrigem, 8);
@ vaOrigem será "Senior empresa de Sistemas" @
```

**Observação:** O conteúdo da variável Origem será truncado caso o tamanho definido para o campo/variável não for respeitado.

#### LimpaEspacos

Limpa os espaços em branco à direita e à esquerda de uma variável alfanumérica.

**Sintaxe:**

```lsp
LimpaEspacos(<texto>);
```

**Exemplo:**

```lsp
Definir Alfa vaTexto;
vaTexto = "  texto com espaços  ";
LimpaEspacos(vaTexto);
@ vaTexto será "texto com espaços" @
```

#### LimpaEspacosDireita

Limpa os espaços em branco à direita de uma variável alfanumérica.

**Sintaxe:**

```lsp
LimpaEspacosDireita(<texto>);
```

**Exemplo:**

```lsp
Definir Alfa vaTexto;
vaTexto = "  texto com espaços  ";
LimpaEspacosDireita(vaTexto);
@ vaTexto será "  texto com espaços" @
```

#### LimpaEspacosEsquerda

Limpa os espaços em branco à esquerda de uma variável alfanumérica.

**Sintaxe:**

```lsp
LimpaEspacosEsquerda(<texto>);
```

**Exemplo:**

```lsp
Definir Alfa vaTexto;
vaTexto = "  texto com espaços  ";
LimpaEspacosEsquerda(vaTexto);
@ vaTexto será "texto com espaços  " @
```

#### QuebraTexto

Esta função pega o texto indicado e faz assinalamentos de quebra de linha conforme o Tamanho_Linha especificado, retornando a quantidade de linhas que será usada para imprimir o texto.

**Sintaxe:**

```lsp
QuebraTexto(<texto>, <tamanhoLinha>, <quantidadeLinhas>);
```

**Parâmetros:**

- `texto`: Campo/Variável que se deseja imprimir em mais de uma linha
- `tamanhoLinha`: Variável que indica a quantidade máxima de caracteres por linha
- `quantidadeLinhas`: Variável que indica qual é a quantidade de linhas que serão necessárias para imprimir o texto

**Exemplo:**

```lsp
Definir Alfa vaTexto;
Definir Alfa vaFrase;
Definir Numero vnNumLin;
Definir Numero vnLinAtu;

vaTexto = "Vamos ver o que acontece quando usamos estas funções para controle de impressão de linhas de um texto mais extenso";
QuebraTexto(vaTexto, 30, vnNumLin);

vnLinAtu = 1;
Enquanto (vnLinAtu <= vnNumLin) {
  BuscaLinhaTexto(vaTexto, vnLinAtu, vaFrase);
  @ Processa cada linha @
  vnLinAtu++;
}
```

**Utilização da Função (dependentes):** BuscaLinhaTexto(Alfa Texto, Numero NroLin, Alfa End LinTex);

#### ProcuraEnter

Esta função procura um caractere que indica "enter" ou nova linha (#13 ou #10) em uma string e retorna a string antes do primeiro enter, e o restante da string original, em variáveis separadas.

**Sintaxe:**

```lsp
ProcuraEnter(<strProcura>, <strImp>, <strResto>);
```

**Parâmetros:**

- `strProcura`: String na qual será procurada o enter ou nova linha (#13 ou #10)
- `strImp`: A primeira parte da string procurada, até o primeiro caracter que indica nova linha (retorno)
- `strResto`: O restante da string, depois do primeiro caracter que indica nova linha (retorno)

**Exemplo:**

```lsp
Definir Alfa vaStrProcura;
Definir Alfa vaStrImp;
Definir Alfa vaStrResto;

vaStrProcura = "Primeira linha" + vaEnter + "Segunda linha";
ProcuraEnter(vaStrProcura, vaStrImp, vaStrResto);
@ vaStrImp será "Primeira linha" @
@ vaStrResto será "Segunda linha" @
```

**Observações:** Para imprimir cada obs separada por enter basta mandar imprimir a variável StrImp e depois procurar sempre pela StrResto.

#### CalculaAlfa

Realiza operações matemáticas com valores alfanuméricos.

**Sintaxe:**

```lsp
CalculaAlfa(<operacao>, <argumento1>, <argumento2>, <resultado>);
```

**Parâmetros:**

- `operacao`: Campo indicando que operação deve ser realizada:
  - "+": soma
  - "-": subtração
  - "*": multiplicação
- `argumento1`: Campo contendo o primeiro argumento a ser usado no cálculo
- `argumento2`: Campo contendo o segundo argumento a ser usado no cálculo
- `resultado`: Variável alfa que receberá o resultado do cálculo

**Exemplo:**

```lsp
Definir Alfa vaOperacao;
Definir Alfa vaArg1;
Definir Alfa vaArg2;
Definir Alfa vaResultado;

vaOperacao = "+";
vaArg1 = "100";
vaArg2 = "50";
CalculaAlfa(vaOperacao, vaArg1, vaArg2, vaResultado);
@ vaResultado será "150" @
```

**Observações:** Estão disponíveis as operações de soma, subtração e multiplicação. Todos os cálculos são realizados com números inteiros, caso seja informado um número não inteiro um erro ocorrerá. Cálculos feitos com esta função demoram muito mais para serem processados do que cálculos diretos (c = a + b).

#### CarregarTextoArq

Esta função carrega para uma variável alfanumérica o conteúdo de um arquivo texto.

**Sintaxe:**

```lsp
CarregarTextoArq(<arquivo>, <texto>);
```

**Parâmetros:**

- `arquivo`: Variável com o caminho do arquivo a ser lido
- `texto`: Variável que retorna o texto lido do arquivo

**Exemplo:**

```lsp
Definir Alfa vaTexto;
CarregarTextoArq("C:\\Senior\\Sapiens\\Arquivo.txt", vaTexto);
```

#### Concatena

Esta função concatena até 3 campo/variáveis tipo alfa, formando uma só variável.

**Sintaxe:**

```lsp
Concatena(<str1>, <str2>, <str3>, <destino>);
```

**Parâmetros:**

- `str1`: Campo/Variável que será concatenado
- `str2`: Campo/Variável que será concatenado
- `str3`: Campo/Variável que será concatenado
- `destino`: Variável que receberá o resultado da concatenação (retorno)

**Exemplo:**

```lsp
Definir Alfa vaResultado;
Definir Alfa vaNome;
Definir Alfa vaApelido;

vaNome = "Pedro Luiz Souza";
vaApelido = "Pedrão";

Concatena(vaNome, " - ", vaApelido, vaResultado);
@ vaResultado será "Pedro Luiz Souza - Pedrão" @
```

#### ConverteParaMaiusculo e ConverteParaMinusculo

Convertem o conteúdo de uma variável para maiúsculo ou minúsculo.

**Sintaxe:**

```lsp
ConverteParaMaiusculo(<texto>);
ConverteParaMinusculo(<texto>);
```

**Exemplo de Padronização:**

```lsp
Definir Alfa vaNome;
Definir Alfa vaEmail;

vaNome = "joão SILVA santos";
vaEmail = "USUARIO@EMPRESA.COM.BR";

@ Padroniza email (tudo minúsculo) @
ConverteParaMinusculo(vaEmail);
@ vaEmail será "usuario@empresa.com.br" @

@ Para nome próprio @
ConverteParaMaiusculo(vaNome); @ Vira "JOÃO SILVA SANTOS" @
```

#### TrocaString

Função avançada de substituição com mais opções de controle.

**Sintaxe:**

```lsp
TrocaString(<texto>, <textoAntigo>, <textoNovo>);
```

**Exemplo de Template:**

```lsp
Definir Alfa vaTemplate;
Definir Alfa vaNomeUsuario;
Definir Alfa vaEmpresa;
Definir Alfa vaMensagemFinal;

vaTemplate = "Olá __NOME__, bem-vindo à __EMPRESA__!";
vaNomeUsuario = "João Silva";
vaEmpresa = "Senior Sistemas";

vaMensagemFinal = vaTemplate;
TrocaString(vaMensagemFinal, "__NOME__", vaNomeUsuario);
TrocaString(vaMensagemFinal, "__EMPRESA__", vaEmpresa);
@ vaMensagemFinal será "Olá João Silva, bem-vindo à Senior Sistemas!" @
```

#### LerPosicaoAlfa

Identifica qual caracter está em determinada posição do campo/variável de origem.

**Sintaxe:**

```lsp
LerPosicaoAlfa(<origem>, <destino>, <posicao>);
```

**Parâmetros:**

- `origem`: Campo/Variável Alfa que se deseja verificar
- `destino`: Variável Numero que receberá o código ASCII do caracter lido
- `posicao`: Posição do Campo/Variável de Origem que se deseja identificar o caracter

**Exemplo:**

```lsp
Definir Alfa vaTexto;
Definir Numero vnCodigoCaractere;
Definir Numero vnPosicao;

vaTexto = "TESTE";
vnPosicao = 1;

@ Obtém o código ASCII do primeiro caractere @
LerPosicaoAlfa(vaTexto, vnCodigoCaractere, vnPosicao);
@ vnCodigoCaractere será 84 (código ASCII de 'T') @

@ Comparação com código ASCII @
Se (vnCodigoCaractere = 84) { @ 'T' @
  Mensagem(Retorna, "Primeiro caractere é T");
}

@ Para comparar diretamente com caractere, use aspas simples @
Se (vnCodigoCaractere = 'T') {
  Mensagem(Retorna, "Primeiro caractere é T");
}
```

**Observações:**

- A função retorna o código ASCII do caractere, não o caractere em si
- Para obter o caractere como string, use `CopiarAlfa` em vez de `LerPosicaoAlfa`
- Para comparações diretas com caracteres, use aspas simples (`'T'`)

### Funções de Lista e Separação

#### ListaItem

Retorna um item específico de uma lista concatenada.

**Sintaxe:**

```lsp
ListaItem(<texto>, <separador>, <indice>, <item>);
```

**Exemplo de Processamento CSV:**

```lsp
Definir Alfa vaLinhaCsv;
Definir Alfa vaNome;
Definir Alfa vaIdade;
Definir Alfa vaCargo;

vaLinhaCsv = "João Silva;30;Desenvolvedor;São Paulo";

ListaItem(vaLinhaCsv, ";", 1, vaNome);    @ vaNome = "João Silva" @
ListaItem(vaLinhaCsv, ";", 2, vaIdade);   @ vaIdade = "30" @
ListaItem(vaLinhaCsv, ";", 3, vaCargo);   @ vaCargo = "Desenvolvedor" @
```

#### ListaQuantidade

Retorna a quantidade de itens em uma lista concatenada através de parâmetro de retorno.

**Sintaxe:**

```lsp
ListaQuantidade(<texto>, <separador>, <quantidade>);
```

**Parâmetros:**

- `texto`: Texto com itens separados
- `separador`: Caractere que separa os itens
- `quantidade`: Variável que receberá a quantidade de itens

**Exemplo de Contagem:**

```lsp
Definir Alfa vaEmails;
Definir Numero vnQuantidade;
Definir Alfa vaMensagem;
Definir Alfa vaQuantidadeStr;

vaEmails = "user1@teste.com,user2@teste.com,user3@teste.com";
ListaQuantidade(vaEmails, ",", vnQuantidade);

IntParaAlfa(vnQuantidade, vaQuantidadeStr);
vaMensagem = "Total de emails: " + vaQuantidadeStr;
Mensagem(Retorna, vaMensagem); @ "Total de emails: 3" @
```

**⚠️ Importante:** Esta função **usa parâmetro de retorno**, seguindo o padrão LSP.

### Funções de Codificação

#### ConverteCodificacaoString

Esta função altera a codificação de um texto contido em uma variável, onde este texto com a codificação alterada pode ser utilizado para comunicação com web services.

**Sintaxe:**

```lsp
vnRetorno = ConverteCodificacaoString(<textoOrigem>, <codificacao>, <textoDestino>);
```

**Parâmetros:**

- `textoOrigem`: Contém o texto original que necessita ter sua codificação alterada
- `codificacao`: Nome da codificação para a qual o texto será convertido ("UTF-8" ou "WINDOWS-1252")
- `textoDestino`: Contém o texto com a codificação alterada

**Valor de Retorno:**

- `0`: Conversão realizada com sucesso
- `1`: Texto possui caracteres não suportados pela codificação

**Exemplo:**

```lsp
Definir Alfa vaTextoOriginal;
Definir Alfa vaTextoCodificado;
Definir Numero vnRetorno;

vaTextoOriginal = "Acentuação especial";

vnRetorno = ConverteCodificacaoString(vaTextoOriginal, "UTF-8", vaTextoCodificado);

Se (vnRetorno = 1) {
  Mensagem(Retorna, "Encontrado caracteres incompatíveis!");
} Senao {
  Mensagem(Retorna, "Conversão realizada com sucesso!");
}
```

**Observação:** Se o sistema não suportar a codificação informada, será emitida a mensagem: "A codificação X não é suportada. Verifique a documentação".

#### ConverteTexto

Realiza a substituição de caracteres especiais de acordo com o padrão de codificação informada no primeiro parâmetro, retorna um novo texto com os caracteres convertidos.

**Sintaxe:**

```lsp
ConverteTexto(<codificacao>, <textoOrigem>, <textoDestino>);
```

**Parâmetros:**

- `codificacao`: Codificação do formato de origem do texto (formato suportado: "JSON")
- `textoOrigem`: Texto contendo os caracteres que necessitam ser convertidos
- `textoDestino`: Variável que recebe o texto convertido

**Exemplo:**

```lsp
Definir Alfa vaTextoOrigem;
Definir Alfa vaTextoDestino;

vaTextoOrigem = "\\u00c1gua";

ConverteTexto("JSON", vaTextoOrigem, vaTextoDestino);
@ vaTextoDestino recebe o valor "Água" @
```

**Observação:** A função ConverteTexto deve ser utilizada somente para a conversão de conjunto de caracteres, não sendo recomendada para conversão de conjunto de dados, por exemplo estruturas JSON.

**Tabela de Caracteres Suportados na Conversão:**

| Código | Conversão | Código | Conversão | Código | Conversão | Código | Conversão |
|--------|-----------|--------|-----------|--------|-----------|--------|-----------|
| \\u0021 | ! | \\u0041 | A | \\u0061 | a | \\u00C1 | Á |
| \\u0022 | " | \\u0042 | B | \\u0062 | b | \\u00C2 | Â |
| \\u0023 | # | \\u0043 | C | \\u0063 | c | \\u00C3 | Ã |
| \\u0025 | % | \\u0044 | D | \\u0064 | d | \\u00C7 | Ç |
| \\u0026 | & | \\u0045 | E | \\u0065 | e | \\u00C8 | È |
| \\u0027 | ' | \\u0046 | F | \\u0066 | f | \\u00C9 | É |
| \\u0028 | ( | \\u0047 | G | \\u0067 | g | \\u00CA | Ê |
| \\u0029 | ) | \\u0048 | H | \\u0068 | h | \\u00CC | Ì |
| \\u002A | * | \\u0049 | I | \\u0069 | i | \\u00CD | Í |
| \\u002B | + | \\u004A | J | \\u006A | j | \\u00CE | Î |
| \\u002C | , | \\u004B | K | \\u006B | k | \\u00D2 | Ò |
| \\u002D | - | \\u004C | L | \\u006C | l | \\u00D3 | Ó |
| \\u002E | . | \\u004D | M | \\u006D | m | \\u00D4 | Ô |
| \\u002F | / | \\u004E | N | \\u006E | n | \\u00D5 | Õ |
| \\u0030 | 0 | \\u004F | O | \\u006F | o | \\u00D9 | Ù |
| \\u0031 | 1 | \\u0050 | P | \\u0070 | p | \\u00DA | Ú |
| \\u0032 | 2 | \\u0051 | Q | \\u0071 | q | \\u00DB | Û |
| \\u0033 | 3 | \\u0052 | R | \\u0072 | r | \\u00E0 | à |
| \\u0034 | 4 | \\u0053 | S | \\u0073 | s | \\u00E1 | á |
| \\u0035 | 5 | \\u0054 | T | \\u0074 | t | \\u00E2 | â |
| \\u0036 | 6 | \\u0055 | U | \\u0075 | u | \\u00E3 | ã |
| \\u0037 | 7 | \\u0056 | V | \\u0076 | v | \\u00E7 | ç |
| \\u0038 | 8 | \\u0057 | W | \\u0077 | w | \\u00E8 | è |
| \\u0039 | 9 | \\u0058 | X | \\u0078 | x | \\u00E9 | é |
| \\u003B | ; | \\u0059 | Y | \\u0079 | y | \\u00EA | ê |
| \\u003C | < | \\u005A | Z | \\u007A | z | \\u00EC | ì |
| \\u003D | = | \\u005B | [ | \\u007B | { | \\u00ED | í |
| \\u003E | > | \\u005D | ] | \\u007C | \| | \\u00EE | î |
| \\u003F | ? | \\u005E | ^ | \\u007D | } | \\u00F1 | ñ |
| \\u0040 | @ | \\u005F | _ | \\u007E | ~ |  |  |
| \\u0060 | ` |  |  |  |  |  |  |
