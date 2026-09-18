# Funções de Lista de Regras

As funções de Lista de Regras (ListaRegra*) são utilizadas para manipular listas especiais que podem carregar dados diretamente de estruturas JSON ou outras fontes de dados estruturados. Essas funções oferecem uma forma simplificada de processar dados complexos.

### Criação e Carregamento de Listas

#### ListaRegraCriarLista

Cria uma nova lista de regras para armazenar dados estruturados.

**Sintaxe:**

```lsp
ListaRegraCriarLista(<numeroLista>);
```

**Parâmetros:**

- `numeroLista`: Variável numérica que receberá o identificador da lista criada

**Exemplo:**

```lsp
Definir Numero nLista;

ListaRegraCriarLista(nLista);
@ nLista agora contém o identificador da lista criada @
```

#### ListaRegraCarregarJson

Esta função lê os dados de um arquivo JSON e os carrega em uma lista onde cada campo do JSON é uma coluna na lista e cada registro é uma linha.

**Sintaxe:**

```lsp
ListaRegraCarregarJson(Numero aLista, Alfa aJson, Alfa aGrupo, Alfa aCampos);
```

**Parâmetros:**

| Nome | Tipo | Descrição |
|------|------|-----------|
| `aLista` | Número | Recebe o endereço de memória da lista criada |
| `aJson` | Alfa | Recebe o conteúdo de um arquivo JSON |
| `aGrupo` | Alfa | Recebe o grupo que deve ser lido do JSON |
| `aCampos` | Alfa | Recebe os campos a serem lidos do JSON (os campos devem ser separados por ";"). No entanto, caso o campo informado no parâmetro não exista no JSON, a função emitirá erro, indicando que o campo é inexistente ou que não pode ser encontrado |

**Tipo de retorno:** Nenhum.

**Exemplo:**

```lsp
Definir Alfa vaArquivo;
Definir Alfa vaLinha;
Definir Alfa vaConteudoJson;
Definir Alfa vaAchou;
Definir Alfa vaObteve;
Definir Alfa vaId;
Definir Alfa vaCodigo;
Definir Alfa vaDescricao;
Definir Alfa vaComplemento;
Definir Alfa vaGrupo;
Definir Alfa vaMsgTeste;
Definir Numero vnArquivo;
Definir Numero vnLstIte;

vaArquivo = "C:\\Arquivos\\teste.txt";

@ Verifica se o arquivo existe @
Se ((vaArquivo <> "") e (ArqExiste(vaArquivo))) {
  vaConteudoJson = "";
  
  @ Abre o arquivo JSON @
  vnArquivo = Abrir(vaArquivo, "LerNL");
  
  @ Lê todas as linhas do arquivo @
  Enquanto (LerNL(vnArquivo, vaLinha) = 1) {
    vaConteudoJson = vaConteudoJson + vaLinha;
  }
  
  @ Fecha o arquivo @
  Fechar(vnArquivo);
  
  @ Criar lista para tratar os itens que foram gerados para os itens @
  ListaRegraCriarLista(vnLstIte);
  ListaRegraCarregarJson(vnLstIte, vaConteudoJson, "itens", "id;codigo;descricao;complemento;grupo");
  
  @ Navega pela lista carregada @
  ListaRegraPrimeiro(vnLstIte, vaAchou);
  Enquanto (vaAchou = "S") {
    @ Obter os valores dos campos da lista @
    ListaRegraObterValorNumero(vnLstIte, "id", vaId, vaObteve);
    ListaRegraObterValorAlfa(vnLstIte, "codigo", vaCodigo, vaObteve);
    ListaRegraObterValorAlfa(vnLstIte, "descricao", vaDescricao, vaObteve);
    ListaRegraObterValorAlfa(vnLstIte, "complemento", vaComplemento, vaObteve);
    ListaRegraObterValorAlfa(vnLstIte, "grupo", vaGrupo, vaObteve);
    
    @ Constrói mensagem de teste @
    vaMsgTeste = "Leitura Arquivo com Array - ID: " + vaId + 
                  " Descricao: " + vaDescricao + 
                  " Código Item: " + vaCodigo + 
                  " Complemento: " + vaComplemento + 
                  " Grupo: " + vaGrupo;
    
    Mensagem(Retorna, vaMsgTeste);
    
    @ Move para o próximo registro @
    ListaRegraProximo(vnLstIte, vaAchou);
  }
}
```

**JSON de Exemplo (teste.txt):**

```json
{
  "Documento": {
    "Id": 183190,
    "Descricao": "TESTE",
    "CriadoPor": "email@email.com.br",
    "AtualizadoPor": "email@email.com.br",
    "CodigoErp": "1072"
  },
  "itens": [
    {
      "Id": 204923,
      "Codigo": "1001000002",
      "Descricao": "TESTE DE DESCRICAO DO ITEM 1",
      "Complemento": "TESTE DE COMPLEMENTO",
      "Grupo": "D"
    },
    {
      "Id": 204922,
      "Codigo": "1001000001",
      "Descricao": "TESTE DESCRICAO DO ITEM",
      "Grupo": "I"
    }
  ]
}
```

**Utilização da Função (dependentes):** Conforme consta no exemplo de regra, é necessário a utilização da função `ListaRegraCriarLista(NumeroEnd aLista)` para criação da lista com os itens que serão lidos do arquivo.txt dentro da função `ListaRegraCarregarJson`.

**⚠️ Observação Importante:** Não é possível realizar a leitura de arrays nesta função. A função trabalha com objetos JSON que contêm arrays, mas não consegue processar arrays diretamente.

### Navegação em Listas de Regras

#### ListaRegraPrimeiro

Posiciona a lista no primeiro registro.

**Sintaxe:**

```lsp
ListaRegraPrimeiro(<numeroLista>, <achou>);
```

**Parâmetros:**

- `numeroLista`: Identificador da lista
- `achou`: Variável alfa que receberá "S" se encontrou registro, "N" se não encontrou

**Exemplo:**

```lsp
Definir Numero nLista;
Definir Alfa vaAchou;

ListaRegraPrimeiro(nLista, vaAchou);
Se (vaAchou = "S") {
  @ Lista posicionada no primeiro registro @
  Mensagem(Retorna, "Primeiro registro encontrado");
} Senao {
  @ Lista vazia @
  Mensagem(Retorna, "Lista vazia");
}
```

#### ListaRegraProximo

Move para o próximo registro da lista.

**Sintaxe:**

```lsp
ListaRegraProximo(<numeroLista>, <achou>);
```

**Parâmetros:**

- `numeroLista`: Identificador da lista
- `achou`: Variável alfa que receberá "S" se encontrou registro, "N" se chegou ao fim

**Exemplo:**

```lsp
Definir Numero nLista;
Definir Alfa vaAchou;

ListaRegraProximo(nLista, vaAchou);
Se (vaAchou = "S") {
  @ Moveu para próximo registro @
  Mensagem(Retorna, "Próximo registro encontrado");
} Senao {
  @ Chegou ao fim da lista @
  Mensagem(Retorna, "Fim da lista");
}
```

### Obtenção de Dados

#### ListaRegraObterValorAlfa

Obtém o valor de um campo específico do registro atual da lista.

**Sintaxe:**

```lsp
ListaRegraObterValorAlfa(<numeroLista>, <nomeCampo>, <valor>, <obteve>);
```

**Parâmetros:**

- `numeroLista`: Identificador da lista
- `nomeCampo`: Nome do campo a ser obtido
- `valor`: Variável alfa que receberá o valor do campo
- `obteve`: Variável alfa que receberá "S" se obteve valor, "N" se não obteve

**Exemplo:**

```lsp
Definir Numero nLista;
Definir Alfa vaNome;
Definir Alfa vaIdade;
Definir Alfa vaObteve;

@ Obter nome do registro atual @
ListaRegraObterValorAlfa(nLista, "nome", vaNome, vaObteve);
Se (vaObteve = "S") {
  Mensagem(Retorna, "Nome: " + vaNome);
}

@ Obter idade do registro atual @
ListaRegraObterValorAlfa(nLista, "idade", vaIdade, vaObteve);
Se (vaObteve = "S") {
  Mensagem(Retorna, "Idade: " + vaIdade);
}
```

### Exemplo Prático Completo: Processamento de JSON

```lsp
Definir Funcao processarUsuariosJSON();

@ Variáveis globais @
Definir Alfa vaJSONResposta;
Definir Numero nListaUsuarios;

@ JSON de exemplo vindo de API @
vaJSONResposta = "[{\"id\":\"1\",\"nome\":\"João Silva\",\"email\":\"joao@exemplo.com\"},{\"id\":\"2\",\"nome\":\"Maria Santos\",\"email\":\"maria@exemplo.com\"}]";

processarUsuariosJSON();

Funcao processarUsuariosJSON(); {
  Definir Alfa vaJSONModificado;
  Definir Alfa vaAchou;
  Definir Alfa vaObteve;
  Definir Alfa vaId;
  Definir Alfa vaNome;
  Definir Alfa vaEmail;
  Definir Numero vnContador;
  
  @ Encapsular array em objeto @
  vaJSONModificado = "{\"usuarios\":" + vaJSONResposta + "}";
  
  @ Criar e carregar lista @
  ListaRegraCriarLista(nListaUsuarios);
  ListaRegraCarregarJson(nListaUsuarios, vaJSONModificado, "usuarios", "id;nome;email");
  
  @ Verificar se carregou dados @
  ListaRegraPrimeiro(nListaUsuarios, vaAchou);
  
  Se (vaAchou = "S") {
    vnContador = 0;
    
    @ Processar todos os registros @
    Enquanto (vaAchou = "S") {
      vnContador++;
      
      @ Obter dados do registro atual @
      ListaRegraObterValorAlfa(nListaUsuarios, "id", vaId, vaObteve);
      ListaRegraObterValorAlfa(nListaUsuarios, "nome", vaNome, vaObteve);
      ListaRegraObterValorAlfa(nListaUsuarios, "email", vaEmail, vaObteve);
      
      @ Processar dados @
      Definir Alfa vaMensagem;
      Definir Alfa vaContadorStr;
      IntParaAlfa(vnContador, vaContadorStr);
      vaMensagem = "Usuário " + vaContadorStr + ": " + vaNome + " (" + vaEmail + ")";
      Mensagem(Retorna, vaMensagem);
      
      @ Mover para próximo @
      ListaRegraProximo(nListaUsuarios, vaAchou);
    }
    
    IntParaAlfa(vnContador, vaContadorStr);
    vaMensagem = "Total de usuários processados: " + vaContadorStr;
    Mensagem(Retorna, vaMensagem);
  } Senao {
    Mensagem(Erro, "Falha ao carregar dados JSON na lista");
  }
}
```

### Casos de Uso Comuns

1. **Processamento de Respostas de API**: Carregar e processar dados JSON retornados por APIs REST
2. **Integração de Sistemas**: Processar arquivos de dados estruturados
3. **Transformação de Dados**: Converter estruturas complexas em dados tabulares
4. **Validação em Lote**: Processar múltiplos registros para validação

### Vantagens das Listas de Regras

- **Simplicidade**: Carregamento direto de JSON sem parsing manual
- **Performance**: Processamento otimizado para estruturas de dados
- **Flexibilidade**: Suporte a estruturas JSON complexas
- **Manutenibilidade**: Código mais limpo comparado ao parsing manual

### Funções Completas de Lista de Regras

#### Funções de Pesquisa

##### ListaRegraAddProcurarAlfa

Adiciona colunas e valores alfanuméricos para pesquisa na lista. Pode ser executada quantas vezes for necessário.

**Sintaxe:**

```lsp
ListaRegraAddProcurarAlfa(Numero aLista, Alfa aColuna, Alfa aValor, Alfa End aExecutou);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aColuna`: Variável alfa que recebe o nome da coluna
- `aValor`: Variável alfa que recebe o valor da coluna a ser procurada

**Tipo de retorno:**

- `aExecutou`: Indica se foi adicionado valor. "S" para adicionada ou "N" para não adicionado

**Utilização da Função (dependentes):** ListaRegraInicializarProcurar

**Exemplo:**

```lsp
ListaRegraAddProcurarAlfa(VenNLista, 'CodPro', '1103', VenA_S_N);
```

##### ListaRegraAddProcurarData

Adiciona colunas e valores de data para pesquisa na lista. Pode ser executada quantas vezes for necessário.

**Sintaxe:**

```lsp
ListaRegraAddProcurarData(Numero aLista, Alfa aColuna, Data aValor, Alfa End aExecutou);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aColuna`: Variável alfa que recebe o nome da coluna
- `aValor`: Variável de data que recebe o valor da coluna a ser procurada

**Tipo de retorno:**

- `aExecutou`: Indica se foi adicionado valor. "S" para adicionada ou "N" para não adicionado

**Utilização da Função (dependentes):** ListaRegraInicializarProcurar

**Exemplo:**

```lsp
ListaRegraAddProcurarData(VenNLista, 'DatEnt', 4235, VenA_S_N);
```

##### ListaRegraAddProcurarNumero

Adiciona colunas e valores numéricos para pesquisa na lista. Pode ser executada quantas vezes for necessário.

**Sintaxe:**

```lsp
ListaRegraAddProcurarNumero(Numero aLista, Alfa aColuna, Numero aValor, Alfa End aExecutou);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aColuna`: Variável alfa que recebe o nome da coluna
- `aValor`: Variável numérica que recebe o valor da coluna a ser procurada

**Tipo de retorno:**

- `aExecutou`: Indica se foi adicionado valor. "S" para adicionada ou "N" para não adicionado

**Utilização da Função (dependentes):** ListaRegraInicializarProcurar

**Exemplo:**

```lsp
ListaRegraAddProcurarNumero(VenNLista, 'CodPro', 1103, VenA_S_N);
```

##### ListaRegraInicializarProcurar

Limpa pesquisas anteriores e prepara a lista para uma nova consulta. Deve ser chamada uma única vez antes das funções de pesquisa.

**Sintaxe:**

```lsp
ListaRegraInicializarProcurar(Numero aLista, Alfa End aExecutou);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Tipo de retorno:**

- `aExecutou`: Indica se foi executado. "S" para executado ou "N" para não executado

**Exemplo:**

```lsp
ListaRegraInicializarProcurar(VenNLista, VenA_S_N);
```

##### ListaRegraProcurarAlfa

Pesquisa valor do tipo alfa na lista.

**Sintaxe:**

```lsp
ListaRegraProcurarAlfa(Numero aLista, Alfa aColuna, Alfa aValor, Alfa End aExisteRegistro);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aColuna`: Variável alfa que recebe o nome da coluna
- `aValor`: Variável alfa que recebe o valor da coluna a ser procurado

**Tipo de retorno:**

- `aExisteRegistro`: Indica se existe valor na lista. "S" para existe e "N" para não existe

**Exemplo:**

```lsp
ListaRegraProcurarAlfa(VenNLista, "CodPro", '1103', VenA_S_N);
```

**Observações:** Quando encontrada, a função posiciona na primeira ocorrência. Pode-se chamar funções para navegar entre as ocorrências: ListaRegraProcurarProximo ou ListaRegraProcurarAnterior.

##### ListaRegraProcurarData

Pesquisa valor do tipo data na lista.

**Sintaxe:**

```lsp
ListaRegraProcurarData(Numero aLista, Alfa aColuna, Data aValor, Alfa End aExisteRegistro);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aColuna`: Variável alfa que recebe o nome da coluna
- `aValor`: Variável de data que recebe o valor da coluna a ser procurado

**Tipo de retorno:**

- `aExisteRegistro`: Indica se existe valor na lista. "S" para existe e "N" para não existe

**Exemplo:**

```lsp
ListaRegraProcurarData(VenNLista, "DatEnt", 4235, VenA_S_N);
```

##### ListaRegraProcurarNumero

Pesquisa valor do tipo numérico na lista.

**Sintaxe:**

```lsp
ListaRegraProcurarNumero(Numero aLista, Alfa aColuna, Numero aValor, Alfa End aExisteRegistro);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aColuna`: Variável alfa que recebe o nome da coluna
- `aValor`: Variável numérica que recebe o valor da coluna a ser procurado

**Tipo de retorno:**

- `aExisteRegistro`: Indica se existe valor na lista. "S" para existe e "N" para não existe

**Exemplo:**

```lsp
ListaRegraProcurarNumero(VenNLista, "CodPro", 1103, VenA_S_N);
```

##### ListaRegraProcurarRegistro

Pesquisa registros na lista baseado nos critérios configurados pelas funções ListaRegraAddProcurar*.

**Sintaxe:**

```lsp
ListaRegraProcurarRegistro(Numero aLista, Alfa End aExisteRegistro);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Tipo de retorno:**

- `aExisteRegistro`: Indica se existe valor na lista. "S" para existe e "N" para não existe

**Utilização da Função (dependentes):** ListaRegraAddProcurarAlfa, ListaRegraAddProcurarNumero e ListaRegraAddProcurarData

**Exemplo:**

```lsp
ListaRegraProcurarRegistro(VenNLista, VenA_S_N);
```

##### ListaRegraProcurarAnterior

Verifica se existe mais algum registro com os mesmos valores informados na pesquisa anterior. Procura do registro anterior até o primeiro.

**Sintaxe:**

```lsp
ListaRegraProcurarAnterior(Numero aLista, Alfa End aExisteRegistro);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Tipo de retorno:**

- `aExisteRegistro`: Indicativo se foi localizado um novo registro. "S" para localizou ou "N" para não localizou

**Utilização da Função (dependentes):** ListaRegraProcurarRegistro, ListaRegraProcurarAlfa, ListaRegraProcurarNumero, ListaRegraProcurarData

**Exemplo:**

```lsp
ListaRegraProcurarAnterior(VenNLista, VenA_S_N);
```

##### ListaRegraProcurarProximo

Verifica se existe mais algum registro com os mesmos valores informados na pesquisa anterior. Procura da próxima linha até a última.

**Sintaxe:**

```lsp
ListaRegraProcurarProximo(Numero aLista, Alfa End aExisteRegistro);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Tipo de retorno:**

- `aExisteRegistro`: Indicativo se foi localizado um novo registro. "S" para localizou ou "N" para não localizou

**Utilização da Função (dependentes):** ListaRegraProcurarRegistro, ListaRegraProcurarAlfa, ListaRegraProcurarNumero, ListaRegraProcurarData

**Exemplo:**

```lsp
ListaRegraProcurarProximo(VenNLista, VenA_S_N);
```

#### Funções de Navegação

##### ListaRegraAnterior

Posiciona no registro anterior da lista.

**Sintaxe:**

```lsp
ListaRegraAnterior(Numero aLista, Alfa End aExecutou);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Tipo de retorno:**

- `aExecutou`: Variável alfa que retorna se a instrução foi executada. "S" para executada e "N" para não executada

**Exemplo:**

```lsp
ListaRegraAnterior(VenNLista, VenA_S_N);
```

##### ListaRegraUltimo

Posiciona no último registro da lista.

**Sintaxe:**

```lsp
ListaRegraUltimo(Numero aLista, Alfa End aExecutou);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Tipo de retorno:**

- `aExecutou`: Variável alfa que retorna se a instrução foi executada. "S" para executada e "N" para não executada

**Exemplo:**

```lsp
ListaRegraUltimo(VenNLista, VenA_S_N);
```

##### ListaRegraInicio

Posiciona no primeiro registro da lista.

**Sintaxe:**

```lsp
ListaRegraInicio(Numero aLista, Alfa End aExecutou);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Tipo de retorno:**

- `aInicio`: Variável alfa que retorna se está no início da lista. "S" para início e "N" para não está no início

**Exemplo:**

```lsp
ListaRegraInicio(VenNLista, VenA_S_N);
```

##### ListaRegraFim

Verifica se é o fim da lista de registros.

**Sintaxe:**

```lsp
ListaRegraFim(Numero aLista, Alfa End aFim);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Tipo de retorno:**

- `aFim`: Variável alfa que retorna se está no fim da lista. "S" para fim e "N" para não está no final

**Exemplo:**

```lsp
ListaRegraFim(VenNLista, VenA_S_N);
```

##### ListaRegraIrPara

Navega para uma posição específica na lista.

**Sintaxe:**

```lsp
ListaRegraIrPara(Numero aLista, Numero aPosicao, Alfa End aExecutou);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aPosicao`: Variável numérica que recebe o valor para qual deseja se posicionar na lista

**Tipo de retorno:**

- `aExecutou`: Indicativo se foi posicionado na lista. "S" para posicionado ou "N" para não posicionado

**Exemplo:**

```lsp
ListaRegraIrPara(VenNLista, 3, VenA_S_N);
```

##### ListaRegraPosicaoAtual

Retorna o posicionamento atual da lista (linha atual). Lista inicia na posição 0 até o total de linhas - 1. Quando estiver em posição inválida será retornado -1.

**Sintaxe:**

```lsp
ListaRegraPosicaoAtual(Numero aLista, Numero End aPosicao);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Tipo de retorno:**

- `aPosicao`: Retorna a posição em que está na lista

**Exemplo:**

```lsp
ListaRegraPosicaoAtual(VenNLista, VenMPosicaoAtual);
```

#### Funções de Manipulação de Dados

##### ListaRegraAddValorLinhaAlfa

Adiciona valor alfanumérico em uma coluna de uma linha.

**Sintaxe:**

```lsp
ListaRegraAddValorLinhaAlfa(Numero aLista, Alfa aColuna, Alfa aValor, Alfa End aExecutou);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aColuna`: Variável alfa que recebe o nome da coluna
- `aValor`: Variável alfa que recebe o valor da coluna a ser adicionada

**Tipo de retorno:**

- `aExecutou`: Indica se foi adicionado valor. "S" para adicionada ou "N" para não adicionado

**Utilização da Função (dependentes):** ListaRegraNovaLinha

**Exemplo:**

```lsp
ListaRegraAddValorLinhaAlfa(VenNLista, 'CodPro', '1103', VenA_S_N);
```

**Observações:** Ao enviar lista para regra pode-se optar por não permitir que sejam incluídas novas linhas via regra. Permissão pode ser consultada pela função ListaRegraPodeIncluir.

##### ListaRegraAddValorLinhaData

Adiciona valor de data em uma coluna de uma linha.

**Sintaxe:**

```lsp
ListaRegraAddValorLinhaData(Numero aLista, Alfa aColuna, Data aValor, Alfa End aExecutou);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aColuna`: Variável alfa que recebe o nome da coluna
- `aValor`: Variável de data que recebe o valor da coluna a ser adicionada

**Tipo de retorno:**

- `aExecutou`: Indica se foi adicionado valor. "S" para adicionada ou "N" para não adicionado

**Utilização da Função (dependentes):** ListaRegraNovaLinha

**Exemplo:**

```lsp
ListaRegraAddValorLinhaData(VenNLista, 'DatEnt', 4235, VenA_S_N);
```

**Observações:** Ao enviar lista para regra pode-se optar por não permitir que sejam incluídas novas linhas via regra. Permissão pode ser consultada pela função ListaRegraPodeIncluir.

##### ListaRegraAddValorLinhaNumero

Adiciona valor numérico em uma coluna de uma linha.

**Sintaxe:**

```lsp
ListaRegraAddValorLinhaNumero(Numero aLista, Alfa aColuna, Numero aValor, Alfa End aExecutou);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aColuna`: Variável alfa que recebe o nome da coluna
- `aValor`: Variável numérica que recebe o valor da coluna a ser adicionada

**Tipo de retorno:**

- `aExecutou`: Indica se foi adicionado valor. "S" para adicionada ou "N" para não adicionado

**Utilização da Função (dependentes):** ListaRegraNovaLinha

**Exemplo:**

```lsp
ListaRegraAddValorLinhaNumero(VenNLista, 'CodPro', 1103, VenA_S_N);
```

**Observações:** Ao enviar lista para regra pode-se optar por não permitir que sejam incluídas novas linhas via regra. Permissão pode ser consultada pela função ListaRegraPodeIncluir.

##### ListaRegraAlterarLinhaAlfa

Altera valor alfanumérico de uma coluna na linha atual da lista.

**Sintaxe:**

```lsp
ListaRegraAlterarLinhaAlfa(Numero aLista, Alfa aColuna, Alfa aValor, Alfa End aExecutou);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aColuna`: Variável alfa que recebe o nome da coluna
- `aValor`: Variável alfa que recebe o novo valor da coluna a ser alterado

**Tipo de retorno:**

- `aExecutou`: Indica se foi alterado valor. "S" para alterado ou "N" para não alterado

**Exemplo:**

```lsp
ListaRegraAlterarLinhaAlfa(VenNLista, 'CodPro', '1104', VenA_S_N);
```

**Observações:** Ao enviar lista para regra pode-se optar por não permitir que sejam alteradas linhas via regra. Permissão pode ser consultada pela função ListaRegraPodeAlterar.

##### ListaRegraAlterarLinhaData

Altera valor de data de uma coluna na linha atual da lista.

**Sintaxe:**

```lsp
ListaRegraAlterarLinhaData(Numero aLista, Alfa aColuna, Data aValor, Alfa End aExecutou);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aColuna`: Variável alfa que recebe o nome da coluna
- `aValor`: Variável de data que recebe o novo valor da coluna a ser alterado

**Tipo de retorno:**

- `aExecutou`: Indica se foi alterado valor. "S" para alterado ou "N" para não alterado

**Exemplo:**

```lsp
ListaRegraAlterarLinhaData(VenNLista, 'DatEnt', 4504, VenA_S_N);
```

**Observações:** Ao enviar lista para regra pode-se optar por não permitir que sejam alteradas linhas via regra. Permissão pode ser consultada pela função ListaRegraPodeAlterar.

##### ListaRegraAlterarLinhaNumero

Altera valor numérico de uma coluna na linha atual da lista.

**Sintaxe:**

```lsp
ListaRegraAlterarLinhaNumero(Numero aLista, Alfa aColuna, Numero aValor, Alfa End aExecutou);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aColuna`: Variável alfa que recebe o nome da coluna
- `aValor`: Variável numérica que recebe o novo valor da coluna a ser alterado

**Tipo de retorno:**

- `aExecutou`: Indica se foi alterado valor. "S" para alterado ou "N" para não alterado

**Exemplo:**

```lsp
ListaRegraAlterarLinhaNumero(VenNLista, 'CodPro', 1104, VenA_S_N);
```

**Observações:** Ao enviar lista para regra pode-se optar por não permitir que sejam alteradas linhas via regra. Permissão pode ser consultada pela função ListaRegraPodeAlterar.

##### ListaRegraNovaLinha

Inicia a inclusão de uma nova linha na lista.

**Sintaxe:**

```lsp
ListaRegraNovaLinha(Numero aLista);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Exemplo:**

```lsp
ListaRegraNovaLinha(VenNLista);
```

**Observações:** Ao enviar lista para regra pode-se optar por não permitir que sejam incluídas novas linhas via regra, caso a lista não tenha permissão para inclusão será retornado um erro do tipo exceção. Permissão pode ser consultada pela função ListaRegraPodeIncluir.

##### ListaRegraSalvarLinha

Salva uma linha na lista (confirma as alterações).

**Sintaxe:**

```lsp
ListaRegraSalvarLinha(Numero aLista);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Utilização da Função (dependentes):** ListaRegraNovaLinha, ListaRegraAddValorLinhaAlfa, ListaRegraAddValorLinhaNumero, ListaRegraAddValorLinhaData

**Exemplo:**

```lsp
ListaRegraSalvarLinha(VenNLista);
```

**Observações:** Caso a lista não esteja em inclusão será retornado um erro do tipo exceção. Situação pode ser consultada pela função ListaRegraEmInclusao.

##### ListaRegraExcluirLinha

Exclui a linha atual posicionada da lista.

**Sintaxe:**

```lsp
ListaRegraExcluirLinha(Numero aLista);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Exemplo:**

```lsp
ListaRegraExcluirLinha(VenNLista);
```

**Observações:** Ao enviar lista para regra pode-se optar por não permitir que sejam excluídas linhas via regra, caso a lista não tenha permissão para exclusão será retornado um erro do tipo exceção. Permissão pode ser consultada pela função ListaRegraPodeExcluir.

#### Funções de Obtenção de Dados

##### ListaRegraObterValorData

Obtém valor de data de um campo específico do registro atual.

**Sintaxe:**

```lsp
ListaRegraObterValorData(Numero aLista, Alfa aColuna, Data End aValor, Alfa End aObteve);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aColuna`: Variável alfa que recebe o nome da coluna da qual deseja obter o valor

**Tipo de retorno:**

- `aValor`: Variável de data que retorna o valor da coluna
- `aObteve`: Indica se foi possível obter o valor. "S" para obteve e "N" para não obteve

**Exemplo:**

```lsp
ListaRegraObterValorData(VenNLista, "DatEnt", obtValorData, VenA_S_N);
```

##### ListaRegraObterValorNumero

Obtém valor numérico de um campo específico do registro atual.

**Sintaxe:**

```lsp
ListaRegraObterValorNumero(Numero aLista, Alfa aColuna, Numero End aValor, Alfa End aObteve);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aColuna`: Variável alfa que recebe o nome da coluna da qual deseja obter o valor

**Tipo de retorno:**

- `aValor`: Variável numérica que retorna o valor da coluna
- `aObteve`: Indica se foi possível obter o valor. "S" para obteve e "N" para não obteve

**Exemplo:**

```lsp
ListaRegraObterValorNumero(VenNLista, "CodPro", obtValorNum, VenA_S_N);
```

#### Funções de Controle e Permissões

##### ListaRegraEmInclusao

Verifica se a lista está em modo de inclusão (permite incluir novas colunas).

**Sintaxe:**

```lsp
ListaRegraEmInclusao(Numero aLista, Alfa End aEmInclusao);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Tipo de retorno:**

- `aEmInclusao`: Indica se a situação da lista permite incluir novas colunas na linha. "S" para permite incluir ou "N" para não permite incluir

**Exemplo:**

```lsp
ListaRegraEmInclusao(VenNLista, VenA_S_N);
```

##### ListaRegraPodeAlterar

Verifica se o usuário tem permissão para alterar valor de uma coluna da linha atual.

**Sintaxe:**

```lsp
ListaRegraPodeAlterar(Numero aLista, Alfa End aPermite);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Tipo de retorno:**

- `aPermite`: Indicativo se pode alterar uma linha. "S" para pode alterar ou "N" para não pode alterar

**Exemplo:**

```lsp
ListaRegraPodeAlterar(VenNLista, VenA_S_N);
```

##### ListaRegraPodeExcluir

Verifica se o usuário tem permissão para excluir a linha atual.

**Sintaxe:**

```lsp
ListaRegraPodeExcluir(Numero aLista, Alfa End aPermite);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Tipo de retorno:**

- `aPermite`: Indicativo se pode excluir uma linha. "S" para pode excluir ou "N" para não pode excluir

**Exemplo:**

```lsp
ListaRegraPodeExcluir(VenNLista, VenA_S_N);
```

##### ListaRegraPodeIncluir

Verifica se o usuário tem permissão para incluir uma nova linha.

**Sintaxe:**

```lsp
ListaRegraPodeIncluir(Numero aLista, Alfa End aPermite);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Tipo de retorno:**

- `aPermite`: Indicativo se pode incluir uma linha. "S" para pode incluir ou "N" para não pode incluir

**Exemplo:**

```lsp
ListaRegraPodeIncluir(VenNLista, VenA_S_N);
```

#### Funções de Utilidade

##### ListaRegraTotalLinhas

Retorna o total de linhas na lista. Quando a lista estiver vazia, será retornado -1.

**Sintaxe:**

```lsp
ListaRegraTotalLinhas(Numero aLista, Numero End aTotal);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista

**Tipo de retorno:**

- `aTotal`: Total de linhas na lista

**Exemplo:**

```lsp
ListaRegraTotalLinhas(VenNLista, VenATotalLinha);
```

##### ListaRegraLiberarLista

Libera a lista criada para manipular valores dentro da regra.

**Sintaxe:**

```lsp
ListaRegraLiberarLista();
```

**Parâmetros:** Nenhum

**Tipo de retorno:** Nenhum

**Utilização da Função (dependentes):** ListaRegraCriarLista

**Exemplo:**

```lsp
ListaRegraLiberarLista();
```

**Observações:** É muito importante executar essa função ao final da regra quando uma lista for criada dentro da mesma (por meio da função ListaRegraCriarLista). Isto fará que a aplicação consuma menos memória e evitará lentidão e estouro de memória.

##### ListaRegraSalvarLista

Salva a lista em arquivo. O arquivo pode ser salvo em dois formatos: ".txt" ou ".csv".

**Sintaxe:**

```lsp
ListaRegraSalvarLista(Numero aLista, Alfa aCaminho, Alfa aNomeArquivo, Alfa aFormato);
```

**Parâmetros:**

- `aLista`: Variável numérica que recebe o endereço da lista
- `aCaminho`: Variável alfa que recebe o caminho onde a lista será salva
- `aNomeArquivo`: Variável alfa que recebe o nome do arquivo
- `aFormato`: Variável alfa que recebe formato que o arquivo será salvo ("T" formato .txt ou "C" formato .csv)

**Exemplo:**

```lsp
ListaRegraSalvarLista(VenNLista, "C:\\ERP", "lista", "C");
ListaRegraSalvarLista(VenNLista, "C:\\ERP", "lista", "T");
```

**Observações:** Caso não seja possível salvar, será retornado um erro do tipo exceção.

**⚠️ Observações Importantes:**

- Sempre encapsule arrays JSON em objetos antes de usar `ListaRegraCarregarJson`
- Verifique sempre o retorno das funções de navegação (`vaAchou`)
- Use nomes de campos consistentes entre o JSON e a lista de campos
- A lista deve ser criada antes de tentar carregar dados
- Use `ListaRegraInicializarProcurar` antes de configurar critérios de pesquisa
- Sempre salve a linha após alterações com `ListaRegraSalvarLinha`
- Libere a lista da memória com `ListaRegraLiberarLista` quando não precisar mais dela
