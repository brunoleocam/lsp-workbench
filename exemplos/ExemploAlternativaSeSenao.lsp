@ ========================================================================= @
@ TITULO: EXEMPLO DE VARIAVEIS ALFA - EVITANDO SE/SENAO                     @
@ DESCRICAO: Demonstra uso de PegarValorVarAlf e PegarValorVarNum para      @
@            substituir estruturas Se/Senao complexas, baseado no padrao    @
@            usado em buscarCodigoServico e buscarServicoAdicional          @
@                                                                           @
@ DATA: 21/07/2025                                                          @
@ ========================================================================= @

@ === DECLARACAO DE VARIAVEIS === @
Definir Alfa vaParametro;        @ Variavel de entrada para busca @
Definir Alfa vaRetorno;          @ Variavel de retorno do resultado @
Definir Numero vnParametro;      @ Parametro numerico @
Definir Numero vnRetorno;        @ Retorno numerico @
Definir Alfa vaMensagem;         @ Variavel para mensagens @

@ === VARIAVEIS DE MAPEAMENTO === @
@ Tipos de transporte @
Definir Alfa ECONOMICO; ECONOMICO = "10001";
Definir Alfa EXPRESSO; EXPRESSO = "10002";
Definir Alfa SUPER_RAPIDO; SUPER_RAPIDO = "10003";
Definir Alfa OVERNIGHT; OVERNIGHT = "10004";
Definir Alfa AGENDADO; AGENDADO = "10005";

@ Servicos adicionaiss @
Definir Alfa CONFIRMACAO; CONFIRMACAO = "201";
Definir Alfa NOTIFICACAO; NOTIFICACAO = "202";
Definir Alfa ASSINATURA; ASSINATURA = "203";
Definir Alfa SEGURO; SEGURO = "204";

@ Status de pedidos @
Definir Alfa A; A = "Pedido em Andamento";
Definir Alfa P; P = "Aguardando Producao";
Definir Alfa R; R = "Em Processo de Fabricacao";
Definir Alfa S; S = "Pronto para Envio";
Definir Alfa D; D = "Entregue ao Cliente";

@ Tipos de cliente @
Definir Numero VAREJO; VAREJO = 10;
Definir Numero ATACADO; ATACADO = 15;
Definir Numero DISTRIBUIDOR; DISTRIBUIDOR = 20;
Definir Numero VIP; VIP = 25;
Definir Numero GOVERNO; GOVERNO = 30;

@ === DECLARACAO DE FUNCOES === @
Definir Funcao buscarCodigoTransporte();
Definir Funcao buscarServicoAdicional();
Definir Funcao obterStatusPedido();
Definir Funcao calcularDescontoPorTipo(Numero pTipoCliente);
Definir Funcao exemploCompleto();
Definir Funcao exemploComparacaoMetodos();

@ === PROGRAMA PRINCIPAL === @
vaMensagem = "EXEMPLO: Iniciando demonstracao de Variaveis Alfa";
Mensagem(Retorna, vaMensagem);

@ Exemplo 1: Buscar codigos de transporte @
vaParametro = "ECONOMICO"; buscarCodigoTransporte();
vaParametro = "EXPRESSO"; buscarCodigoTransporte();
vaParametro = "SUPER_RAPIDO"; buscarCodigoTransporte();

@ Exemplo 2: Buscar servicos adicionais @
vaParametro = "CONFIRMACAO"; buscarServicoAdicional();
vaParametro = "NOTIFICACAO"; buscarServicoAdicional();
vaParametro = "ASSINATURA"; buscarServicoAdicional();

@ Exemplo 3: Obter status de pedidos @
vaParametro = "A"; obterStatusPedido();
vaParametro = "P"; obterStatusPedido();
vaParametro = "S"; obterStatusPedido();

@ Exemplo 4: Calcular desconto por tipo @
calcularDescontoPorTipo(10);
calcularDescontoPorTipo(15);
calcularDescontoPorTipo(25);

@ Exemplo 5: Exemplo completo integrado @
exemploCompleto();

@ Exemplo 6: Comparacao entre metodos @
exemploComparacaoMetodos();

vaMensagem = "EXEMPLO: Demonstracao de Variaveis Alfa concluida";
Mensagem(Retorna, vaMensagem);

@ === IMPLEMENTACAO DAS FUNCOES === @

/* ========================================================================
   FUNCAO: buscarCodigoTransporte
   DESCRICAO: Busca codigo numerico do tipo de transporte
   PARAMETROS: vaParametro - Nome do tipo de transporte (global)
   RETORNO: vaRetorno - Codigo numerico do transporte (global)
   OBSERVACOES: Usa PegarValorVarAlf para evitar multiplos Se/Senao
   ======================================================================== */
Funcao buscarCodigoTransporte(); {
  vaMensagem = "TRANSPORTE: Buscando codigo para tipo " + vaParametro;
  Mensagem(Retorna, vaMensagem);
  
  @ Usar PegarValorVarAlf para buscar o valor da variavel @
  PegarValorVarAlf(vaParametro, vaRetorno);
  
  @ Verificar se encontrou @
  Definir Numero vnNulo;
  EstaNulo(vaRetorno, vnNulo);
  
  Se (vnNulo = 1) {
    vaRetorno = "00000";  @ Codigo padrao para transporte nao encontrado @
    vaMensagem = "TRANSPORTE: Tipo " + vaParametro + " nao encontrado - usando codigo padrao " + vaRetorno;
  } Senao {
    vaMensagem = "TRANSPORTE: Tipo " + vaParametro + " encontrado - codigo: " + vaRetorno;
  }
  
  Mensagem(Retorna, vaMensagem);
}

/* ========================================================================
   FUNCAO: buscarServicoAdicional
   DESCRICAO: Busca codigo de servico adicional
   PARAMETROS: vaParametro - Nome do servico adicional (global)
   RETORNO: vaRetorno - Codigo do servico adicional (global)
   OBSERVACOES: Mesmo padrao da funcao anterior, evitando Se/Senao
   ======================================================================== */
Funcao buscarServicoAdicional(); {
  vaMensagem = "ADICIONAL: Buscando codigo para " + vaParametro;
  Mensagem(Retorna, vaMensagem);
  
  @ Usar PegarValorVarAlf para buscar diretamente @
  PegarValorVarAlf(vaParametro, vaRetorno);
  
  @ Verificar resultado @
  Definir Numero vnNulo;
  EstaNulo(vaRetorno, vnNulo);
  
  Se (vnNulo = 1) {
    vaRetorno = "000";  @ Codigo padrao @
    vaMensagem = "ADICIONAL: Servico " + vaParametro + " nao encontrado - sem servico adicional";
  } Senao {
    vaMensagem = "ADICIONAL: Servico " + vaParametro + " encontrado - codigo: " + vaRetorno;
  }
  
  Mensagem(Retorna, vaMensagem);
}

/* ========================================================================
   FUNCAO: obterStatusPedido
   DESCRICAO: Converte codigo de status em descricao completa
   PARAMETROS: vaParametro - Codigo do status (A, P, S, etc.) (global)
   RETORNO: vaRetorno - Descricao completa do status (global)
   OBSERVACOES: Usa PegarValorVarAlf DIRETAMENTE evitando Se/Senao completamente
   ======================================================================== */
Funcao obterStatusPedido(); {
  vaMensagem = "STATUS: Buscando descricao para codigo " + vaParametro;
  Mensagem(Retorna, vaMensagem);
  
  @ Usar PegarValorVarAlf DIRETAMENTE com o codigo como nome da variavel @
  @ Isso elimina TODOS os Se/Senao! @
  PegarValorVarAlf(vaParametro, vaRetorno);
  
  @ Verificar se encontrou @
  Definir Numero vnNulo;
  EstaNulo(vaRetorno, vnNulo);
  
  Se (vnNulo = 1) {
    vaRetorno = "Status nao identificado";
    vaMensagem = "STATUS: Codigo " + vaParametro + " nao encontrado - status desconhecido";
  } Senao {
    vaMensagem = "STATUS: Codigo " + vaParametro + " = " + vaRetorno;
  }
  
  Mensagem(Retorna, vaMensagem);
}

/* ========================================================================
   FUNCAO: calcularDescontoPorTipo
   DESCRICAO: Calcula percentual de desconto baseado no tipo de cliente
   PARAMETROS: pTipoCliente - Codigo numerico do tipo de cliente
   RETORNO: vnRetorno - Percentual de desconto (global)
   OBSERVACOES: Usa PegarValorVarNum para buscar valores numericos
   ======================================================================== */
Funcao calcularDescontoPorTipo(Numero pTipoCliente); {
  Definir Alfa vaTipo;
  Definir Alfa vaDesconto;
  
  IntParaAlfa(pTipoCliente, vaTipo);
  vaMensagem = "DESCONTO: Calculando para tipo de cliente " + vaTipo;
  Mensagem(Retorna, vaMensagem);
  
  @ Mapear codigo para nome de variavel @
  Definir Alfa vaNomeVariavel;
  
  Se (pTipoCliente = 10) {
    vaNomeVariavel = "VAREJO";
  } Senao Se (pTipoCliente = 15) {
    vaNomeVariavel = "ATACADO";
  } Senao Se (pTipoCliente = 20) {
    vaNomeVariavel = "DISTRIBUIDOR";
  } Senao Se (pTipoCliente = 25) {
    vaNomeVariavel = "VIP";
  } Senao Se (pTipoCliente = 30) {
    vaNomeVariavel = "GOVERNO";
  } Senao {
    vaNomeVariavel = "PADRAO";
  }
  
  @ Usar PegarValorVarNum para obter percentual @
  PegarValorVarNum(vaNomeVariavel, vnRetorno);
  
  @ Verificar se encontrou @
  Se (vnRetorno = 0) {
    vnRetorno = 5;  @ Desconto padrao 5% @
    vaRetorno = "Tipo nao encontrado - desconto padrao";
  } Senao {
    vaRetorno = "Desconto especial para " + vaNomeVariavel;
  }
  
  DecimalParaAlfa(vnRetorno, vaDesconto);
  vaMensagem = "DESCONTO: Cliente tipo " + vaTipo + " tem " + vaDesconto + "% de desconto";
  Mensagem(Retorna, vaMensagem);
}

/* ========================================================================
   FUNCAO: exemploCompleto
   DESCRICAO: Exemplo completo integrando todos os tipos de busca
   PARAMETROS: Nenhum
   RETORNO: Void
   OBSERVACOES: Simula processamento de pedido com multiplas buscas
   ======================================================================== */
Funcao exemploCompleto(); {
  vaMensagem = "COMPLETO: Simulando processamento de pedido completo";
  Mensagem(Retorna, vaMensagem);
  
  @ === DADOS DO PEDIDO === @
  Definir Alfa vaServicoSelecionado; vaServicoSelecionado = "EXPRESSO";
  Definir Alfa vaAdicionalSelecionado; vaAdicionalSelecionado = "CONFIRMACAO";
  Definir Alfa vaStatusAtual; vaStatusAtual = "A";
  Definir Numero vnTipoCliente; vnTipoCliente = 25;
  
  @ === BUSCAR CODIGO DO TRANSPORTE === @
  vaParametro = vaServicoSelecionado;
  buscarCodigoTransporte();
  Definir Alfa vaCodigoServico; vaCodigoServico = vaRetorno;
  
  @ === BUSCAR SERVICO ADICIONAL === @
  vaParametro = vaAdicionalSelecionado;
  buscarServicoAdicional();
  Definir Alfa vaCodigoAdicional; vaCodigoAdicional = vaRetorno;
  
  @ === OBTER STATUS === @
  vaParametro = vaStatusAtual;
  obterStatusPedido();
  Definir Alfa vaDescricaoStatus; vaDescricaoStatus = vaRetorno;
  
  @ === CALCULAR DESCONTO === @
  calcularDescontoPorTipo(vnTipoCliente);
  Definir Numero vnPercentualDesconto; vnPercentualDesconto = vnRetorno;
  
  @ === MONTAR RESULTADO CONSOLIDADO === @
  Definir Alfa vaResumo;
  Definir Alfa vaPercentual;
  DecimalParaAlfa(vnPercentualDesconto, vaPercentual);
  
  vaResumo = "PEDIDO PROCESSADO - Servico: " + vaServicoSelecionado + 
            " (" + vaCodigoServico + ") + " + vaAdicionalSelecionado + 
            " (" + vaCodigoAdicional + ") - Status: " + vaDescricaoStatus + 
            " - Desconto: " + vaPercentual + "%";
  
  Mensagem(Retorna, vaResumo);
}

/* ========================================================================
   FUNCAO: exemploComparacaoMetodos
   DESCRICAO: Compara metodo com Se/Senao vs PegarValorVarAlf
   PARAMETROS: Nenhum
   RETORNO: Void
   OBSERVACOES: Demonstra a diferenca entre as duas abordagens
   ======================================================================== */
Funcao exemploComparacaoMetodos(); {
  vaMensagem = "COMPARACAO: Demonstrando diferenca entre metodos";
  Mensagem(Retorna, vaMensagem);
  
  @ === METODO TRADICIONAL COM SE/SENAO === @
  Definir Alfa vaCodigoTradicional;
  Definir Alfa vaServicoTeste; vaServicoTeste = "SUPER_RAPIDO";
  
  vaMensagem = "TRADICIONAL: Usando Se/Senao para buscar " + vaServicoTeste;
  Mensagem(Retorna, vaMensagem);
  
  Se (vaServicoTeste = "ECONOMICO") {
    vaCodigoTradicional = "10001";
  } Senao Se (vaServicoTeste = "EXPRESSO") {
    vaCodigoTradicional = "10002";
  } Senao Se (vaServicoTeste = "SUPER_RAPIDO") {
    vaCodigoTradicional = "10003";
  } Senao Se (vaServicoTeste = "OVERNIGHT") {
    vaCodigoTradicional = "10004";
  } Senao Se (vaServicoTeste = "AGENDADO") {
    vaCodigoTradicional = "10005";
  } Senao {
    vaCodigoTradicional = "00000";
  }
  
  vaMensagem = "TRADICIONAL: Resultado = " + vaCodigoTradicional;
  Mensagem(Retorna, vaMensagem);
  
  @ === METODO COM PEGARVALORVARF === @
  Definir Alfa vaCodigoOtimizado;
  
  vaMensagem = "OTIMIZADO: Usando PegarValorVarAlf para buscar " + vaServicoTeste;
  Mensagem(Retorna, vaMensagem);
  
  vaParametro = vaServicoTeste;
  buscarCodigoTransporte();
  vaCodigoOtimizado = vaRetorno;
  
  vaMensagem = "OTIMIZADO: Resultado = " + vaCodigoOtimizado;
  Mensagem(Retorna, vaMensagem);
  
  @ === COMPARAR RESULTADOS === @
  Se (vaCodigoTradicional = vaCodigoOtimizado) {
    vaMensagem = "COMPARACAO: Ambos os metodos retornaram o mesmo resultado!";
  } Senao {
    vaMensagem = "COMPARACAO: ERRO - Resultados diferentes entre os metodos!";
  }
  Mensagem(Retorna, vaMensagem);
  
  @ === VANTAGENS DO METODO OTIMIZADO === @
  vaMensagem = "VANTAGENS: PegarValorVarAlf reduz codigo, facilita manutencao e evita erros";
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "VANTAGENS: Adicionar novos servicos requer apenas criar a variavel";
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "VANTAGENS: Codigo mais limpo e menos propenso a erros de digitacao";
  Mensagem(Retorna, vaMensagem);
} 
