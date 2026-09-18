@ ========================================================================= @
@ TITULO: EXEMPLO DE CONTROLE DE LOOP - PARE E CONTINUE                     @
@ DESCRICAO: Demonstra uso de comandos Pare e Continue em loops, incluindo  @
@            loops aninhados, condicoes de saida e processamento seletivo   @
@            baseado em exemplos reais de processamento de dados            @
@                                                                           @
@ ========================================================================= @

@ === DECLARACAO DE VARIAVEIS === @
Definir Numero vnContador;       @ Contador principal @
Definir Numero vnContadorInterno; @ Contador para loops aninhados @
Definir Numero vnNumero;         @ Numero para processamento @
Definir Numero vnSoma;           @ Acumulador de soma @
Definir Numero vnPares;          @ Contador de numeros pares @
Definir Numero vnImpares;        @ Contador de numeros impares @
Definir Alfa vaMensagem;         @ Variavel para mensagens @
Definir Alfa vaResultado;        @ Resultado formatado @

@ === DECLARACAO DE FUNCOES === @
Definir Funcao exemploLoopComPare();
Definir Funcao exemploLoopComContinue();
Definir Funcao exemploLoopsAninhados();
Definir Funcao processarListaComControles();
Definir Funcao buscarPrimeiroMultiploDe(Numero pMultiplo);

@ === PROGRAMA PRINCIPAL === @
vaMensagem = "EXEMPLO: Iniciando demonstracao de Controle de Loops";
Mensagem(Retorna, vaMensagem);

@ Exemplo 1: Loop com Pare - Busca sequencial @
exemploLoopComPare();

@ Exemplo 2: Loop com Continue - Processamento seletivo @
exemploLoopComContinue();

@ Exemplo 3: Loops aninhados com controles @
exemploLoopsAninhados();

@ Exemplo 4: Processamento de lista com multiplos controles @
processarListaComControles();

@ Exemplo 5: Busca com parametro @
buscarPrimeiroMultiploDe(7);

vaMensagem = "EXEMPLO: Demonstracao de Controle de Loops concluida";
Mensagem(Retorna, vaMensagem);

@ === IMPLEMENTACAO DAS FUNCOES === @

/* ========================================================================
   FUNCAO: exemploLoopComPare
   DESCRICAO: Demonstra uso do comando Pare para interromper loop
   PARAMETROS: Nenhum
   RETORNO: Void
   OBSERVACOES: Simula busca de um numero especifico e para quando encontra
   ======================================================================== */
Funcao exemploLoopComPare(); {
  Definir Numero vnNumeroAlvo; vnNumeroAlvo = 47;
  Definir Alfa vaAlvo;
  Definir Alfa vaAtual;
  
  IntParaAlfa(vnNumeroAlvo, vaAlvo);
  vaMensagem = "PARE: Buscando numero " + vaAlvo + " em sequencia de 1 a 100";
  Mensagem(Retorna, vaMensagem);
  
  @ Inicializar variaveis @
  vnContador = 1;
  
  @ Loop principal - Para quando encontrar o numero @
  Enquanto (vnContador <= 100) {
    @ Verificar se encontrou o numero alvo @
    Se (vnContador = vnNumeroAlvo) {
      IntParaAlfa(vnContador, vaAtual);
      vaMensagem = "PARE: Numero " + vaAlvo + " encontrado na posicao " + vaAtual + " - Interrompendo busca";
      Mensagem(Retorna, vaMensagem);
      
      @ PARE - Sai do loop imediatamente @
      Pare;
    }
    
    @ Continuar incrementando @
    vnContador++;
  }
  
  @ Verificar se foi encontrado ou chegou ao final @
  Se (vnContador <= 100) {
    vaMensagem = "PARE: Busca finalizada com sucesso";
  } Senao {
    vaMensagem = "PARE: Numero nao encontrado no intervalo";
  }
  Mensagem(Retorna, vaMensagem);
}

/* ========================================================================
   FUNCAO: exemploLoopComContinue
   DESCRICAO: Demonstra uso de Continue para pular iteracoes especificas
   PARAMETROS: Nenhum
   RETORNO: Void
   OBSERVACOES: Processa apenas numeros pares, pulando os impares
   ======================================================================== */
Funcao exemploLoopComContinue(); {
  vaMensagem = "CONTINUE: Processando apenas numeros pares de 1 a 20";
  Mensagem(Retorna, vaMensagem);
  
  @ Inicializar contadores @
  vnContador = 1;
  vnSoma = 0;
  vnPares = 0;
  
  @ Loop para processar numeros de 1 a 20 @
  Enquanto (vnContador <= 20) {
    @ Verificar se o numero e impar @
    Definir Numero vnResto;
    RestoDivisao(vnContador, 2, vnResto);
    
    Se (vnResto = 1) {
      @ Numero impar - pular para o proximo @
      Definir Alfa vaImpar;
      IntParaAlfa(vnContador, vaImpar);
      vaMensagem = "CONTINUE: Pulando numero impar " + vaImpar;
      Mensagem(Retorna, vaMensagem);
      
      vnContador++;
      @ CONTINUE - Pula para a proxima iteracao do loop @
      Continue;
    }
    
    @ Se chegou aqui, o numero e par - processar @
    vnPares++;
    vnSoma = vnSoma + vnContador;
    
    Definir Alfa vaPar;
    Definir Alfa vaSomaAtual;
    IntParaAlfa(vnContador, vaPar);
    IntParaAlfa(vnSoma, vaSomaAtual);
    vaMensagem = "CONTINUE: Processando numero par " + vaPar + " - Soma acumulada: " + vaSomaAtual;
    Mensagem(Retorna, vaMensagem);
    
    vnContador++;
  }
  
  @ Exibir resultado final @
  Definir Alfa vaQtdPares;
  Definir Alfa vaSomaFinal;
  IntParaAlfa(vnPares, vaQtdPares);
  IntParaAlfa(vnSoma, vaSomaFinal);
  vaMensagem = "CONTINUE: Processados " + vaQtdPares + " numeros pares - Soma total: " + vaSomaFinal;
  Mensagem(Retorna, vaMensagem);
}

/* ========================================================================
   FUNCAO: exemploLoopsAninhados
   DESCRICAO: Demonstra Pare e Continue em loops aninhados
   PARAMETROS: Nenhum
   RETORNO: Void
   OBSERVACOES: Mostra como os controles afetam apenas o loop atual
   ======================================================================== */
Funcao exemploLoopsAninhados(); {
  vaMensagem = "ANINHADOS: Demonstrando controles em loops aninhados";
  Mensagem(Retorna, vaMensagem);
  
  @ Loop externo - linhas de 1 a 5 @
  vnContador = 1;
  
  Enquanto (vnContador <= 5) {
    Definir Alfa vaLinha;
    IntParaAlfa(vnContador, vaLinha);
    vaMensagem = "ANINHADOS: Processando linha " + vaLinha;
    Mensagem(Retorna, vaMensagem);
    
    @ Verificar se deve pular linha 3 completa @
    Se (vnContador = 3) {
      vaMensagem = "ANINHADOS: Pulando linha 3 completa (CONTINUE no loop externo)";
      Mensagem(Retorna, vaMensagem);
      vnContador++;
      Continue;  @ Pula para proxima linha @
    }
    
    @ Loop interno - colunas de 1 a 10 @
    vnContadorInterno = 1;
    
    Enquanto (vnContadorInterno <= 10) {
      @ Verificar se deve parar na coluna 6 da linha 4 @
      Se ((vnContador = 4) e (vnContadorInterno = 6)) {
        vaMensagem = "ANINHADOS: Parando na coluna 6 da linha 4 (PARE no loop interno)";
        Mensagem(Retorna, vaMensagem);
        Pare;  @ Para apenas o loop interno @
      }
      
      @ Verificar se deve pular colunas multiplas de 3 @
      Definir Numero vnRestoTres;
      RestoDivisao(vnContadorInterno, 3, vnRestoTres);
      
      Se (vnRestoTres = 0) {
        Definir Alfa vaColuna;
        IntParaAlfa(vnContadorInterno, vaColuna);
        vaMensagem = "ANINHADOS: Pulando coluna " + vaColuna + " (multiplo de 3)";
        Mensagem(Retorna, vaMensagem);
        vnContadorInterno++;
        Continue;  @ Pula para proxima coluna @
      }
      
      @ Processar posicao normal @
      Definir Alfa vaLinhAtual;
      Definir Alfa vaColunaAtual;
      IntParaAlfa(vnContador, vaLinhAtual);
      IntParaAlfa(vnContadorInterno, vaColunaAtual);
      vaMensagem = "ANINHADOS: Processando posicao [" + vaLinhAtual + "," + vaColunaAtual + "]";
      Mensagem(Retorna, vaMensagem);
      
      vnContadorInterno++;
    }
    
    vaMensagem = "ANINHADOS: Linha " + vaLinha + " concluida";
    Mensagem(Retorna, vaMensagem);
    
    vnContador++;
  }
  
  vaMensagem = "ANINHADOS: Processamento de matriz concluido";
  Mensagem(Retorna, vaMensagem);
}

/* ========================================================================
   FUNCAO: processarListaComControles
   DESCRICAO: Simula processamento de lista com multiplas condicoes
   PARAMETROS: Nenhum
   RETORNO: Void
   OBSERVACOES: Exemplo pratico de processamento de dados com filtros
   ======================================================================== */
Funcao processarListaComControles(); {
  Definir Numero vnTotalProcessados; vnTotalProcessados = 0;
  Definir Numero vnTotalPulados; vnTotalPulados = 0;
  Definir Numero vnSomaValidos; vnSomaValidos = 0;
  
  vaMensagem = "PROCESSAMENTO: Simulando analise de vendas (valores 1-50)";
  Mensagem(Retorna, vaMensagem);
  
  vnContador = 1;
  
  Enquanto (vnContador <= 50) {
    @ Simular valor de venda baseado no contador @
    vnNumero = vnContador * 2.5;
    
    @ Criterio 1: Pular vendas muito baixas (< 20) @
    Se (vnNumero < 20) {
      vnTotalPulados++;
      vnContador++;
      Continue;  @ Pular venda muito baixa @
    }
    
    @ Criterio 2: Parar se encontrar venda muito alta (> 100) @
    Se (vnNumero > 100) {
      Definir Alfa vaValorAlto;
      DecimalParaAlfa(vnNumero, vaValorAlto);
      vaMensagem = "PROCESSAMENTO: Venda muito alta encontrada (R$ " + vaValorAlto + ") - Parando analise";
      Mensagem(Retorna, vaMensagem);
      Pare;  @ Parar processamento @
    }
    
    @ Criterio 3: Pular vendas em horario de almoco (30-40) @
    Se ((vnNumero >= 30) e (vnNumero <= 40)) {
      Definir Alfa vaAlmoco;
      DecimalParaAlfa(vnNumero, vaAlmoco);
      vaMensagem = "PROCESSAMENTO: Pulando venda do almoco R$ " + vaAlmoco;
      Mensagem(Retorna, vaMensagem);
      vnTotalPulados++;
      vnContador++;
      Continue;  @ Pular horario de almoco @
    }
    
    @ Processar venda valida @
    vnTotalProcessados++;
    vnSomaValidos = vnSomaValidos + vnNumero;
    
    Definir Alfa vaVenda;
    Definir Alfa vaSequencia;
    DecimalParaAlfa(vnNumero, vaVenda);
    IntParaAlfa(vnTotalProcessados, vaSequencia);
    vaMensagem = "PROCESSAMENTO: Venda " + vaSequencia + " processada: R$ " + vaVenda;
    Mensagem(Retorna, vaMensagem);
    
    vnContador++;
  }
  
  @ Exibir estatisticas finais @
  Definir Alfa vaProcessados;
  Definir Alfa vaPulados;
  Definir Alfa vaSoma;
  Definir Alfa vaMedia;
  Definir Numero vnMedia;
  
  IntParaAlfa(vnTotalProcessados, vaProcessados);
  IntParaAlfa(vnTotalPulados, vaPulados);
  DecimalParaAlfa(vnSomaValidos, vaSoma);
  
  Se (vnTotalProcessados > 0) {
    vnMedia = vnSomaValidos / vnTotalProcessados;
  } Senao {
    vnMedia = 0;
  }
  DecimalParaAlfa(vnMedia, vaMedia);
  
  vaMensagem = "PROCESSAMENTO: Vendas processadas: " + vaProcessados;
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "PROCESSAMENTO: Vendas puladas: " + vaPulados;
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "PROCESSAMENTO: Soma das vendas validas: R$ " + vaSoma;
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "PROCESSAMENTO: Ticket medio: R$ " + vaMedia;
  Mensagem(Retorna, vaMensagem);
}

/* ========================================================================
   FUNCAO: buscarPrimeiroMultiploDe
   DESCRICAO: Busca o primeiro multiplo de um numero em uma faixa
   PARAMETROS: pMultiplo - Numero para encontrar multiplo
   RETORNO: Void
   OBSERVACOES: Exemplo de busca com parametro usando Pare
   ======================================================================== */
Funcao buscarPrimeiroMultiploDe(Numero pMultiplo); {
  Definir Alfa vaMultiplo;
  Definir Numero vnInicio; vnInicio = 10;
  Definir Numero vnFim; vnFim = 100;
  Definir Numero vnEncontrado; vnEncontrado = 0;
  
  IntParaAlfa(pMultiplo, vaMultiplo);
  vaMensagem = "BUSCA: Procurando primeiro multiplo de " + vaMultiplo + " entre 10 e 100";
  Mensagem(Retorna, vaMensagem);
  
  vnContador = vnInicio;
  
  Enquanto (vnContador <= vnFim) {
    @ Verificar se e multiplo @
    Definir Numero vnResto;
    RestoDivisao(vnContador, pMultiplo, vnResto);
    
    Se (vnResto = 0) {
      @ Encontrou o primeiro multiplo @
      vnEncontrado = vnContador;
      
      Definir Alfa vaEncontrado;
      IntParaAlfa(vnEncontrado, vaEncontrado);
      vaMensagem = "BUSCA: Primeiro multiplo encontrado: " + vaEncontrado;
      Mensagem(Retorna, vaMensagem);
      
      @ Parar a busca @
      Pare;
    }
    
    vnContador++;
  }
  
  @ Verificar resultado @
  Se (vnEncontrado > 0) {
    vaMensagem = "BUSCA: Busca concluida com sucesso";
  } Senao {
    vaMensagem = "BUSCA: Nenhum multiplo encontrado no intervalo";
  }
  Mensagem(Retorna, vaMensagem);
} 
