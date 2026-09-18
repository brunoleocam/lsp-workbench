@ ========================================================================= @
@ TITULO: EXEMPLO DE LISTAS RELACIONADAS (MASTER-DETAIL)                    @
@ DESCRICAO: Demonstra relacionamento entre duas listas dinamicas usando    @
@            chave estrangeira, simulando um sistema de pedidos e itens     @
@            baseado no padrao usado em AST_ListarPedidosAbertos.lsp        @
@                                                                           @
@ DATA: 21/07/2025                                                          @
@ ========================================================================= @

@ === DECLARACAO DE VARIAVEIS === @
Definir Lista vlPedidos;         @ Lista principal (Master) @
Definir Lista vlItens;           @ Lista relacionada (Detail) @
Definir Numero vnIdPedido;       @ Contador de ID unico @
Definir Numero vnTem;            @ Variavel de controle @
Definir Alfa vaMensagem;         @ Variavel para mensagens @

@ === DECLARACAO DE FUNCOES === @
Definir Funcao criarEstruturasRelacionadas();
Definir Funcao adicionarPedidoComItens(Numero pCodigoCliente);
Definir Funcao exibirPedidosComItens();
Definir Funcao buscarItensDoPedido(Numero pIdPedido);
Definir Funcao calcularTotalPedidos();

@ === PROGRAMA PRINCIPAL === @
vaMensagem = "EXEMPLO: Iniciando demonstracao de Listas Relacionadas";
Mensagem(Retorna, vaMensagem);

@ Inicializar contador de ID @
vnIdPedido = 0;

@ Passo 1: Criar estruturas das listas relacionadas @
criarEstruturasRelacionadas();

@ Passo 2: Adicionar pedidos com seus itens @
adicionarPedidoComItens(101);  @ Cliente 101 @
adicionarPedidoComItens(102);  @ Cliente 102 @
adicionarPedidoComItens(101);  @ Cliente 101 novamente @

@ Passo 3: Exibir todos os pedidos com seus itens @
exibirPedidosComItens();

@ Passo 4: Buscar itens de um pedido especifico @
buscarItensDoPedido(2);

@ Passo 5: Calcular totais dos pedidos @
calcularTotalPedidos();

vaMensagem = "EXEMPLO: Demonstracao de Listas Relacionadas concluida";
Mensagem(Retorna, vaMensagem);

@ === IMPLEMENTACAO DAS FUNCOES === @

/* ========================================================================
   FUNCAO: criarEstruturasRelacionadas
   DESCRICAO: Cria estruturas das listas Master (Pedidos) e Detail (Itens)
   PARAMETROS: Nenhum
   RETORNO: Void
   OBSERVACOES: Define relacionamento atraves de IdPedido (chave estrangeira)
   ======================================================================== */
Funcao criarEstruturasRelacionadas(); {
  vaMensagem = "RELACIONAMENTO: Criando estruturas Master-Detail";
  Mensagem(Retorna, vaMensagem);
  
  @ === LISTA PRINCIPAL (MASTER) - PEDIDOS === @
  vlPedidos.DefinirCampos();
  vlPedidos.AdicionarCampo("IdPedido", numero);       @ ID unico (PK) @
  vlPedidos.AdicionarCampo("CodigoCliente", numero);  @ Codigo do cliente @
  vlPedidos.AdicionarCampo("NomeCliente", alfa, 100); @ Nome do cliente @
  vlPedidos.AdicionarCampo("DataPedido", data);       @ Data do pedido @
  vlPedidos.AdicionarCampo("Status", alfa, 1);        @ A=Aberto, F=Fechado @
  vlPedidos.AdicionarCampo("ValorTotal", numero);     @ Valor total calculado @
  vlPedidos.EfetivarCampos();
  vlPedidos.Chave("IdPedido");                        @ Chave primaria @
  
  @ === LISTA RELACIONADA (DETAIL) - ITENS === @
  vlItens.DefinirCampos();
  vlItens.AdicionarCampo("IdPedido", numero);         @ FK para vlPedidos @
  vlItens.AdicionarCampo("Sequencia", numero);       @ Numero sequencial do item @
  vlItens.AdicionarCampo("CodigoProduto", numero);    @ Codigo do produto @
  vlItens.AdicionarCampo("DescricaoProduto", alfa, 100); @ Descricao do produto @
  vlItens.AdicionarCampo("Quantidade", numero);       @ Quantidade @
  vlItens.AdicionarCampo("PrecoUnitario", numero);    @ Preco unitario @
  vlItens.AdicionarCampo("ValorItem", numero);        @ Quantidade * Preco @
  vlItens.EfetivarCampos();
  vlItens.Chave("IdPedido");                          @ Chave estrangeira @
  
  vaMensagem = "RELACIONAMENTO: Estruturas criadas - Pedidos(PK) -> Itens(FK)";
  Mensagem(Retorna, vaMensagem);
}

/* ========================================================================
   FUNCAO: adicionarPedidoComItens
   DESCRICAO: Adiciona um pedido e seus itens relacionados
   PARAMETROS: pCodigoCliente - Codigo do cliente para o pedido
   RETORNO: Void
   OBSERVACOES: Demonstra insercao coordenada em listas relacionadas
   ======================================================================== */
Funcao adicionarPedidoComItens(Numero pCodigoCliente); {
  Definir Alfa vaCodigoCliente;
  Definir Alfa vaIdAtual;
  Definir Numero vnValorTotalPedido; vnValorTotalPedido = 0;
  
  @ Incrementar ID unico @
  vnIdPedido++;
  
  IntParaAlfa(pCodigoCliente, vaCodigoCliente);
  IntParaAlfa(vnIdPedido, vaIdAtual);
  vaMensagem = "PEDIDO: Criando pedido " + vaIdAtual + " para cliente " + vaCodigoCliente;
  Mensagem(Retorna, vaMensagem);
  
  @ === ADICIONAR PEDIDO (MASTER) === @
  vlPedidos.Adicionar();
  vlPedidos.IdPedido = vnIdPedido;
  vlPedidos.CodigoCliente = pCodigoCliente;
  
  @ Definir nome do cliente baseado no codigo @
  Se (pCodigoCliente = 101) {
    vlPedidos.NomeCliente = "EMPRESA ABC LTDA";
  } Senao Se (pCodigoCliente = 102) {
    vlPedidos.NomeCliente = "COMERCIAL XYZ EIRELI";
  } Senao {
    vlPedidos.NomeCliente = "CLIENTE GENERICO";
  }
  
  vlPedidos.DataPedido = DatSis;
  vlPedidos.Status = "A";
  vlPedidos.ValorTotal = 0;  @ Sera calculado depois @
  vlPedidos.Gravar();
  
  @ === ADICIONAR ITENS (DETAIL) === @
  @ Item 1 @
  vlItens.Adicionar();
  vlItens.IdPedido = vnIdPedido;           @ Chave estrangeira @
  vlItens.Sequencia = 1;
  vlItens.CodigoProduto = 1001;
  vlItens.DescricaoProduto = "PRODUTO ALPHA";
  vlItens.Quantidade = 2;
  vlItens.PrecoUnitario = 150.50;
  vlItens.ValorItem = vlItens.Quantidade * vlItens.PrecoUnitario;
  vlItens.Gravar();
  vnValorTotalPedido = vnValorTotalPedido + vlItens.ValorItem;
  
  @ Item 2 @
  vlItens.Adicionar();
  vlItens.IdPedido = vnIdPedido;           @ Chave estrangeira @
  vlItens.Sequencia = 2;
  vlItens.CodigoProduto = 1002;
  vlItens.DescricaoProduto = "PRODUTO BETA";
  vlItens.Quantidade = 1;
  vlItens.PrecoUnitario = 89.99;
  vlItens.ValorItem = vlItens.Quantidade * vlItens.PrecoUnitario;
  vlItens.Gravar();
  vnValorTotalPedido = vnValorTotalPedido + vlItens.ValorItem;
  
  @ Item 3 @
  vlItens.Adicionar();
  vlItens.IdPedido = vnIdPedido;           @ Chave estrangeira @
  vlItens.Sequencia = 3;
  vlItens.CodigoProduto = 1003;
  vlItens.DescricaoProduto = "PRODUTO GAMMA";
  vlItens.Quantidade = 3;
  vlItens.PrecoUnitario = 25.75;
  vlItens.ValorItem = vlItens.Quantidade * vlItens.PrecoUnitario;
  vlItens.Gravar();
  vnValorTotalPedido = vnValorTotalPedido + vlItens.ValorItem;
  
  @ === ATUALIZAR VALOR TOTAL DO PEDIDO === @
  @ Buscar o pedido criado para atualizar o total @
  vlPedidos.SetarChave();
  vlPedidos.IdPedido = vnIdPedido;
  
  Se (vlPedidos.VaiParaChave() = 1) {
    vlPedidos.ValorTotal = vnValorTotalPedido;
    vlPedidos.Gravar();
    
    Definir Alfa vaTotal;
    DecimalParaAlfa(vnValorTotalPedido, vaTotal);
    vaMensagem = "PEDIDO: Total calculado R$ " + vaTotal + " - 3 itens adicionados";
    Mensagem(Retorna, vaMensagem);
  }
  
  vlPedidos.LimparChave();
}

/* ========================================================================
   FUNCAO: exibirPedidosComItens
   DESCRICAO: Exibe todos os pedidos e seus itens relacionados
   PARAMETROS: Nenhum
   RETORNO: Void
   OBSERVACOES: Demonstra navegacao coordenada entre listas relacionadas
   ======================================================================== */
Funcao exibirPedidosComItens(); {
  Definir Numero vnIdPedidoAtual;
  Definir Alfa vaDetalhePedido;
  Definir Alfa vaDetalheItem;
  
  vaMensagem = "RELATORIO: Exibindo todos os pedidos com seus itens";
  Mensagem(Retorna, vaMensagem);
  
  @ Navegar por todos os pedidos @
  vnTem = vlPedidos.Primeiro();
  
  Enquanto (vnTem = 1) {
    @ Formatar detalhes do pedido @
    Definir Alfa vaIdPed;
    Definir Alfa vaCodCli;
    Definir Alfa vaDataPed;
    Definir Alfa vaValorPed;
    
    IntParaAlfa(vlPedidos.IdPedido, vaIdPed);
    IntParaAlfa(vlPedidos.CodigoCliente, vaCodCli);
    ConverteMascara(3, vlPedidos.DataPedido, vaDataPed, "DD/MM/YYYY");
    DecimalParaAlfa(vlPedidos.ValorTotal, vaValorPed);
    
    Definir Alfa vaNomeClientePed;
    Definir Alfa vaStatusPed;
    
    vaNomeClientePed = vlPedidos.NomeCliente;
    vaStatusPed = vlPedidos.Status;
    
    vaDetalhePedido = "PEDIDO " + vaIdPed + " - Cliente: " + vaCodCli + 
                     " (" + vaNomeClientePed + ") - Data: " + vaDataPed + 
                     " - Status: " + vaStatusPed + " - Total: R$ " + vaValorPed;
    
    Mensagem(Retorna, vaDetalhePedido);
    
    @ Buscar itens deste pedido @
    vnIdPedidoAtual = vlPedidos.IdPedido;
    buscarItensDoPedido(vnIdPedidoAtual);
    
    @ Proximo pedido @
    vnTem = vlPedidos.Proximo();
  }
}

/* ========================================================================
   FUNCAO: buscarItensDoPedido
   DESCRICAO: Busca e exibe todos os itens de um pedido especifico
   PARAMETROS: pIdPedido - ID do pedido para buscar itens
   RETORNO: Void
   OBSERVACOES: Demonstra uso de chave estrangeira para busca relacionada
   ======================================================================== */
Funcao buscarItensDoPedido(Numero pIdPedido); {
  Definir Alfa vaIdPedidoBusca;
  Definir Numero vnContadorItens; vnContadorItens = 0;
  
  IntParaAlfa(pIdPedido, vaIdPedidoBusca);
  vaMensagem = "ITENS: Buscando itens do pedido " + vaIdPedidoBusca;
  Mensagem(Retorna, vaMensagem);
  
  @ Configurar busca por chave estrangeira @
  vlItens.SetarChave();
  vlItens.IdPedido = pIdPedido;
  
  @ Buscar primeiro item @
  Se (vlItens.VaiParaChave() = 1) {
    @ Navegar por todos os itens deste pedido @
    Enquanto ((vlItens.FDA = 0) e (vlItens.IdPedido = pIdPedido)) {
      vnContadorItens++;
      
      @ Formatar detalhes do item @
      Definir Alfa vaSequencia;
      Definir Alfa vaCodProd;
      Definir Alfa vaQuantidade;
      Definir Alfa vaPrecoUnit;
      Definir Alfa vaValorItem;
      Definir Alfa vaDetalheItem;
      
      IntParaAlfa(vlItens.Sequencia, vaSequencia);
      IntParaAlfa(vlItens.CodigoProduto, vaCodProd);
      DecimalParaAlfa(vlItens.Quantidade, vaQuantidade);
      DecimalParaAlfa(vlItens.PrecoUnitario, vaPrecoUnit);
      DecimalParaAlfa(vlItens.ValorItem, vaValorItem);
      
      Definir Alfa vaDescricaoItem;
      vaDescricaoItem = vlItens.DescricaoProduto;
      
      vaDetalheItem = "  Item " + vaSequencia + ": " + vaDescricaoItem + 
                     " (Cod: " + vaCodProd + ") - Qtd: " + vaQuantidade + 
                     " - Unit: R$ " + vaPrecoUnit + " - Total: R$ " + vaValorItem;
      
      Mensagem(Retorna, vaDetalheItem);
      
      @ Proximo item @
      vlItens.Proximo();
    }
    
    @ Estatistica dos itens @
    Definir Alfa vaContadorStr;
    IntParaAlfa(vnContadorItens, vaContadorStr);
    vaMensagem = "ITENS: " + vaContadorStr + " itens encontrados para o pedido " + vaIdPedidoBusca;
    Mensagem(Retorna, vaMensagem);
    
  } Senao {
    vaMensagem = "ITENS: Nenhum item encontrado para o pedido " + vaIdPedidoBusca;
    Mensagem(Retorna, vaMensagem);
  }
  
  @ Limpar filtro de chave @
  vlItens.LimparChave();
}

/* ========================================================================
   FUNCAO: calcularTotalPedidos
   DESCRICAO: Calcula estatisticas consolidadas dos pedidos e itens
   PARAMETROS: Nenhum
   RETORNO: Void
   OBSERVACOES: Demonstra calculos consolidados entre listas relacionadas
   ======================================================================== */
Funcao calcularTotalPedidos(); {
  Definir Numero vnTotalPedidos; vnTotalPedidos = 0;
  Definir Numero vnTotalItens; vnTotalItens = 0;
  Definir Numero vnSomaPedidos; vnSomaPedidos = 0;
  Definir Numero vnMaiorPedido; vnMaiorPedido = 0;
  
  vaMensagem = "CONSOLIDACAO: Calculando estatisticas consolidadas";
  Mensagem(Retorna, vaMensagem);
  
  @ === ESTATISTICAS DOS PEDIDOS === @
  vnTem = vlPedidos.Primeiro();
  
  Enquanto (vnTem = 1) {
    vnTotalPedidos++;
    vnSomaPedidos = vnSomaPedidos + vlPedidos.ValorTotal;
    
    @ Verificar maior pedido @
    Se (vlPedidos.ValorTotal > vnMaiorPedido) {
      vnMaiorPedido = vlPedidos.ValorTotal;
    }
    
    vnTem = vlPedidos.Proximo();
  }
  
  @ === ESTATISTICAS DOS ITENS === @
  vnTem = vlItens.Primeiro();
  
  Enquanto (vnTem = 1) {
    vnTotalItens++;
    vnTem = vlItens.Proximo();
  }
  
  @ === EXIBIR RESULTADOS === @
  Definir Alfa vaTotalPed;
  Definir Alfa vaTotalItens;
  Definir Alfa vaSomaPed;
  Definir Alfa vaMaiorPed;
  Definir Alfa vaMediaPed;
  Definir Numero vnMediaPedidos;
  
  IntParaAlfa(vnTotalPedidos, vaTotalPed);
  IntParaAlfa(vnTotalItens, vaTotalItens);
  DecimalParaAlfa(vnSomaPedidos, vaSomaPed);
  DecimalParaAlfa(vnMaiorPedido, vaMaiorPed);
  
  @ Calcular media @
  Se (vnTotalPedidos > 0) {
    vnMediaPedidos = vnSomaPedidos / vnTotalPedidos;
  } Senao {
    vnMediaPedidos = 0;
  }
  DecimalParaAlfa(vnMediaPedidos, vaMediaPed);
  
  @ Exibir estatisticas @
  vaMensagem = "CONSOLIDACAO: Total de pedidos: " + vaTotalPed;
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "CONSOLIDACAO: Total de itens: " + vaTotalItens;
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "CONSOLIDACAO: Soma dos pedidos: R$ " + vaSomaPed;
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "CONSOLIDACAO: Maior pedido: R$ " + vaMaiorPed;
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "CONSOLIDACAO: Valor medio por pedido: R$ " + vaMediaPed;
  Mensagem(Retorna, vaMensagem);
} 
