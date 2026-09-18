# Gerenciamento Avançado de Arquivos

Expansão das funcionalidades de manipulação de arquivos com recursos avançados.

### Criação e Exclusão de Arquivos Temporários

#### CriarArquivoTemporario

Cria um arquivo temporário com nome único.

**Sintaxe:**

```lsp
CriarArquivoTemporario(<prefixo>, <caminhoArquivo>);
```

#### ExcluirArquivoTemporario

Exclui um arquivo temporário criado anteriormente.

**Sintaxe:**

```lsp
ExcluirArquivoTemporario(<caminhoArquivo>);
```

#### LinhasArquivo

Conta o número de linhas em um arquivo através de parâmetro de retorno.

**Sintaxe:**

```lsp
LinhasArquivo(<caminhoArquivo>, <linhas>);
```

**Parâmetros:**

- `caminhoArquivo`: Caminho do arquivo a ser analisado
- `linhas`: Variável que receberá a quantidade de linhas

**Exemplo de Processamento de Arquivo Temporário:**

```lsp
Definir Funcao processarArquivoTemporario();

  @ Variáveis globais @
  Definir Alfa vaCaminhoTemp;
  Definir Numero vnArquivo;
  Definir Numero vnLinhas;
  Definir Alfa vaConteudo;
  Definir Numero vnContador;
  Definir Alfa vaQuantidadeStr;
  Definir Alfa vaMensagem;

processarArquivoTemporario();

Funcao processarArquivoTemporario(); {
  @ 1. Cria arquivo temporário @
  CriarArquivoTemporario("processamento_", vaCaminhoTemp);
  vaMensagem = "Arquivo temporário criado: " + vaCaminhoTemp;
  Mensagem(Retorna, vaMensagem);
  
  @ 2. Escreve dados no arquivo @
  vnArquivo = Abrir(vaCaminhoTemp, Gravarnl);
  Para (vnContador = 1; vnContador <= 10; vnContador++) {
    vaConteudo = "Linha " + IntParaAlfa(vnContador) + " do arquivo temporário";
    Gravarnl(vnArquivo, vaConteudo);
  }
  Fechar(vnArquivo);
  
  @ 3. Verifica o arquivo criado @
  LinhasArquivo(vaCaminhoTemp, vnLinhas);
  IntParaAlfa(vnLinhas, vaQuantidadeStr);
  vaMensagem = "Arquivo criado com " + vaQuantidadeStr + " linhas";
  Mensagem(Retorna, vaMensagem);
  
  @ 4. Processa o arquivo @
  IniciaBarraProgresso("Processando Arquivo", "Lendo linhas...");
  vnArquivo = Abrir(vaCaminhoTemp, Lernl);
  
  Para (vnContador = 1; vnContador <= vnLinhas; vnContador++) {
    Lernl(vnArquivo, vaConteudo);
    AtualizaBarraProgresso((vnContador * 100) / vnLinhas, "Processando: " + vaConteudo);
    sleep(100); @ Simula processamento @
  }
  
  Fechar(vnArquivo);
  FinalizaBarraProgresso();
  
  @ 5. Remove arquivo temporário @
  ExcluirArquivoTemporario(vaCaminhoTemp);
  Mensagem(Retorna, "Arquivo temporário removido");
}
```

### Execução de Programas Externos

#### ExecProg

Executa um programa externo a partir da regra LSP.

**Sintaxe:**

```lsp
ExecProg(<comando>, <parametros>, <aguardarTermino>);
```

**Exemplo de Integração com Ferramentas Externas:**

```lsp
Definir Funcao integracaoFerramentasExternas();

@ Variáveis globais @
Definir Alfa vaComando;
Definir Alfa vaParametros;
Definir Alfa vaCaminhoArquivo;

vaCaminhoArquivo = "C:\\temp\\relatorio.txt";

integracaoFerramentasExternas();

Funcao integracaoFerramentasExternas(); {
  Definir Alfa vaMensagem;
  @ 1. Abre arquivo no Bloco de Notas @
  vaComando = "notepad.exe";
  vaParametros = vaCaminhoArquivo;
  
  Se (ArqExiste(vaCaminhoArquivo) = 1) {
    ExecProg(vaComando, vaParametros, 0); @ Não aguarda terminar @
    vaMensagem = "Arquivo aberto no Bloco de Notas";
    Mensagem(Retorna, vaMensagem);
  } Senao {
    vaMensagem = "Arquivo não encontrado: " + vaCaminhoArquivo;
    Mensagem(Erro, vaMensagem);
  }
  
  @ 2. Abre explorador de arquivos @
  vaComando = "explorer.exe";
  vaParametros = "C:\\temp";
  ExecProg(vaComando, vaParametros, 0);
  Mensagem(Retorna, "Explorador de arquivos aberto");
  
  @ 3. Executa comando do sistema @
  vaComando = "cmd.exe";
  vaParametros = "/c dir C:\\temp > C:\\temp\\listagem.txt";
  ExecProg(vaComando, vaParametros, 1); @ Aguarda terminar @
  Mensagem(Retorna, "Listagem de arquivos gerada");
}
```
