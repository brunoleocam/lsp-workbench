# Definição de Listas

Sempre que é necessária a customização do sistema (mesmo que seja complexa), as regras podem ser usadas com a vantagem de não precisar recompilar o sistema. Ferramentas como Gerador de Relatórios, Importador e Exportador de Arquivos Texto, por exemplo, também permitem a customização através da regra.

O constante aumento de complexidade dos sistemas gerou a necessidade de mais recursos nas regras. Uma destas necessidades era uma lista dinamicamente alocada, flexível para programador/usuário e que fosse de fácil uso e entendimento.

Tendo conhecimento desta necessidade, foi implementado dentro das regras o recurso conhecido daqui por diante como Lista.

O funcionamento consiste em determinar os campos que a lista usará, preencher a lista com valores e usar estes valores de maneira que atenda às necessidades da lógica implementada pelo programador/usuário.

### Comandos para Definição de Listas

São comandos que determinam o formato da lista. Este formato hoje somente é determinado pelos campos que compõem a lista.

| Comando         | Função                                                                                       |
|-----------------|----------------------------------------------------------------------------------------------|
| tipo Lista      | Serve para determinar o tipo de uma variável que será lista. Nenhum parâmetro adicional será necessário para esta definição. |
| DefinirCampos   | Inicia a fase de adição de campos na lista. Somente podem ser adicionados campos durante este período, ou seja, após a chamada deste comando. |
| EfetivarCampos  | Determinará o fim da adição de campos e informará ao compilador/interpretador que a partir deste ponto a lista será usada efetivamente (receberá valores). Também permitirá ao interpretador criar estruturas internas de controle e manipulação desta lista. |
| AdicionarCampo  | Adiciona os campos. Nesta adição também deve ser informado o tipo e o tamanho se necessário. |

Sintaxe:

```lsp
funcao <lista>.AdicionarCampo(alfa NomeCampo, <tipo> TipoInterno, numero Tamanho);
```

Parâmetros:

- **NomeCampo**: Este parâmetro deve ser uma literal alfanumérica (constante). O nome do campo não deve conter espaços, acentos e nem número como primeiro caractere.
- **TipoInterno**: Deve ser um tipo primitivo interno da regra, ou seja, numero, alfa ou data.
- **Tamanho**: Parâmetro opcional que determina o tamanho do campo. Se informado, somente será aceito para campos alfanuméricos. Neste caso, o campo terá um tamanho limitado. Se não for informado, campos do tipo alfa não terão limite (podem ter valores até o limite de memória). Os outros tipos de campos não são afetados.

### Acesso aos Campos

O acesso aos campos que foram definidos dentro da lista deve ser feito digitando-se o nome da lista, seguido do ponto (.) e o nome do campo. Este nome deverá ser definido previamente através do comando AdicionarCampo.

Caso o nome digitado após o ponto não for um nome de procedimento, função, propriedade ou campo definido na lista, um erro de compilação será gerado.

### Comandos para Manipulação de Registros

Estes comandos permitem adicionar, inserir, gravar, excluir, etc. registros das listas para usar todo o potencial dinâmico do recurso.

| Comando  | Função                                                                                       |
|----------|----------------------------------------------------------------------------------------------|
| Adicionar| É o primeiro comando de manipulação de dados do recurso lista. Ele serve para adicionar valores (agrupados em registros) dentro da lista. Ele cria um registro no final dos registros existentes. Este somente respeitará a ordem de adição se não existirem chaves definidas (será visto mais tarde). |
| Inserir  | Tem a mesma função do comando Adicionar, mas ao invés de adicionar um registro no final dos registros existentes, insere-o na posição atual da lista (apontado internamente e acessível pela propriedade NumReg). |
| Editar   | Visa a atualização de registros. Para tal é necessário posicionar a lista no registro que se deseja alterar. Após isto chama-se o comando Editar e então muda-se os valores desejados. |
| Gravar   | Quando se altera os valores dos campos (após a chamada do comando Adicionar, Inserir ou Editar), pode-se efetivar os dados através do comando Gravar. Grava as informações dentro da lista para posterior recuperação. |
| Cancelar | Ao alterar os valores dos campos, mas por algum motivo os mesmos não devem ser efetivados, utilize o comando Cancelar. Os dados que estão sendo alterados ficam em um registro virtual que não é trabalhado até que seja chamado o comando Gravar ou Cancelar. No caso do comando Cancelar este registro virtual é descartado não alterando o conteúdo da lista. |
| Excluir  | Exclui um registro. Para tal é necessário posicionar a lista no registro que deverá ser excluído e então chamar o comando Excluir. Somente o registro atualmente posicionado será excluído. Para excluir mais registros é necessário chamar o comando mais vezes. |

### Comandos para Posicionamento de Listas

Estes comandos existem para que o programador/usuário possa posicionar o registro da lista e permitir uma maior agilidade no uso do recurso.

| Comando  | Função                                                                                       |
|----------|----------------------------------------------------------------------------------------------|
| Primeiro | Posiciona no primeiro registro que estiver na lista. Note que o primeiro registro pode ser o primeiro adicionado ou o primeiro que respeitar a chave que estiver atualmente selecionada. Exemplo: se existir um campo que for o nome do funcionário e a chave estiver configurada para este campo, o primeiro registro provavelmente será um nome que comece por A. O comando retorna 1 se a lista pôde ser posicionada no primeiro registro e 0 (zero) caso contrário. |
| Ultimo   | Posiciona a lista no último registro. Da mesma forma como o comando Primeiro, o último registro pode ser o último registro adicionado ou o registro que estiver obedecendo a chave. No exemplo anterior (nome do funcionário) o último registro poderia ser um nome que começasse com Z. O comando retorna 1 se a lista pôde ser posicionada no final e 0 (zero) caso contrário. |
| Anterior | O comando Anterior posiciona a lista no registro imediatamente anterior ao registro atual. Se não existir registro anterior, será posicionada em IDA. Segue a mesma lógica de chave do comando Primeiro e Ultimo. Se a lista pôde ser posicionada no registro anterior (que não é o IDA), o comando retorna 1, caso contrário retorna 0 (zero). |
| Próximo  | Posiciona a lista no registro imediatamente posterior ao registro atual. Se não existir registro posterior, será posicionada em FDA. A lógica de chave segue o padrão dos comandos de posicionamento anteriores. Retorna 1 se foi possível posicionar no próximo registro e 0 (zero) caso não tenha conseguido. |

### Comandos para Procura de Registros

Estes comandos auxiliam o programador/usuário na procura de registros dentro da lista através de valores previamente conhecidos.

| Comando    | Função                                                                                       |
|------------|----------------------------------------------------------------------------------------------|
| SetarChave | Coloca a lista em estado de edição de chave para que seja possível a manipulação dos valores da chave. Quando configurados estes valores será possível procurar os registros que possuem a chave informada. Isto será feito através do comando VaiParaChave que será visto a seguir. Apaga os valores que estiverem na chave no momento da chamada. Para manter os valores da chave use o comando EditarChave. |
| EditarChave| Tem o mesmo objetivo do comando SetarChave mas sem apagar os valores de chave. Quando este comando for chamado os valores que estiverem contidos na chave neste momento serão mantidos e ainda assim a lista entrará em modo de edição de chave. Serve para procurar por chaves muito parecidas sem que seja necessário informar todos os valores novamente. |
| VaiParaChave | Procura pelo registro que tiver a chave configurada naquele momento. Exemplo: Consideremos que a chave da lista seja o código de cadastro do funcionário e que o mesmo tenha o valor 10 após a chamada do comando SetarChave. Quando o comando VaiParaChave for chamado a lista será posicionada no primeiro registro onde o número do cadastro do funcionário for 10. Se o registro com esta característica não for encontrado, a lista não será reposicionada. Caso o comando encontre o registro procurado, será retornado 1. Caso contrário será retornado 0 (zero). |

### Comandos para Posicionamento Absoluto

Os comandos a seguir informam e configuram a posição absoluta da lista conforme o número do registro.

| Comando    | Função                                                                                       |
|------------|----------------------------------------------------------------------------------------------|
| NumReg     | Esta propriedade retorna o número do registro (baseado em zero) da posição atual da lista. Se a lista estiver posicionada no quarto registro, o valor retornado será 3. Este número de registro é influenciado pela chave que estiver ativa no momento da obtenção deste valor. Exemplo: Existe um registro na lista que não possui chave definida. O número deste registro é 2. Quando atribuímos uma chave para a lista, outro registro pode ter o número 2 e o registro que antes possuía o número 2 pode ter qualquer outro número, dependendo da chave aplicada. |
| SetaNumReg | Este procedimento tem como objetivo posicionar a lista de maneira absoluta. A posição da lista é a ordem do registro menos 1. A ordem do registro é influenciada pela chave que estiver ativa no momento da chamada. |

### Comandos Diversos de Listas

Os comandos a seguir são de categoria geral, mas são utilizados normalmente com os outros comandos aqui apresentados.

| Comando            | Função                                                                                       |
|--------------------|----------------------------------------------------------------------------------------------|
| Propriedade IDA    | Retorna 1 se a lista estiver em IDA (Início De Arquivo) e 0 (zero) caso contrário. |
| Propriedade FDA    | Retorna 1 se a lista estiver em FDA (Fim De Arquivo) e 0 (zero) caso contrário. |
| Propriedade QtdRegistros | Retorna o número de registros que estão retidos na lista naquele momento. |
| Limpar             | Apaga todos os registros da lista. |
| Procedimento Chave | Este procedimento configura a chave que a lista deverá usar do momento da chamada em diante. Esta chave deve conter os nomes dos campos que estiverem configurados na lista separados por ponto-e-vírgula (;). Caso não se queira chave nenhuma, deve-se configurar este valor com vazio (""). |

### Exemplo

Definição de uma lista:

```lsp
/* Definição das variáveis necessárias para a operação. */
definir lista Lst;

/* Definição de campos dentro da lista declarada acima. */
Lst.DefinirCampos();
Lst.AdicionarCampo("Empresa", numero);
Lst.AdicionarCampo("Tipo", alfa);
Lst.AdicionarCampo("Cadastro", numero);
Lst.AdicionarCampo("Nome", alfa, 100);
Lst.AdicionarCampo("Salario", numero);
Lst.AdicionarCampo("Afastamento", data);
Lst.EfetivarCampos();
```

O campo Nome será do tipo alfanumérico mas tem o seu tamanho limitado. Caso seja atribuído um valor cujo tamanho seja maior que 100, um erro em tempo de execução será mostrado ao usuário.

Neste exemplo são usados os comandos DefinirCampos, AdicionarCampo, EfetivarCampos, além da definição de uma variável do tipo Lista.

### Atribuição de Valores para a Lista

Neste exemplo a lista é preenchida com valores trazidos por um cursor.

```lsp
/* Definição de variáveis utilizadas na regra. */
definir cursor Cur;

/* Determinação da chave. Não influi na inserção de registros. */
Lst.Chave("Nome");

/* Preenchimento da lista com os valores do cursor. */
Cur.SQL "select NumEmp, TipCol, NumCad, NomFun, ValSal, DatAfa from R034FUN";
Cur.AbrirCursor();

enquanto (Cur.Achou) {
  Lst.Adicionar();
  Lst.Empresa = Cur.NumEmp;
  se (Cur.TipCol = 1)
    Lst.Tipo = "Colaborador";
  senao se (Cur.TipCol = 2)
    Lst.Tipo = "Parceiro";
  senao se (Cur.TipCol = 3)
    Lst.Tipo = "Terceiro";
  senao
    Lst.Tipo = "<desconhecido>";
  Lst.Cadastro = Cur.NumCad;
  Lst.Nome = Cur.NomFun;
  Lst.Salario = Cur.ValSal;
  Lst.Afastamento = Cur.DatAfa;
  Lst.Gravar();
  Cur.Proximo();
}
```

Neste exemplo são utilizados os comandos Adicionar, Gravar e Chave. Também são acessados os campos através do nome do mesmo.

### Utilização de Dados de uma Lista

Neste exemplo os dados previamente armazenados na lista estão sendo utilizados para a impressão de seções dentro do gerador de relatórios.

```lsp
definir alfa dsValorTipo;
definir alfa dsValorNome;
definir alfa dsValorEspecial2;
definir alfa dsValorEspecial4;

/* Retirar a chave para imprimir os registros na ordem de inserção. */
Lst.Chave("");
/* Obtém a quantidade de registros atualmente retidos na lista. */
frValorTotalReg = Lst.QtdRegistros;

/* Lista a seção dos dados */
ListaSecao("adCabecalho");

/* Navega por todos os registros da lista obtendo os valores dos campos. */
Tem = Lst.Primeiro();
enquanto (Tem = 1) {
  frValorNumReg = Lst.NumReg;
  frValorEmpresa = Lst.Empresa;
  dsValorTipo = Lst.Tipo;
  frValorCadastro = Lst.Cadastro;
  dsValorNome = Lst.Nome;
  frValorSalario = Lst.Salario;
  frValorAfastamento = Lst.Afastamento;
  ListaSecao("adDetalhe");
  Tem = Lst.Proximo();
}

/* Configura a chave do registro para poder proceder com uma procura. */
Lst.Chave("Cadastro;Nome");

/* Configura a chave para a procura do registro com Cadastro 10. */
Lst.SetarChave();
Lst.Cadastro = 10;
se (Lst.VaiParaChave()) {
  frValorEspecial6 = Lst.NumReg;
  frValorEspecial1 = Lst.Empresa;
  dsValorEspecial2 = Lst.Tipo;
  frValorEspecial3 = Lst.Cadastro;
  dsValorEspecial4 = Lst.Nome;
  frValorEspecial5 = Lst.Salario;
  frValorEspecial7 = Lst.Afastamento;
  ListaSecao("adValoresEspeciais");
}

/* Posiciona a lista absolutamente e imprime os dados do registro atual. */
Lst.SetaNumReg(5);
frValorEspecial6 = Lst.NumReg;
frValorEspecial1 = Lst.Empresa;
dsValorEspecial2 = Lst.Tipo;
frValorEspecial3 = Lst.Cadastro;
dsValorEspecial4 = Lst.Nome;
frValorEspecial5 = Lst.Salario;
frValorEspecial7 = Lst.Afastamento;
ListaSecao("adValoresEspeciais");
```

### Exclusão de Dados da Lista

Neste exemplo é mostrado como excluir dados da lista. Neste caso somente serão excluídos os registros cujo campo Salario estiver com um valor menor que 1000.

```lsp
Tem = Lst.Primeiro();
enquanto (Tem = 1) {
  se (Lst.Salario < 1000) {
    Lst.Excluir();
    se (Lst.FDA = 1)
      Tem = 0;
    senao
      Tem = 1;
  } senao
    Tem = Lst.Proximo();
}
```

### Algoritmos de Leitura de Dados da Lista

Para a leitura de dados é possível utilizar algumas lógicas. Basta o programador decidir qual a melhor para ele.

#### Utilizando o Retorno das Funções

Este algoritmo utiliza o retorno provido pelas funções de movimentação para identificar o estado da lista. É o mesmo algoritmo apresentado em exemplos anteriores.

```lsp
Tem = Lst.Primeiro();
enquanto (Tem = 1) {
  frValorNumReg = Lst.NumReg;
  frValorEmpresa = Lst.Empresa;
  dsValorTipo = Lst.Tipo;
  frValorCadastro = Lst.Cadastro;
  dsValorNome = Lst.Nome;
  frValorSalario = Lst.Salario;
  frValorAfastamento = Lst.Afastamento;
  ListaSecao("adDetalhe");
  Tem = Lst.Proximo();
}
```

#### Utilizando Propriedade Indicadora de Fim de Arquivo (FDA)

Este algoritmo utiliza-se da propriedade FDA para identificar o fim dos registros.

```lsp
Lst.Primeiro();
enquanto (Lst.FDA = 0) {
  frValorNumReg = Lst.NumReg;
  frValorEmpresa = Lst.Empresa;
  dsValorTipo = Lst.Tipo;
  frValorCadastro = Lst.Cadastro;
  dsValorNome = Lst.Nome;
  frValorSalario = Lst.Salario;
  frValorAfastamento = Lst.Afastamento;
  ListaSecao("adDetalhe");
  Lst.Proximo();
}
```

#### Utilizando Diretamente o Retorno das Funções de Movimentação

Este algoritmo não é usual mas pode ser utilizado. Consiste em colocar a lista no registro virtual IDA e identificar o fim de arquivo através do retorno da função Proximo diretamente. Neste caso o estado de fim de arquivo é obtido apenas uma vez quando da chamada da função Proximo.

```lsp
Lst.Primeiro();
Lst.Anterior();
enquanto (Lst.Proximo() = 1) {
  frValorNumReg = Lst.NumReg;
  frValorEmpresa = Lst.Empresa;
  dsValorTipo = Lst.Tipo;
  frValorCadastro = Lst.Cadastro;
  dsValorNome = Lst.Nome;
  frValorSalario = Lst.Salario;
  frValorAfastamento = Lst.Afastamento;
  ListaSecao("adDetalhe");
}
```

Da mesma forma, estes algoritmos podem ser utilizados começando pelo último registro e subindo até o primeiro. Para isto basta utilizar as funções Ultimo e Anterior.

### Disponibilização do Recurso

Recurso disponível para SVCL em todas as ferramentas e telas que utilizem regras.

### Cursores vs Listas em Memória

#### Cursores

Os cursores são melhores utilizados quando precisa-se de dados atualizados ou que serão lidos apenas uma vez.

**Vantagens:**
✅ **Permite acesso a dados atualizados**
✅ **Permite filtragem dos dados diretamente no banco de dados**
✅ **Filtros elaborados através de expressões (cláusula where)**

**Desvantagens:**
❌ **A performance de resposta depende da rede e do banco de dados**
❌ **Não suporta o comando Anterior, permitindo que os registros sejam lidos de trás para a frente**
❌ **Para se alterar a ordenação, precisa-se executar outro comando SQL**

#### Listas em Memória

As listas em memória podem ser usadas quando precisa-se navegar muitas vezes nos dados ou quando é necessário armazenar dados calculados. Também pode ser usada quando é necessário armazenar valores durante um processamento (onde não se sabe o número total de registros) e que, posteriormente, precisam ser recuperados para uma impressão ou algum outro processamento.

**Vantagens:**
✅ **Acesso rápido aos dados**
✅ **A liberação da memória é de responsabilidade da lista, não cabendo ao usuário a chamada de um comando para isto. Pode-se apenas excluir os registros. Isto pode ser feito individualmente, ou através do comando Limpar (que remove todos os registros da lista)**
✅ **A ordenação pode ser realizada em qualquer momento, apenas configurando a chave da lista**
✅ **Ordenação facilitada através da definição de uma chave, sem a necessidade de ler novamente os dados**

### **Como Ordenar uma Lista Dinâmica Quando Já Preenchida** 🔄

A ordenação de uma lista dinâmica já preenchida depende da **chave que você definiu** no momento da criação da lista. Para ordenar a lista em uma sequência diferente, você precisa redefinir a chave:

**Sintaxe:**

```lsp
nomeLista.Chave("campo1;campo2;campo3");
```

**Exemplo Prático:**

```lsp
@ Lista já preenchida com dados @
vlClientes.DefinirCampos();
vlClientes.AdicionarCampo("Codigo", numero);
vlClientes.AdicionarCampo("Nome", alfa, 50);
vlClientes.AdicionarCampo("Cidade", alfa, 30);
vlClientes.EfetivarCampos();

@ Popular dados... @
@ (dados já inseridos na lista) @

@ === DIFERENTES FORMAS DE ORDENAÇÃO === @

@ 1. Ordenar por código (crescente) @
vlClientes.Chave("Codigo");

@ 2. Ordenar por nome (alfabética) @
vlClientes.Chave("Nome");

@ 3. Ordenar por cidade e depois por nome @
vlClientes.Chave("Cidade;Nome");

@ 4. Ordenar decrescente (usar campo auxiliar ou lógica específica) @
@ Para ordem decrescente, criar campo auxiliar ou reorganizar dados @
```

**⚠️ Observações Importantes:**

- A lista **reorganiza automaticamente** os dados quando você redefine a chave
- **Não é necessário recarregar** os dados após alterar a chave
- A ordenação é **sempre crescente** - para decrescente, use campos auxiliares
- **Performance**: A reordenação é rápida, pois os dados já estão em memória
✅ **Permite a inserção, atualização e exclusão de registros durante o uso**
✅ **Permite a definição de campos customizados. Os campos não precisam seguir um padrão estipulado em alguma tabela**
✅ **Pode-se navegar pela lista tanto para frente quanto para trás quantas vezes forem necessárias**
✅ **Permite a procura de registros através de uma chave**
✅ **Acesso aos campos tem a mesma sintaxe do acesso aos campos do cursor**

**Desvantagens:**
❌ **A lista não pode ser preenchida automaticamente por um cursor**
❌ **Não é possível filtrar os dados depois de inseridos na lista**
❌ **Não permitem interação direta com o sistema, ou seja, os valores da lista não podem ser preenchidos através de rotinas desenvolvidas do sistema**

### IMPORTANTE - Observações Críticas de Uso

#### No Gerador de Relatórios

**🚨 OBRIGATÓRIO:**

- Coloque a **definição, adição e efetivação dos campos** no evento **"Funções Globais do Modelo Gerador"**, pois esta é a primeira regra a ser compilada para os modelos
- Se os campos das listas forem utilizados em uma regra que é compilada antes da adição dos campos da lista, o compilador não reconhece os mesmos dando **erro de compilação**
- **Sempre redeclare** a definição das listas nas regras em que elas forem utilizadas

#### Em Web Services de Geração de Relatórios

**🚨 CRÍTICO - Access Violation:**

- Na execução através de web service (exemplo: `com.senior.g5.co.ger.relatorio` do Gestão Empresarial | ERP)
- Se não houver a **redeclaração da lista** em todas as regras onde são utilizadas, pode ocorrer **erro de Access Violation**
- O Access Violation pode não ocorrer em modo "2 - Sincrono", mas **sempre ocorre** em modo "1 - Local"
- **Solução:** Sempre redeclare as variáveis independentemente do modo de execução

#### No Gerador de Importação e Exportação

**📋 Regra Obrigatória:**

- Coloque a **definição, adição e efetivação dos campos** no evento **"Início da Execução"**
- **Redeclare** a definição da lista nas demais regras onde ela for utilizada

**Exemplo de Declaração Correta:**

```lsp
@ ==> NO EVENTO "Funções Globais" (Gerador) ou "Início da Execução" (Import/Export) @
Definir Lista LstDados;
LstDados.DefinirCampos();
LstDados.AdicionarCampo("Codigo", numero);
LstDados.AdicionarCampo("Nome", alfa, 50);
LstDados.EfetivarCampos();

@ ==> EM CADA REGRA QUE USA A LISTA @
Definir Lista LstDados;  @ OBRIGATÓRIO: Redeclarar @

@ Agora pode usar a lista normalmente @
LstDados.Adicionar();
LstDados.Codigo = 123;
LstDados.Nome = "Exemplo";
LstDados.Gravar();
```
