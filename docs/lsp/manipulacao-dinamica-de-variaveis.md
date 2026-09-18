# Manipulação Dinâmica de Variáveis

A LSP oferece funções especializadas para trabalhar com variáveis cujos nomes são construídos dinamicamente durante a execução. Essas funções são úteis quando o nome da variável não é conhecido em tempo de desenvolvimento.

### Verificação de Tipo de Variável

#### PegarTipoVar

Retorna o tipo de uma variável qualquer, passada como string.

**Sintaxe:**

```lsp
PegarTipoVar(<nomeVariavel>, <tipo>);
```

**Parâmetros:**

- `nomeVariavel`: String contendo o nome da variável a ser verificada
- `tipo`: Variável numérica que receberá o código do tipo (retorno)

**Códigos de Retorno:**

- `-1`: Variável não encontrada
- `0`: Variável do tipo Numero
- `1`: Variável do tipo Data
- `2`: Variável do tipo Alfa
- `9`: Variável de outros tipos (Cursor, Lista, etc.)

**Exemplo:**

```lsp
Definir Numero vNum;
Definir Data vDat;
Definir Alfa vAlf;
Definir Cursor vCur;
Definir Numero vTipo;

PegarTipoVar("vNum", vTipo); @ vTipo = 0 @
PegarTipoVar("vDat", vTipo); @ vTipo = 1 @
PegarTipoVar("vAlf", vTipo); @ vTipo = 2 @
PegarTipoVar("vCur", vTipo); @ vTipo = 9 @
PegarTipoVar("vXXX", vTipo); @ vTipo = -1 @
```

### Obtenção de Valores de Variáveis

#### PegarValorVarAlf

Retorna o valor de uma variável alfanumérica identificada por nome.

**Sintaxe:**

```lsp
PegarValorVarAlf(<nomeVariavel>, <valorRetorno>);
```

**Parâmetros:**

- `nomeVariavel`: String contendo o nome da variável
- `valorRetorno`: Variável alfa que receberá o valor

**Exemplo:**

```lsp
Definir Alfa vTexto;
Definir Alfa vValor;
Definir Alfa vNomeVar;

vTexto = "Conteúdo da variável";
vNomeVar = "vTexto";

PegarValorVarAlf(vNomeVar, vValor);
@ vValor será "Conteúdo da variável" @

@ Erro se tentar acessar variável de tipo diferente @
@ PegarValorVarAlf("vnNumero", vValor); @ Gerará erro @
```

#### PegarValorVarNum

Retorna o valor de uma variável numérica ou de data identificada por nome.

**Sintaxe:**

```lsp
PegarValorVarNum(<nomeVariavel>, <valorRetorno>);
```

**Parâmetros:**

- `nomeVariavel`: String contendo o nome da variável
- `valorRetorno`: Variável numérica que receberá o valor

**Exemplo:**

```lsp
Definir Numero vNumero;
Definir Data vData;
Definir Numero vValor;

vNumero = 15;
vData = 39647;

PegarValorVarNum("vNumero", vValor); @ vValor = 15 @
PegarValorVarNum("vData", vValor);   @ vValor = 39647 @
```

### Atribuição de Valores a Variáveis

#### SetarValorVarAlf

Define o valor de uma variável alfanumérica identificada por nome.

**Sintaxe:**

```lsp
SetarValorVarAlf(<nomeVariavel>, <valor>);
```

**Parâmetros:**

- `nomeVariavel`: String contendo o nome da variável
- `valor`: Valor alfa a ser atribuído à variável

**Exemplo:**

```lsp
Definir Alfa vTexto;
Definir Alfa vNovoValor;

vNovoValor = "Novo conteúdo";
SetarValorVarAlf("vTexto", vNovoValor);
@ vTexto agora contém "Novo conteúdo" @
```

#### SetarValorVarNum

Define o valor de uma variável numérica ou de data identificada por nome.

**Sintaxe:**

```lsp
SetarValorVarNum(<nomeVariavel>, <valor>);
```

**Parâmetros:**

- `nomeVariavel`: String contendo o nome da variável
- `valor`: Valor numérico a ser atribuído à variável

**Exemplo:**

```lsp
Definir Numero vNumero;
Definir Data vData;

SetarValorVarNum("vNumero", 100);   @ vNumero = 100 @
SetarValorVarNum("vData", 39685);   @ vData = 39685 @
```

### Exemplo Prático: Acesso Dinâmico a Variáveis

```lsp
Definir Funcao exemploAcessoDinamico();

@ Variáveis globais @
Definir Alfa vaTexto1;
Definir Alfa vaTexto2;
Definir Alfa vaTexto3;
Definir Numero vnNumero1;
Definir Numero vnNumero2;

exemploAcessoDinamico();

Funcao exemploAcessoDinamico(); {
  Definir Numero vnContador;
  Definir Alfa vaNomeVar;
  Definir Alfa vaValor;
  Definir Numero vnTipo;
  Definir Numero vnValorNum;

  @ Inicializar algumas variáveis @
  vaTexto1 = "Primeiro texto";
  vaTexto2 = "Segundo texto";
  vnNumero1 = 100;
  vnNumero2 = 200;

  @ Loop dinâmico para acessar variáveis @
  Para (vnContador = 1; vnContador <= 2; vnContador++) {
    @ Construir nome da variável dinamicamente @
    IntParaAlfa(vnContador, vaValor);
    vaNomeVar = "vaTexto" + vaValor;

    @ Verificar se variável existe e seu tipo @
    PegarTipoVar(vaNomeVar, vnTipo);
    
    Se (vnTipo = 2) { @ Tipo Alfa @
      PegarValorVarAlf(vaNomeVar, vaValor);
      Definir Alfa vaMensagem;
      vaMensagem = "Variável " + vaNomeVar + ": " + vaValor;
      Mensagem(Retorna, vaMensagem);
    } Senao Se (vnTipo = 0) { @ Tipo Numero @
      PegarValorVarNum(vaNomeVar, vnValorNum);
      IntParaAlfa(vnValorNum, vaValor);
      vaMensagem = "Variável " + vaNomeVar + ": " + vaValor;
      Mensagem(Retorna, vaMensagem);
    } Senao Se (vnTipo = -1) {
      vaMensagem = "Variável " + vaNomeVar + " não encontrada";
      Mensagem(Retorna, vaMensagem);
    }
  }
}
```

**⚠️ Observações Importantes:**

- Essas funções devem ser usadas apenas quando o acesso direto não for possível
- Para situações simples, use acesso direto: `vVar = valor` em vez de `SetarValorVarAlf("vVar", valor)`
- Úteis para sistemas de configuração dinâmica e processamento de formulários genéricos
- Sempre verifique o tipo da variável antes de tentar acessar seu valor
