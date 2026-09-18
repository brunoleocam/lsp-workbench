# Validação e Verificação

A LSP oferece funções especializadas para validação de dados, verificação de abrangências e controle de qualidade de informações.

### Verificação de Nulidade e Limpeza de Dados

#### EstaNulo

Verifica se uma variável está nula (vazia ou não inicializada).

**Sintaxe:**

```lsp
EstaNulo(<variavel>, <resultado>);
```

**Parâmetros:**

- `variavel`: Variável a ser verificada
- `resultado`: Variável numérica que receberá 1 se nula, 0 se não nula

**Nota (tipo do primeiro parâmetro):** em muitos ambientes Senior o compilador expõe `EstaNulo` com o primeiro argumento como **Alfa** (`VARSTR`). Para valor **Data** após `AlfaParaData`, não use `EstaNulo` na `Data`: valide com `Se (vdData <> 0)` (data inválida ou vazia costuma resultar em zero) ou trate a **string** antes da conversão.

**Exemplo:**

```lsp
Definir Alfa vaTexto;
Definir Numero vnEhNulo;

EstaNulo(vaTexto, vnEhNulo);
Se (vnEhNulo = 1) {
  Mensagem(Retorna, "Variável está nula");
} Senao {
  Mensagem(Retorna, "Variável contém dados");
}
```

#### DeixaNumeros

Remove todos os caracteres não numéricos de uma string, mantendo apenas os dígitos.

**Sintaxe:**

```lsp
DeixaNumeros(<texto>);
```

**Parâmetros:**

- `texto`: Variável alfa que será modificada, mantendo apenas números

**Exemplo:**

```lsp
Definir Alfa vaCEP;
Definir Alfa vaTelefone;

vaCEP = "86710-180";
DeixaNumeros(vaCEP);
@ vaCEP será "86710180" @

vaTelefone = "(43) 3234-5678";
DeixaNumeros(vaTelefone);
@ vaTelefone será "4332345678" @
```

**Observação:** A função modifica diretamente a variável passada como parâmetro.

### Verificação de Abrangências

#### VrfAbrA

Verifica se um valor alfanumérico está dentro de uma abrangência especificada.

**Sintaxe:**

```lsp
VrfAbrA(<valor>, <abrangencia>, <resultado>);
```

**Parâmetros:**

- `valor`: Valor a ser verificado
- `abrangencia`: Abrangência especificada
- `resultado`: Variável que receberá 1 se válido, 0 se inválido

#### VrfAbrN

Verifica se um valor numérico está dentro de uma abrangência especificada.

**Sintaxe:**

```lsp
VrfAbrN(<valor>, <abrangencia>, <resultado>);
```

**Parâmetros:**

- `valor`: Valor numérico a ser verificado
- `abrangencia`: Abrangência especificada
- `resultado`: Variável que receberá 1 se válido, 0 se inválido

#### MontaAbrangencia

Função utilizada para retornar uma cláusula SQL de acordo com um campo e uma abrangência de valores.

Para montar abrangências de local quando existem valores especiais ("1.1.111==", por exemplo), deve ser utilizado o campo NumLoc nesta função. O campo CodLoc não é tratado pela função nesta situação.

**Sintaxe:**

```lsp
MontaAbrangencia(<tabela>, <valores>, <sqlAbr>);
```

**Parâmetros:**

- `tabela`: Variável que recebe o campo da tabela que vai ser montada a abrangência
- `valores`: Variável que contém a faixa de valores na forma de abrangência
- `sqlAbr`: Variável alfa que retorna a cláusula SQL correspondente à abrangência informada

**Exemplo:**

```lsp
Definir Alfa xCodMot;
Definir Alfa xAbrMot;
Definir Numero Xnumemp;
Definir Numero Xtipcol;
Definir Numero Xnumcad;
Definir Alfa ECodMot;

Xnumemp = R034FUN.NumEmp;
Xtipcol = R034FUN.TipCol;
Xnumcad = R034FUN.NumCad;
ECodMot = "001..999"; @ Exemplo de abrangência @

MontaAbrangencia("R038HSA.CodMot", ECodMot, xCodMot);
XAbrMot = "";

Se (xCodMot <> "( )") {
  XAbrMot = " And " + xCodMot;
}

Chsa.SQL "SELECT * FROM R038HSA WHERE NUMEMP = :xnumemp AND TIPCOL = :xtipcol AND NUMCAD = :xnumcad __Inserir(:xAbrMot) ORDER BY DESC, SEQALT DESC";
```

**Observações:**

- Caso não seja informado nada na variável de abrangência na tela de entrada, esta retornará "( )"
- O comando MontaAbrangencia retorna "( )" quando a abrangência está vazia
- Utilização: Gerador de Relatórios e Regras

**Exemplo de Validação de Códigos:**

```lsp
Definir Funcao validarCodigos();

  @ Variáveis globais @
  Definir Alfa vaCodigo;
  Definir Numero vnNumero;
  Definir Alfa vaAbrangenciaAlfa;
  Definir Alfa vaAbrangenciaNum;
  Definir Numero vnResultadoAlfa;
  Definir Numero vnResultadoNum;
  Definir Alfa vaMensagem;

vaCodigo = "B";
vnNumero = 150;
vaAbrangenciaAlfa = "A..Z";
vaAbrangenciaNum = "100..200";

validarCodigos();

Funcao validarCodigos(); {
  @ Verifica abrangência alfanumérica @
  VrfAbrA(vaCodigo, vaAbrangenciaAlfa, vnResultadoAlfa);
  Se (vnResultadoAlfa = 1) {
    Definir Alfa vaMensagemCodigo;
    vaMensagemCodigo = "Código '" + vaCodigo + "' válido na abrangência " + vaAbrangenciaAlfa;
    Mensagem(Retorna, vaMensagemCodigo);
  } Senao {
    vaMensagemCodigo = "Código '" + vaCodigo + "' fora da abrangência " + vaAbrangenciaAlfa;
    Mensagem(Erro, vaMensagemCodigo);
  }
  
  @ Verifica abrangência numérica @
  VrfAbrN(vnNumero, vaAbrangenciaNum, vnResultadoNum);
  Se (vnResultadoNum = 1) {
    Definir Alfa vaNumeroStr;
    IntParaAlfa(vnNumero, vaNumeroStr);
    Definir Alfa vaMensagemNumero;
    vaMensagemNumero = " Número " + vaNumeroStr + " válido na abrangência " + vaAbrangenciaNum;
    Mensagem(Retorna, vaMensagemNumero);
  } Senao {
    IntParaAlfa(vnNumero, vaNumeroStr);
    vaMensagemNumero = "Número " + vaNumeroStr + " fora da abrangência " + vaAbrangenciaNum;
    Mensagem(Erro, vaMensagemNumero);
  }
}
```

### Validação de Arquivos

#### ArqExiste

Verifica se um arquivo físico existe no local especificado.

**Sintaxe:**

```lsp
vnRet = ArqExiste(<caminhoArquivo>);
```

**Parâmetros:**

- `caminhoArquivo`: Caminho completo do arquivo

**Retorno:**

- Retorna `1` se o arquivo existe
- Retorna `0` se o arquivo não existe

**Exemplo de Verificação de Arquivos:**

```lsp
Definir Funcao verificarArquivos();

  @ Variáveis globais @
  Definir Alfa vaCaminhoArquivo;
  Definir Alfa vaCaminhoConfig;
  Definir Alfa vaCaminhoLog;
  Definir Numero vnExisteArquivo;
  Definir Numero vnExisteConfig;
  Definir Numero vnExisteLog;
  Definir Alfa vaMensagem;

vaCaminhoArquivo = "C:\\temp\\dados.txt";
vaCaminhoConfig = "C:\\config\\app.ini";
vaCaminhoLog = "C:\\logs\\sistema.log";

verificarArquivos();

Funcao verificarArquivos(); {
  @ Verifica arquivo de dados @
  vnExisteArquivo = ArqExiste(vaCaminhoArquivo);
  Se (vnExisteArquivo = 1) {
    Mensagem(Retorna, "Arquivo de dados encontrado");
  } Senao {
    Definir Alfa vaMensagem;
    vaMensagem = "Arquivo de dados não encontrado: " + vaCaminhoArquivo;
    Mensagem(Erro, vaMensagem);
  }
  
  @ Verifica arquivo de configuração @
  vnExisteConfig = ArqExiste(vaCaminhoConfig);
  Se (vnExisteConfig = 1) {
    Mensagem(Retorna, "Arquivo de configuração encontrado");
  } Senao {
    Mensagem(Retorna, "Arquivo de configuração não encontrado, usando padrão");
  }
  
  @ Verifica arquivo de log @
  vnExisteLog = ArqExiste(vaCaminhoLog);
  Se (vnExisteLog = 0) {
    vaMensagem = "Arquivo de log será criado: " + vaCaminhoLog;
    Mensagem(Retorna, vaMensagem);
  }
}
```

### Validação de Dados Estruturados

#### RemoveExpressoesProibidas

Remove ou valida expressões que podem representar scripts maliciosos.

**Sintaxe:**

```lsp
RemoveExpressoesProibidas(<textoOriginal>, <textoLimpo>);
```

**Exemplo de Limpeza de Dados:**

```lsp
Definir Funcao limparDadosEntrada();

@ Variáveis globais @
Definir Alfa vaDadosEntrada;
Definir Alfa vaDadosLimpos;
Definir Numero vnTamanhoOriginal;
Definir Numero vnTamanhoLimpo;

vaDadosEntrada = "Nome: João <script>alert('xss')</script> Silva";

limparDadosEntrada();

Funcao limparDadosEntrada(); {
  Definir Alfa vaMensagem;
  TamanhoAlfa(vaDadosEntrada, vnTamanhoOriginal);
  
  @ Remove expressões perigosas @
  RemoveExpressoesProibidas(vaDadosEntrada, vaDadosLimpos);
  
  TamanhoAlfa(vaDadosLimpos, vnTamanhoLimpo);
  
  Se (vnTamanhoOriginal <> vnTamanhoLimpo) {
    vaMensagem = "Expressões perigosas removidas!";
    Mensagem(Retorna, vaMensagem);
    vaMensagem = "Original: " + vaDadosEntrada;
    Mensagem(Retorna, vaMensagem);
    vaMensagem = "Limpo: " + vaDadosLimpos;
    Mensagem(Retorna, vaMensagem);
  } Senao {
    vaMensagem = " Dados seguros: " + vaDadosLimpos;
    Mensagem(Retorna, vaMensagem);
  }
}
```

### Verificação de Abas Ativas

#### VerificaAbaAtiva

Verifica se uma aba específica está ativa na interface.

**Sintaxe:**

```lsp
VerificaAbaAtiva(<descricaoAba>, <ativa>);
```

**Parâmetros:**

- `descricaoAba`: Descrição da aba a ser verificada
- `ativa`: Variável que receberá 1 se ativa, 0 se não ativa

**Exemplo de Controle de Interface:**

```lsp
Definir Funcao verificarContextoInterface();

@ Variáveis globais @
Definir Alfa vaAbaClientes;
Definir Alfa vaAbaProdutos;
Definir Numero vnAbaClientesAtiva;
Definir Numero vnAbaProdutosAtiva;

vaAbaClientes = "Clientes";
vaAbaProdutos = "Produtos";

verificarContextoInterface();

Funcao verificarContextoInterface(); {
  @ Verifica qual aba está ativa @
  VerificaAbaAtiva(vaAbaClientes, vnAbaClientesAtiva);
  VerificaAbaAtiva(vaAbaProdutos, vnAbaProdutosAtiva);
  
  Se (vnAbaClientesAtiva = 1) {
    Mensagem(Retorna, "Contexto: Gestão de Clientes");
    @ Lógica específica para clientes @
  } Senao Se (vnAbaProdutosAtiva = 1) {
    Mensagem(Retorna, "Contexto: Gestão de Produtos");
    @ Lógica específica para produtos @
  } Senao {
    Mensagem(Retorna, "Contexto: Genérico");
    @ Lógica geral @
  }
}
```

### Exemplo Prático: Sistema de Validação Completo

```lsp
Definir Funcao validacaoCompleta();

  @ Variáveis globais @
  Definir Alfa vaNomeArquivo;
  Definir Alfa vaCodigo;
  Definir Numero vnNumero;
  Definir Data vdData;
  Definir Numero vnValidacaoGeral;
  Definir Alfa vaMensagem;

vaNomeArquivo = "C:\\dados\\cliente.txt";
vaCodigo = "CLI001";
vnNumero = 1500;
DataHoje(vdData);

validacaoCompleta();

Funcao validacaoCompleta(); {
  vnValidacaoGeral = 1; @ Assume válido inicialmente @
  
  @ 1. Verifica arquivo @
  Definir Numero vnArquivoExiste;
  vnArquivoExiste = ArqExiste(vaNomeArquivo);
  Se (vnArquivoExiste = 0) {
    Definir Alfa vaMensagem;
    vaMensagem = "Arquivo não encontrado: " + vaNomeArquivo;
    Mensagem(Erro, vaMensagem);
    vnValidacaoGeral = 0;
  }
  
  @ 2. Verifica código na abrangência @
  Definir Numero vnCodigoValido;
  VrfAbrA(vaCodigo, "CLI001..CLI999", vnCodigoValido);
  Se (vnCodigoValido = 0) {
    vaMensagem = "Código fora da abrangência: " + vaCodigo;
    Mensagem(Erro, vaMensagem);
    vnValidacaoGeral = 0;
  }
  
  @ 3. Verifica número na faixa @
  Definir Numero vnNumeroValido;
  VrfAbrN(vnNumero, "1000..2000", vnNumeroValido);
  Se (vnNumeroValido = 0) {
    Definir Alfa vaNumeroStr;
    IntParaAlfa(vnNumero, vaNumeroStr);
    vaMensagem = "Número fora da faixa: " + vaNumeroStr;
    Mensagem(Erro, vaMensagem);
    vnValidacaoGeral = 0;
  }
  
  @ 4. Resultado final @
  Se (vnValidacaoGeral = 1) {
    Mensagem(Retorna, "Todas as validações passaram!");
  } Senao {
    Mensagem(Erro, "Falha na validação geral do sistema");
  }
}
```
