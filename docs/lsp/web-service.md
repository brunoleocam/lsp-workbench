# Chamada de Web Service

O Editor de Regras dispõe de um conjunto de funções para que seja possível a atribuição e manipulação dos parâmetros de um web service, bem como a sua execução. Para isto é necessário declarar uma variável identificando o serviço que se deseja executar.

**Sintaxe:**

```lsp
@ Definir idProvedor.idServico.idPorta VarName; @

Definir interno.com.senior.g5.rh.fp.calculoFolha.Calcular vCalcula;
```

A variável informada é a que será utilizada para acessar os parâmetros, funções da porta, ler, fazer atribuições e comparações com os parâmetros.

**Importante:**

Para que não ocorra conflito nas chamadas de web service, caso existam regras que utilizem o mesmo web service, a variável declarada deve ser uma diferente das já existentes.

**Exemplo:**

```lsp
Definir interno.com.senior.g5.rh.fp.calculoFolha.Calcular vCalcula;
Definir interno.com.senior.g5.rh.fp.calculoFolha.Calcular vCalcula2;
Definir interno.com.senior.g5.rh.fp.calculoFolha.Calcular vCalcula3;
Definir interno.com.senior.g5.rh.fp.calculoFolha.Calcular vCalcula4;
```

### Modos de Execução

Os modos de execução de web service via regra LSP são tratados por numeração na regra, conforme abaixo:

1. Local
2. Síncrono
3. Assíncrono

**Importante:**

Não é possível utilizar o modo de execução Agendado em regras LSP, pois não é possível informar a periodicidade na regra.

O parâmetro `ModoExecucao = 1 (Local)` deve ser utilizado apenas em regras que serão executadas em instâncias de web services. Ou seja, esse parâmetro não deve ser usado nas seguintes formas de acesso: Cliente-Servidor, BrowserAccess, WindowsAccess, Web 5.0 e processos automáticos.

### WS-Security

Permite a integração de sistemas que utilizam web services terceiros com autenticação WS-Security. Com isto, as chamadas destes web services, do tipo SOAP, permitem a inclusão de informações de segurança no cabeçalho e assim, a sua integração.

A customização desta chamada é realizada a partir de um parâmetro na regra LSP: `WSSeguranca`, que receberá um XML e posteriormente será repassado para o cabeçalho do envelope SOAP:

```lsp
Webservice.WSSeguranca = "XML_Segurança";
```

### Autenticação

A autenticação de web services é feita, por padrão, através dos parâmetros `usuario`, ou `user`, e `senha`, ou `password`. Quando não informado, a autenticação é feita através dos valores do usuário do sistema.

Caso desejar ignorar os parâmetros, acesse a Central de Configurações Senior e insira a chave `com.senior.middleware.webservices.use_implicit_params_login` com o valor `false`.

### Funções Internas de Porta de Web Service

As portas de serviço via Regra LSP podem conter funções internas responsáveis por executar uma determinada operação na porta.

**Sintaxe:**

```lsp
<Nome_da_Porta>.<Nome_Funcao_Interna>
```

Para as Portas de Serviço em geral, temos algumas Funções Internas que podem ser executadas:

#### Executar()

Função que executa a requisição da porta, ou seja, realiza as operações para as quais a porta do serviço foi implementada.

**Sintaxe:**

```lsp
nomePorta.Executar();
```

#### AtivaLimpezaParamEnt()

Função que habilita a Limpeza Automática dos Parâmetros de Entrada após a Execução, ou seja, após qualquer execução da porta (função `Executar()`), todos os parâmetros de entrada serão limpos sendo necessário alimentá-los novamente para uma nova execução. Caso esta função não seja chamada dentro da Regra LSP, a porta vai assumir a Limpeza Automática como **habilitada por padrão**.

**Sintaxe:**

```lsp
nomePorta.AtivaLimpezaParamEnt();
```

#### DesatLimpezaParamEnt()

Função que desabilita a Limpeza Automática dos Parâmetros de Entrada após a Execução, ou seja, após qualquer execução da porta (função `Executar()`), todos os parâmetros de entrada serão mantidos não sendo necessário alimentá-los novamente para uma nova execução. Caso esta função não seja chamada dentro da Regra LSP, a porta vai assumir a Limpeza Automática como **habilitada por padrão**.

**Sintaxe:**

```lsp
nomePorta.DesatLimpezaParamEnt();
```

#### LimparParamsEntrada()

Função que realiza a Limpeza dos Parâmetros de Entrada no ato de sua chamada, ou seja, todos os parâmetros de entrada da porta serão limpos ao executar a função.

**Sintaxe:**

```lsp
nomePorta.LimparParamsEntrada();
```

### Exemplo Prático Completo

No exemplo fictício abaixo, será criada uma porta de serviço para inserção de duas pessoas com um contato no banco de dados:

```lsp
Definir Funcao exemploPortaWebService();

@ Variáveis globais @
Definir xServico.xPorta wsPorta;
Definir Numero vnCodPessoa1;
Definir Numero vnCodPessoa2;
Definir Alfa vaNomPessoa1;
Definir Alfa vaNomPessoa2;
Definir Alfa vaTelContato;
Definir Alfa vaNomContato;

exemploPortaWebService();

Funcao exemploPortaWebService(); {
  @ Definir dados das pessoas @
  vnCodPessoa1 = 1;
  vnCodPessoa2 = 2;
  vaNomPessoa1 = "Pessoa 1";
  vaNomPessoa2 = "Pessoa 2";
  vaTelContato = "99999999";
  vaNomContato = "Contato 1";
  
  @ Desativar limpeza automática para reutilizar parâmetros @
  wsPorta.DesatLimpezaParamEnt();
  
  @ === PRIMEIRA EXECUÇÃO === @
  @ Configurar parâmetros para primeira pessoa @
  wsPorta.codPessoa = vnCodPessoa1;
  wsPorta.nomPessoa = vaNomPessoa1;
  
  @ Configurar dados de contato (tipo tabela) @
  wsPorta.dadosContato.CriarLinha();
  wsPorta.dadosContato.telContato = vaTelContato;
  wsPorta.dadosContato.nomContato = vaNomContato;
  
  @ Executar primeira inserção @
  wsPorta.Executar(); @ Primeira Execução @
  
  @ === SEGUNDA EXECUÇÃO === @
  @ Alterar apenas dados da pessoa (contato será reutilizado) @
  wsPorta.codPessoa = vnCodPessoa2;
  wsPorta.nomPessoa = vaNomPessoa2;
  
  @ Executar segunda inserção @
  wsPorta.Executar(); @ Segunda Execução @
  
  @ === LIMPEZA E RECONFIGURAÇÃO === @
  @ Limpar parâmetros manualmente @
  wsPorta.LimparParamsEntrada();
  
  @ Reativar limpeza automática para próximas execuções @
  wsPorta.AtivaLimpezaParamEnt();
  
  Mensagem(Retorna, "Duas pessoas inseridas com sucesso!");
}
```

**Explicação do exemplo:**

1. **`DesatLimpezaParamEnt()`**: Ao desativar a limpeza automática, a primeira chamada da execução do serviço vai inserir a **Pessoa 1** com o **Contato 1** mantendo esses parâmetros alimentados para uma próxima execução.

2. **Reutilização de parâmetros**: Sobrescrevendo apenas os dados da pessoa (de "Pessoa 1" para "Pessoa 2"), a segunda execução do serviço resultará na inserção da **Pessoa 2** com o **Contato 1**, pois os parâmetros de entrada do tipo tabela "telContato" e "nomContato" ainda estarão alimentados.

3. **`LimparParamsEntrada()`**: Realizará a limpeza de todos os parâmetros de entrada ao final.

4. **`AtivaLimpezaParamEnt()`**: Indica o retorno da Limpeza Automática dos Parâmetros de Entrada após a Execução para quaisquer execuções posteriores da mesma porta na regra atual.

**⚠️ Observações importantes:**

- **Comportamento padrão**: Se nenhuma função de limpeza for chamada, a porta assume a **Limpeza Automática como habilitada por padrão**.
- **Reutilização estratégica**: Use `DesatLimpezaParamEnt()` quando quiser reutilizar parâmetros comuns entre múltiplas execuções.
- **Limpeza manual**: Use `LimparParamsEntrada()` para limpar parâmetros a qualquer momento, independente da configuração automática.
- **Reconfiguração**: Use `AtivaLimpezaParamEnt()` para voltar ao comportamento padrão após usar parâmetros reutilizados.

### Manipulação de Grids em Web Services

Os Web Services frequentemente utilizam grids (tabelas) para entrada e saída de dados. Esta seção aborda como manipular esses grids de forma eficiente.

#### Funções Básicas de Grid

##### CriarLinha()

Cria uma nova linha em um grid de entrada do Web Service.

**Sintaxe:**

```lsp
nomeWebService.NomeGrid.CriarLinha();
```

##### QtdLinhas

Propriedade que retorna a quantidade de linhas em um grid de saída.

**Sintaxe:**

```lsp
variavel = nomeWebService.NomeGrid.QtdLinhas;
```

##### LinhaAtual

Propriedade que define qual linha do grid está sendo manipulada.

**Sintaxe:**

```lsp
nomeWebService.NomeGrid.LinhaAtual = numeroLinha;
```

#### Padrão de Entrada - Populando Grids de Web Service

```lsp
Definir Funcao exemploGridEntrada();

@ Variáveis globais @
Definir interno.com.empresa.servico.ProcessarPedidos wsPedidos;
Definir Numero vnContador;
Definir Numero vnCodProduto;
Definir Numero vnQuantidade;
Definir Numero vnPreco;

exemploGridEntrada();

Funcao exemploGridEntrada(); {
  @ Configurar modo de execução @
  wsPedidos.ModoExecucao = 1;
  
  @ === POPLAR GRID DE ENTRADA === @
  @ Produto 1 @
  wsPedidos.ItensPedido.CriarLinha();
  wsPedidos.ItensPedido.CodProduto = 1001;
  wsPedidos.ItensPedido.Quantidade = 5;
  wsPedidos.ItensPedido.PrecoUnitario = 25.50;
  wsPedidos.ItensPedido.Observacao = "Produto especial";
  
  @ Produto 2 @
  wsPedidos.ItensPedido.CriarLinha();
  wsPedidos.ItensPedido.CodProduto = 1002;
  wsPedidos.ItensPedido.Quantidade = 3;
  wsPedidos.ItensPedido.PrecoUnitario = 45.00;
  wsPedidos.ItensPedido.Observacao = "Produto normal";
  
  @ Produto 3 @
  wsPedidos.ItensPedido.CriarLinha();
  wsPedidos.ItensPedido.CodProduto = 1003;
  wsPedidos.ItensPedido.Quantidade = 2;
  wsPedidos.ItensPedido.PrecoUnitario = 120.00;
  wsPedidos.ItensPedido.Observacao = "Produto premium";
  
  @ Executar Web Service @
  wsPedidos.Executar();
  
  @ Processar retorno @
  processarRetornoPedidos();
}
```

#### Padrão de Saída - Lendo Grids de Retorno

```lsp
Funcao processarRetornoPedidos(); {
  @ Variáveis para processar retorno @
  Definir Numero vnQtdLinhas;
  Definir Numero vnContador;
  Definir Numero vnCodProduto;
  Definir Numero vnStatus;
  Definir Alfa vaObservacao;
  Definir Alfa vaMensagem;
  
  @ Obter quantidade de linhas retornadas @
  vnQtdLinhas = wsPedidos.ResultadoProcessamento.QtdLinhas;
  
  @ Verificar se há dados @
  Se (vnQtdLinhas > 0) {
    vnContador = 0;
    
    @ === LOOP PADRÃO PARA PROCESSAR RETORNO === @
    Enquanto (vnContador < vnQtdLinhas) {
      @ Posicionar na linha atual @
      wsPedidos.ResultadoProcessamento.LinhaAtual = vnContador;
      
      @ Ler dados da linha atual @
      vnCodProduto = wsPedidos.ResultadoProcessamento.CodProduto;
      vnStatus = wsPedidos.ResultadoProcessamento.StatusProcessamento;
      vaObservacao = wsPedidos.ResultadoProcessamento.ObservacaoRetorno;
      
      @ Processar dados da linha @
      Se (vnStatus = 1) {
        Definir Alfa vaCodProdutoStr;
        IntParaAlfa(vnCodProduto, vaCodProdutoStr);
        vaMensagem = "Produto " + vaCodProdutoStr + " processado com sucesso: " + vaObservacao;
        Mensagem(Retorna, vaMensagem);
      } Senao {
        Definir Alfa vaCodProdutoStr;
        IntParaAlfa(vnCodProduto, vaCodProdutoStr);
        vaMensagem = "Erro no produto " + vaCodProdutoStr + ": " + vaObservacao;
        Mensagem(Erro, vaMensagem);
      }
      
      @ Próxima linha @
      vnContador++;
    }
  } Senao {
    Mensagem(Retorna, "Nenhum resultado retornado pelo Web Service");
  }
}
```

#### Otimização de Performance - Uso de Listas

**⚠️ IMPORTANTE:** Manipular grids de Web Service diretamente é **muito lento** quando há muitos dados. Para melhor performance, use listas dinâmicas para preparar os dados e depois popule o grid do Web Service.

**❌ Approach Lento:**

```lsp
@ NÃO FAÇA - Muito lento para grandes volumes @
Para (vnI = 1; vnI <= 1000; vnI++) {
  wsServico.Dados.CriarLinha();
  wsServico.Dados.Codigo = vnI;
  wsServico.Dados.Descricao = "Item " + vnI;
  @ ... outros campos @
}
```

**✅ Approach Eficiente:**

```lsp
@ FAÇA - Muito mais rápido @
@ 1. Preparar dados em lista dinâmica @
vlDados.DefinirCampos();
vlDados.AdicionarCampo("Codigo", numero);
vlDados.AdicionarCampo("Descricao", alfa, 100);
vlDados.EfetivarCampos();

@ 2. Popular lista rapidamente @
Para (vnI = 1; vnI <= 1000; vnI++) {
  vlDados.Adicionar();
  vlDados.Codigo = vnI;
  vlDados.Descricao = "Item " + vnI;
  vlDados.Gravar();
}

@ 3. Popular Web Service apenas uma vez por grupo @
popularWebServiceComLista();
```

#### Exemplo Prático Real - Sistema de Cotação de Frete

Este exemplo mostra um sistema completo de cotação de frete usando listas para eficiência:

```lsp
Definir Funcao exemploSistemaCotacaoFrete();

@ === ETAPA 1: PREPARAR DADOS EM LISTAS === @
@ Listas dinâmicas para dados organizados @
Definir Lista vlEncomendas;
Definir Lista vlDimensoes;
Definir Lista vlCotacoes;

@ Web Service de Cotação de Frete @
Definir interno.com.empresa.frete.CotacaoFrete wsCotacao;

exemploSistemaCotacaoFrete();

Funcao exemploSistemaCotacaoFrete(); {
  @ === ETAPA 1: INICIALIZAR LISTAS === @
  inicializarListasCotacao();
  
  @ === ETAPA 2: BUSCAR E PROCESSAR DADOS === @
  @ Buscar encomendas do banco de dados @
  buscarEncomendasElegiveis();
  
  @ === ETAPA 3: POPULAR WEB SERVICE EFICIENTEMENTE === @
  @ Só popula o Web Service quando os dados estão prontos @
  popularCotacaoComListas();
  
  @ === ETAPA 4: EXECUTAR E PROCESSAR RETORNO === @
  wsCotacao.ModoExecucao = 1;
  wsCotacao.Executar();
  
  processarRetornoCotacao();
}

Funcao inicializarListasCotacao(); {
  @ Configurar estrutura da lista de encomendas @
  vlEncomendas.DefinirCampos();
  vlEncomendas.AdicionarCampo("IdEncomenda", numero);
  vlEncomendas.AdicionarCampo("NumeroEnvio", numero);
  vlEncomendas.AdicionarCampo("CepDestino", alfa, 8);
  vlEncomendas.AdicionarCampo("PesoTotal", numero);
  vlEncomendas.AdicionarCampo("Altura", numero);
  vlEncomendas.AdicionarCampo("Largura", numero);
  vlEncomendas.AdicionarCampo("Comprimento", numero);
  vlEncomendas.AdicionarCampo("TipoServico", alfa, 20);
  vlEncomendas.AdicionarCampo("StatusCotacao", alfa, 1);
  vlEncomendas.EfetivarCampos();
  vlEncomendas.Chave("IdEncomenda");
}

Funcao buscarEncomendasElegiveis(); {
  @ Simulação de busca no banco - na prática seria um cursor SQL @
  Definir Numero vnContador;
  
  Para (vnContador = 1; vnContador <= 50; vnContador++) {
    @ Adicionar encomendas elegíveis para cotação na lista @
    vlEncomendas.Adicionar();
    vlEncomendas.IdEncomenda = vnContador;
    vlEncomendas.NumeroEnvio = vnContador + 5000;
    vlEncomendas.CepDestino = "01310100";
    vlEncomendas.PesoTotal = 1200; @ gramas @
    vlEncomendas.Altura = 15; @ cm @
    vlEncomendas.Largura = 12; @ cm @
    vlEncomendas.Comprimento = 20; @ cm @
    vlEncomendas.TipoServico = "EXPRESSO";
    vlEncomendas.StatusCotacao = "S";
    vlEncomendas.Gravar();
  }
}

Funcao popularCotacaoComListas(); {
  @ === PERFORMANCE: Popular Web Service a partir da lista === @
  Definir Numero vnTem;
  Definir Numero vnContadorEnvios; vnContadorEnvios = 0;
  
  @ Navegar pela lista e popular Web Service @
  vnTem = vlEncomendas.Primeiro();
  Enquanto (vnTem = 1) {
    Se (vlEncomendas.StatusCotacao = "S") {
      @ Criar linha no Web Service de Cotação @
      wsCotacao.Encomendas.CriarLinha();
      
      @ Popular dados validados da lista @
      Definir Alfa vaIdEncomenda;
      IntParaAlfa(vlEncomendas.IdEncomenda, vaIdEncomenda);
      wsCotacao.Encomendas.Identificador = vaIdEncomenda;
      wsCotacao.Encomendas.CepDestino = vlEncomendas.CepDestino;
      wsCotacao.Encomendas.Peso = vlEncomendas.PesoTotal;
      wsCotacao.Encomendas.Altura = vlEncomendas.Altura;
      wsCotacao.Encomendas.Largura = vlEncomendas.Largura;
      wsCotacao.Encomendas.Comprimento = vlEncomendas.Comprimento;
      wsCotacao.Encomendas.Servico = vlEncomendas.TipoServico;
      
      vnContadorEnvios++;
    }
    
    vnTem = vlEncomendas.Proximo();
  }
  
  @ Debug @
  Definir Alfa vaContadorStr;
  Definir Alfa vaMensagem;
  IntParaAlfa(vnContadorEnvios, vaContadorStr);
  vaMensagem = "Enviadas " + vaContadorStr + " encomendas para cotação de frete";
  Mensagem(Retorna, vaMensagem);
}

Funcao processarRetornoCotacao(); {
  @ === PADRÃO DE LEITURA DE RETORNO === @
  Definir Numero vnQtdRetorno;
  Definir Numero vnContador;
  Definir Alfa vaIdEncomendaRetorno;
  Definir Numero vnValorFrete;
  Definir Numero vnPrazoEntrega;
  
  @ Obter quantidade de cotações retornadas @
  vnQtdRetorno = wsCotacao.Encomendas.QtdLinhas;
  
  Se (vnQtdRetorno > 0) {
    vnContador = 0;
    
    @ Loop padrão para processar retorno @
    Enquanto (vnContador < vnQtdRetorno) {
      @ Posicionar na linha atual @
      wsCotacao.Encomendas.LinhaAtual = vnContador;
      
      @ Ler dados do retorno @
      vaIdEncomendaRetorno = wsCotacao.Encomendas.Identificador;
      vnValorFrete = wsCotacao.Encomendas.ValorCotado;
      vnPrazoEntrega = wsCotacao.Encomendas.PrazoEntrega;
      
      @ === PERFORMANCE: Buscar encomenda correspondente na lista === @
      @ Em vez de consultar banco novamente @
      Definir Numero vnIdEncomendaBusca;
      AlfaParaInt(vaIdEncomendaRetorno, vnIdEncomendaBusca);
      
      vlEncomendas.SetarChave();
      vlEncomendas.IdEncomenda = vnIdEncomendaBusca;
      
      Se (vlEncomendas.VaiParaChave() = 1) {
        @ Processar cotação encontrada @
        Definir Alfa vaMensagem;
        Definir Alfa vaNumEnvioStr;
        Definir Alfa vaValorStr;
        Definir Alfa vaPrazoStr;
        IntParaAlfa(vlEncomendas.NumeroEnvio, vaNumEnvioStr);
        DecimalParaAlfa(vnValorFrete, vaValorStr);
        IntParaAlfa(vnPrazoEntrega, vaPrazoStr);
        vaMensagem = "Envio " + vaNumEnvioStr + " - Frete: R$ " + vaValorStr + " - Prazo: " + vaPrazoStr + " dias";
        Mensagem(Retorna, vaMensagem);
        
        @ Salvar cotação na lista de cotações @
        vlCotacoes.Adicionar();
        vlCotacoes.IdEncomenda = vnIdEncomendaBusca;
        vlCotacoes.ValorFrete = vnValorFrete;
        vlCotacoes.PrazoEntrega = vnPrazoEntrega;
        vlCotacoes.Gravar();
      }
      
      vnContador++;
    }
  }
}
```

#### Vantagens da Abordagem com Listas

1. **Performance**: Listas dinâmicas são **10x a 100x mais rápidas** que manipulação direta de grids de Web Service
2. **Organização**: Dados ficam organizados em memória antes da transmissão
3. **Validação**: Permite validar e corrigir dados antes de enviar
4. **Reutilização**: Dados podem ser reutilizados para múltiplos Web Services
5. **Debugging**: Mais fácil debugar dados em listas que em grids de WS

#### Resumo das Melhores Práticas

| **Cenário** | **Recomendação** | **Motivo** |
|-------------|------------------|------------|
| **Poucos dados (< 10 linhas)** | Manipulação direta do grid | Simplicidade |
| **Muitos dados (> 10 linhas)** | Usar listas + popular grid | Performance |
| **Dados complexos** | Usar listas + validação | Organização |
| **Múltiplos Web Services** | Usar listas + reutilizar | Eficiência |
| **Dados do banco** | Cursor → Lista → Grid | Padrão recomendado |

**🎯 Regra de Ouro:** Para qualquer operação com mais de 10 linhas de dados, **sempre use listas dinâmicas** para preparar os dados antes de popular grids de Web Service!
