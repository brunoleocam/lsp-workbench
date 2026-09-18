@ ========================================================================= @
@ TITULO: EXEMPLO DE LISTA DINAMICA EM LSP                                  @
@ DESCRICAO: Demonstra como criar, configurar, popular e navegar em uma     @
@            lista dinamica, incluindo definicao de campos, chaves e        @
@            operacoes basicas de manipulacao de dados                      @
@                                                                           @
@ ========================================================================= @

@ === DECLARACAO DE VARIAVEIS === @
Definir Lista vlClientes;        @ Lista dinamica de clientes @
Definir Numero vnContador;       @ Contador para loops @
Definir Numero vnTem;            @ Variavel de controle de navegacao @
Definir Alfa vaMensagem;         @ Variavel para mensagens @

@ === DECLARACAO DE FUNCOES === @
Definir Funcao criarEstruturaDaLista();
Definir Funcao popularListaComDados();
Definir Funcao navegarPelaLista();
Definir Funcao buscarClientePorCodigo(Numero pCodigo);
Definir Funcao exibirEstatisticasDaLista();

@ === PROGRAMA PRINCIPAL === @
vaMensagem = "EXEMPLO: Iniciando demonstracao de Lista Dinamica";
Mensagem(Retorna, vaMensagem);

@ Passo 1: Criar estrutura da lista @
criarEstruturaDaLista();

@ Passo 2: Popular lista com dados de exemplo @
popularListaComDados();

@ Passo 3: Navegar pela lista e exibir dados @
navegarPelaLista();

@ Passo 4: Buscar cliente especifico @
buscarClientePorCodigo(102);

@ Passo 5: Exibir estatisticas da lista @
exibirEstatisticasDaLista();

vaMensagem = "EXEMPLO: Demonstracao de Lista Dinamica concluida";
Mensagem(Retorna, vaMensagem);

@ === IMPLEMENTACAO DAS FUNCOES === @

/* ========================================================================
   FUNCAO: criarEstruturaDaLista
   DESCRICAO: Cria e configura a estrutura da lista dinamica de clientes
   PARAMETROS: Nenhum
   RETORNO: Void
   OBSERVACOES: Define campos, tipos, tamanhos e chave primaria da lista
   ======================================================================== */
Funcao criarEstruturaDaLista(); {
  vaMensagem = "LISTA: Criando estrutura da lista de clientes";
  Mensagem(Retorna, vaMensagem);
  
  @ Inicializar estrutura da lista @
  vlClientes.DefinirCampos();
  
  @ Definir campos da lista com tipos e tamanhos @
  vlClientes.AdicionarCampo("Codigo", numero);           @ Codigo do cliente @
  vlClientes.AdicionarCampo("Nome", alfa, 100);          @ Nome completo @
  vlClientes.AdicionarCampo("Cidade", alfa, 50);         @ Cidade @
  vlClientes.AdicionarCampo("UF", alfa, 2);              @ Estado (UF) @
  vlClientes.AdicionarCampo("CEP", alfa, 8);             @ CEP formatado @
  vlClientes.AdicionarCampo("Ativo", alfa, 1);           @ S=Ativo, N=Inativo @
  vlClientes.AdicionarCampo("LimiteCredito", numero);    @ Limite de credito @
  
  @ Efetivar a estrutura de campos @
  vlClientes.EfetivarCampos();
  
  @ Definir chave primaria para busca rapida @
  vlClientes.Chave("Codigo");
  
  vaMensagem = "LISTA: Estrutura criada com 7 campos e chave primaria em Codigo";
  Mensagem(Retorna, vaMensagem);
}

/* ========================================================================
   FUNCAO: popularListaComDados
   DESCRICAO: Adiciona registros de exemplo na lista de clientes
   PARAMETROS: Nenhum
   RETORNO: Void
   OBSERVACOES: Cria dados ficticios para demonstrar uso da lista
   ======================================================================== */
Funcao popularListaComDados(); {
  vaMensagem = "LISTA: Populando lista com dados de exemplo";
  Mensagem(Retorna, vaMensagem);
  
  @ === CLIENTE 1 === @
  vlClientes.Adicionar();
  vlClientes.Codigo = 101;
  vlClientes.Nome = "EMPRESA ABC LTDA";
  vlClientes.Cidade = "SAO PAULO";
  vlClientes.UF = "SP";
  vlClientes.CEP = "01310100";
  vlClientes.Ativo = "S";
  vlClientes.LimiteCredito = 50000;
  vlClientes.Gravar();
  
  @ === CLIENTE 2 === @
  vlClientes.Adicionar();
  vlClientes.Codigo = 102;
  vlClientes.Nome = "COMERCIAL XYZ EIRELI";
  vlClientes.Cidade = "RIO DE JANEIRO";
  vlClientes.UF = "RJ";
  vlClientes.CEP = "20040020";
  vlClientes.Ativo = "S";
  vlClientes.LimiteCredito = 25000;
  vlClientes.Gravar();
  
  @ === CLIENTE 3 === @
  vlClientes.Adicionar();
  vlClientes.Codigo = 103;
  vlClientes.Nome = "INDUSTRIA 123 SA";
  vlClientes.Cidade = "BELO HORIZONTE";
  vlClientes.UF = "MG";
  vlClientes.CEP = "30130000";
  vlClientes.Ativo = "N";
  vlClientes.LimiteCredito = 75000;
  vlClientes.Gravar();
  
  @ === CLIENTE 4 === @
  vlClientes.Adicionar();
  vlClientes.Codigo = 104;
  vlClientes.Nome = "SERVICOS DEF LTDA";
  vlClientes.Cidade = "CURITIBA";
  vlClientes.UF = "PR";
  vlClientes.CEP = "80010000";
  vlClientes.Ativo = "S";
  vlClientes.LimiteCredito = 30000;
  vlClientes.Gravar();
  
  vaMensagem = "LISTA: 4 clientes adicionados com sucesso";
  Mensagem(Retorna, vaMensagem);
}

/* ========================================================================
   FUNCAO: navegarPelaLista
   DESCRICAO: Demonstra navegacao completa pela lista usando metodos padrao
   PARAMETROS: Nenhum
   RETORNO: Void
   OBSERVACOES: Usa Primeiro(), Proximo() e campos da lista atual
   ======================================================================== */
Funcao navegarPelaLista(); {
  Definir Alfa vaCodigo;
  Definir Alfa vaLimite;
  Definir Alfa vaDetalhes;
  
  vaMensagem = "LISTA: Iniciando navegacao pela lista de clientes";
  Mensagem(Retorna, vaMensagem);
  
  @ Posicionar no primeiro registro @
  vnTem = vlClientes.Primeiro();
  vnContador = 0;
  
  @ Navegar por todos os registros @
  Enquanto (vnTem = 1) {
    vnContador++;
    
    @ Formatar dados para exibicao @
    IntParaAlfa(vlClientes.Codigo, vaCodigo);
    DecimalParaAlfa(vlClientes.LimiteCredito, vaLimite);
    
    @ Montar detalhes do cliente @
    Definir Alfa vaNomeCliente;
    Definir Alfa vaCidadeCliente;
    Definir Alfa vaUfCliente;
    Definir Alfa vaAtivoCliente;
    
    vaNomeCliente = vlClientes.Nome;
    vaCidadeCliente = vlClientes.Cidade;
    vaUfCliente = vlClientes.UF;
    vaAtivoCliente = vlClientes.Ativo;
    
    vaDetalhes = "Cliente " + vaCodigo + ": " + vaNomeCliente + 
                " - " + vaCidadeCliente + "/" + vaUfCliente + 
                " - Ativo: " + vaAtivoCliente + 
                " - Limite: R$ " + vaLimite;
    
    @ Exibir detalhes @
    Mensagem(Retorna, vaDetalhes);
    
    @ Avançar para o proximo registro @
    vnTem = vlClientes.Proximo();
  }
  
  @ Estatistica de navegacao @
  Definir Alfa vaTotal;
  IntParaAlfa(vnContador, vaTotal);
  vaMensagem = "LISTA: Navegacao concluida - " + vaTotal + " registros processados";
  Mensagem(Retorna, vaMensagem);
}

/* ========================================================================
   FUNCAO: buscarClientePorCodigo
   DESCRICAO: Demonstra busca por chave primaria na lista
   PARAMETROS: pCodigo - Codigo do cliente a buscar
   RETORNO: Void
   OBSERVACOES: Usa SetarChave(), campo de chave e VaiParaChave()
   ======================================================================== */
Funcao buscarClientePorCodigo(Numero pCodigo); {
  Definir Alfa vaCodigoBusca;
  Definir Alfa vaResultadoBusca;
  
  IntParaAlfa(pCodigo, vaCodigoBusca);
  vaMensagem = "LISTA: Buscando cliente com codigo " + vaCodigoBusca;
  Mensagem(Retorna, vaMensagem);
  
  @ Configurar busca por chave @
  vlClientes.SetarChave();
  vlClientes.Codigo = pCodigo;
  
  @ Executar busca @
  Se (vlClientes.VaiParaChave() = 1) {
    @ Cliente encontrado @
    vaResultadoBusca = "BUSCA: Cliente encontrado - " + vlClientes.Nome + 
                      " de " + vlClientes.Cidade + "/" + vlClientes.UF;
    Mensagem(Retorna, vaResultadoBusca);
    
    @ Exibir status do cliente @
    Definir Alfa vaStatusCliente;
    Definir Alfa vaNomeClienteBusca;
    Definir Alfa vaCidadeClienteBusca;
    Definir Alfa vaUfClienteBusca;
    
    vaStatusCliente = vlClientes.Ativo;
    vaNomeClienteBusca = vlClientes.Nome;
    vaCidadeClienteBusca = vlClientes.Cidade;
    vaUfClienteBusca = vlClientes.UF;
    
    Se (vaStatusCliente = "S") {
      vaMensagem = "BUSCA: Cliente esta ATIVO no sistema";
    } Senao {
      vaMensagem = "BUSCA: Cliente esta INATIVO no sistema";
    }
    Mensagem(Retorna, vaMensagem);
    
  } Senao {
    @ Cliente nao encontrado @
    vaMensagem = "BUSCA: Cliente com codigo " + vaCodigoBusca + " nao encontrado";
    Mensagem(Retorna, vaMensagem);
  }
  
  @ Limpar filtro de chave @
  vlClientes.LimparChave();
}

/* ========================================================================
   FUNCAO: exibirEstatisticasDaLista
   DESCRICAO: Calcula e exibe estatisticas dos dados da lista
   PARAMETROS: Nenhum
   RETORNO: Void
   OBSERVACOES: Demonstra calculos sobre os dados da lista
   ======================================================================== */
Funcao exibirEstatisticasDaLista(); {
  Definir Numero vnTotalClientes; vnTotalClientes = 0;
  Definir Numero vnClientesAtivos; vnClientesAtivos = 0;
  Definir Numero vnClientesInativos; vnClientesInativos = 0;
  Definir Numero vnSomaLimites; vnSomaLimites = 0;
  Definir Numero vnMaiorLimite; vnMaiorLimite = 0;
  
  vaMensagem = "LISTA: Calculando estatisticas da lista";
  Mensagem(Retorna, vaMensagem);
  
  @ Navegar pela lista para calcular estatisticas @
  vnTem = vlClientes.Primeiro();
  
  Enquanto (vnTem = 1) {
    vnTotalClientes++;
    vnSomaLimites = vnSomaLimites + vlClientes.LimiteCredito;
    
    @ Verificar maior limite @
    Se (vlClientes.LimiteCredito > vnMaiorLimite) {
      vnMaiorLimite = vlClientes.LimiteCredito;
    }
    
    @ Contar por status @
    Se (vlClientes.Ativo = "S") {
      vnClientesAtivos++;
    } Senao {
      vnClientesInativos++;
    }
    
    vnTem = vlClientes.Proximo();
  }
  
  @ Formatar e exibir resultados @
  Definir Alfa vaTotal;
  Definir Alfa vaAtivos;
  Definir Alfa vaInativos;
  Definir Alfa vaSoma;
  Definir Alfa vaMaior;
  Definir Alfa vaMedia;
  Definir Numero vnMedia;
  
  IntParaAlfa(vnTotalClientes, vaTotal);
  IntParaAlfa(vnClientesAtivos, vaAtivos);
  IntParaAlfa(vnClientesInativos, vaInativos);
  DecimalParaAlfa(vnSomaLimites, vaSoma);
  DecimalParaAlfa(vnMaiorLimite, vaMaior);
  
  @ Calcular media @
  Se (vnTotalClientes > 0) {
    vnMedia = vnSomaLimites / vnTotalClientes;
  } Senao {
    vnMedia = 0;
  }
  DecimalParaAlfa(vnMedia, vaMedia);
  
  @ Exibir estatisticas @
  vaMensagem = "ESTATISTICAS: Total de clientes: " + vaTotal;
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "ESTATISTICAS: Clientes ativos: " + vaAtivos + " | Inativos: " + vaInativos;
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "ESTATISTICAS: Soma dos limites: R$ " + vaSoma;
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "ESTATISTICAS: Maior limite: R$ " + vaMaior;
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "ESTATISTICAS: Limite medio: R$ " + vaMedia;
  Mensagem(Retorna, vaMensagem);
} 
