# Interface e Feedback do Usuário

A LSP oferece ferramentas para criar interfaces mais amigáveis e fornecer feedback visual durante operações demoradas.

### Barra de Progresso

#### IniciaBarraProgresso

Inicia uma barra de progresso para mostrar o andamento de processos longos.

**Sintaxe:**

```lsp
IniciaBarraProgresso(<titulo>, <mensagemInicial>);
```

#### AtualizaBarraProgresso

Atualiza o progresso e a mensagem da barra.

**Sintaxe:**

```lsp
AtualizaBarraProgresso(<percentual>, <mensagem>);
```

#### FinalizaBarraProgresso

Finaliza e fecha a barra de progresso.

**Sintaxe:**

```lsp
FinalizaBarraProgresso();
```

#### OcultaBarraProgressoRelatorio

Oculta a barra de progresso padrão durante a execução de relatórios.

**Sintaxe:**

```lsp
OcultaBarraProgressoRelatorio(<ocultar>);
```

**Exemplo de Processamento com Feedback:**

```lsp
Definir Funcao processarDadosComFeedback();

@ Variáveis globais @
Definir Numero vnTotalRegistros;
Definir Numero vnRegistroAtual;
Definir Numero vnPercentual;
Definir Alfa vaMensagem;
Definir Alfa vaRegistroStr;
Definir Alfa vaPercentualStr;

vnTotalRegistros = 100;

processarDadosComFeedback();

Funcao processarDadosComFeedback(); {
  @ Inicia barra de progresso @
  IniciaBarraProgresso("Processamento de Dados", "Iniciando processamento...");
  
  @ Simula processamento @
  Para (vnRegistroAtual = 1; vnRegistroAtual <= vnTotalRegistros; vnRegistroAtual++) {
    @ Calcula percentual @
    vnPercentual = (vnRegistroAtual * 100) / vnTotalRegistros;
    
    @ Monta mensagem @
    IntParaAlfa(vnRegistroAtual, vaRegistroStr);
    IntParaAlfa(vnPercentual, vaPercentualStr);
    Definir Alfa vaTotalRegistrosStr;
    IntParaAlfa(vnTotalRegistros, vaTotalRegistrosStr);
    vaMensagem = "Processando registro " + vaRegistroStr + " de " + vaTotalRegistrosStr;
    
    @ Atualiza barra @
    AtualizaBarraProgresso(vnPercentual, vaMensagem);
    
    @ Simula tempo de processamento @
    sleep(50); @ Pausa 50ms @
    
    @ Simula erro no meio do processo @
    Se (vnRegistroAtual = 50) {
      AtualizaBarraProgresso(50, "Problema detectado, continuando...");
      sleep(1000); @ Pausa 1 segundo @
    }
  }
  
  @ Finaliza @
  AtualizaBarraProgresso(100, " Processamento concluído!");
  sleep(1000);
  FinalizaBarraProgresso();
  
  IntParaAlfa(vnTotalRegistros, vaTotalRegistrosStr);
  vaMensagem = "Processamento de " + vaTotalRegistrosStr + " registros concluído!";
  Mensagem(Retorna, vaMensagem);
}
```

### Controle de Interface

#### ObterVersaoSistema

Esta função retorna a versão do sistema Senior.

**Sintaxe:**

```lsp
ObterVersaoSistema(<majorVersion>, <minorVersion>, <release>, <build>);
```

**Parâmetros:**

- `majorVersion`: Versão de primeiro dígito do sistema
- `minorVersion`: Versão de segundo dígito do sistema
- `release`: Versão de terceiro dígito do sistema (release)
- `build`: Versão de quarto dígito do sistema (build)

**Exemplo:**

```lsp
Definir Numero vnMajorVersion;
Definir Numero vnMinorVersion;
Definir Numero vnRelease;
Definir Numero vnBuild;
Definir Alfa vaMensagem;

ObterVersaoSistema(vnMajorVersion, vnMinorVersion, vnRelease, vnBuild);

@ Após a chamada da função as variáveis conterão a versão do sistema @
Definir Alfa vaMajorStr;
Definir Alfa vaMinorStr;
Definir Alfa vaReleaseStr;
Definir Alfa vaBuildStr;

IntParaAlfa(vnMajorVersion, vaMajorStr);
IntParaAlfa(vnMinorVersion, vaMinorStr);
IntParaAlfa(vnRelease, vaReleaseStr);
IntParaAlfa(vnBuild, vaBuildStr);

vaMensagem = "Versão: " + vaMajorStr + "." + vaMinorStr + "." + vaReleaseStr + "." + vaBuildStr;
Mensagem(Retorna, vaMensagem);
```

#### ObtemIdiomaAtivo

Retorna o código do idioma utilizado pelo usuário.

**Sintaxe:**

```lsp
ObtemIdiomaAtivo(<valorIdioma>);
```

**Parâmetros:**

- `valorIdioma`: Campo ou variável que receberá o valor de retorno do idioma utilizado (ex: "PTBRN")

**Exemplo:**

```lsp
Definir Alfa vaValorIdioma;

ObtemIdiomaAtivo(vaValorIdioma);
Definir Alfa vaMensagemIdioma;
vaMensagemIdioma = "Idioma ativo: " + vaValorIdioma;
Mensagem(Retorna, vaMensagemIdioma);
```

#### sleep

Pausa a execução por um número especificado de milissegundos. Útil para simular tempo de processamento, aguardar operações ou criar delays controlados.

**Sintaxe:**

```lsp
sleep(<milissegundos>);
```

**Parâmetros:**

- `milissegundos`: Número de milissegundos para pausar a execução

**Exemplos:**

```lsp
@ Pausa de 1 segundo @
sleep(1000);

@ Pausa de 5 segundos @
sleep(5000);

@ Pausa de 100 milissegundos @
sleep(100);
```

**Exemplo com Barra de Progresso:**

```lsp
Definir Funcao exemploComSleep();

exemploComSleep();

Funcao exemploComSleep(); {
  IniciaBarraProgresso("Processamento", "Iniciando...");
  
  @ Simula processamento em etapas @
  AtualizaBarraProgresso(25, "Processando etapa 1...");
  sleep(2000); @ Pausa de 2 segundos @
  
  AtualizaBarraProgresso(50, "Processando etapa 2...");
  sleep(2000); @ Pausa de 2 segundos @
  
  AtualizaBarraProgresso(75, "Processando etapa 3...");
  sleep(2000); @ Pausa de 2 segundos @
  
  AtualizaBarraProgresso(100, "Concluído!");
  sleep(1000); @ Pausa de 1 segundo @
  
  FinalizaBarraProgresso();
  Mensagem(Retorna, "Processamento concluído!");
}
```

**Observações:**

- Use com moderação para não impactar a performance
- Útil em simulações e testes
- Valores muito altos podem travar a interface do usuário

**Exemplo de Informações do Sistema:**

```lsp
Definir Funcao informacoesSistema();

@ Variáveis globais @
Definir Alfa vaVersaoSistema;
Definir Alfa vaIdiomaAtivo;
Definir Alfa vaInformacoes;

informacoesSistema();

Funcao informacoesSistema(); {
  @ Obtém versão do sistema @
  ObterVersaoSistema(vaVersaoSistema);
  
  @ Obtém idioma ativo @
  ObtemIdiomaAtivo(vaIdiomaAtivo);
  
  @ Monta informações @
  Definir Alfa vaEnter;
  CaracterParaAlfa(13, vaEnter);
  
  vaInformacoes = "=== INFORMAÇÕES DO SISTEMA ===" + vaEnter;
  vaInformacoes = vaInformacoes + "Versão: " + vaVersaoSistema + vaEnter;
  vaInformacoes = vaInformacoes + "Idioma: " + vaIdiomaAtivo + vaEnter;
  vaInformacoes = vaInformacoes + "Usuário: " + NomUsu + vaEnter;
  vaInformacoes = vaInformacoes + "Empresa: " + Empresa + vaEnter;
  vaInformacoes = vaInformacoes + "Data: " + ExtSis;
  
  Mensagem(Retorna, vaInformacoes);
}
```

### Gerenciamento de Configuração

#### RetornaValorCFG

Responsável por retornar para a regra o valor de uma determinada chave da Central de Configuração Senior que está sendo utilizada pelo sistema.

**Sintaxe:**

```lsp
RetornaValorCFG(<chave>, <retorno>);
```

**Parâmetros:**

- `chave`: Nome da chave de configuração. Pode conter:
  - Nome completo da chave
  - Parte final de uma chave
  - Diretórios especiais: LOGS, TBS, IMAGENS, ARQUIVOS, GRAFICOS, IMPEXP, CONSULTAS, REGRAS, CUBOS, MODELOS, TBS_TRANSLATION_FILTER_FILE
- `retorno`: Variável que receberá o valor da chave

**Exemplos:**

```lsp
Definir Alfa vaChave;
Definir Alfa vaRetorno;
Definir Alfa vaMensagem;

@ Obter diretório de logs @
vaChave = "LOGS";
RetornaValorCFG(vaChave, vaRetorno);
@ Retorna algo como "\\servidor\ERP\Sapiens\Logs" @
vaMensagem = "Diretório de logs: " + vaRetorno;
Mensagem(Retorna, vaMensagem);

@ Obter chave específica @
vaChave = "com.senior.printers.path";
RetornaValorCFG(vaChave, vaRetorno);
@ Retorna algo como "\\servidor\ERP\Impressoras" @
vaMensagem = "Diretório de impressoras: " + vaRetorno;
Mensagem(Retorna, vaMensagem);
```

**Observações:**

- Caso o valor da chave esteja em branco, o valor retornado é "( NULO )"
- Se informada apenas a parte final do nome da chave, será retornado o valor da primeira chave localizada que contenha a parte final informada
- Não é permitida a visualização da chave PASSWORD do arquivo CFG

**Exemplo de Configuração Dinâmica:**

```lsp
Definir Funcao carregarConfiguracoes();

@ Variáveis globais @
Definir Alfa vaChaveTimeout;
Definir Alfa vaChaveDebug;
Definir Alfa vaValorTimeout;
Definir Alfa vaValorDebug;
Definir Numero vnTimeout;

vaChaveTimeout = "app.timeout.request";
vaChaveDebug = "app.debug.enabled";

carregarConfiguracoes();

Funcao carregarConfiguracoes(); {
  Definir Alfa vaMensagem;
  @ Carrega timeout da requisição @
  RetornaValorCFG(vaChaveTimeout, vaValorTimeout);
  Se (TamanhoAlfa(vaValorTimeout) > 0) {
    AlfaParaInt(vaValorTimeout, vnTimeout);
    vaMensagem = "Timeout configurado: " + vaValorTimeout + "ms";
    Mensagem(Retorna, vaMensagem);
  } Senao {
    vnTimeout = 30000; @ Padrão: 30 segundos @
    Mensagem(Retorna, "Timeout não configurado, usando padrão: 30000ms");
  }
  
  @ Carrega modo debug @
  RetornaValorCFG(vaChaveDebug, vaValorDebug);
  Se (vaValorDebug = "true") {
    Mensagem(Retorna, "Modo debug ativado");
  } Senao {
    Mensagem(Retorna, "Modo debug desativado");
  }
}
```
