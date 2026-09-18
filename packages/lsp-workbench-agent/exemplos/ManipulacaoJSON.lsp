@ ========================================================================= @
@ TITULO: EXEMPLOS COMPLETOS DE MANIPULAÇÃO DE JSON EM LSP                  @
@ DESCRICAO: Demonstração prática das três abordagens para trabalhar com    @
@            JSON: ValorElementoJson, ListaRegraCarregarJson e Manipulação  @
@            Manual com PosicaoAlfa/LerPosicaoAlfa                          @
@                                                                           @
@ ABORDAGENS DEMONSTRADAS:                                                  @
@ 1. ValorElementoJson - Para dados simples e únicos                        @
@ 2. ListaRegraCarregarJson - Para coleções de dados                        @
@ 3. Manipulação Manual - Para casos complexos e arrays aninhados           @
@                                                                           @
@ DATA: 21/07/2025                                                          @
@ ========================================================================= @

@ === DECLARAÇÃO DE FUNÇÕES === @
Definir Funcao Principal();
Definir Funcao exemploValorElementoJson();
Definir Funcao exemploListaRegraCarregarJson();
Definir Funcao exemploManipulacaoManual();
Definir Funcao criarJSONsExemplo();

@ === EXECUÇÃO PRINCIPAL === @
Principal();

@ ===== FUNÇÃO PRINCIPAL ===== @
Funcao Principal(); {
  @ Criar JSONs de exemplo @
  criarJSONsExemplo();
  
  @ Demonstrar cada abordagem @
  Mensagem(Retorna, "=== EXEMPLOS DE MANIPULAÇÃO DE JSON EM LSP ===");
  
  exemploValorElementoJson();
  exemploListaRegraCarregarJson();
  exemploManipulacaoManual();
    
  Mensagem(Retorna, "=== TODOS OS EXEMPLOS FORAM EXECUTADOS ===");
}

@ ===== CRIAÇÃO DOS JSONS DE EXEMPLO ===== @
Funcao criarJSONsExemplo(); {
  @ JSON 1: Dados simples de usuário @
  vaJSONUsuario = "{\"usuario\": {\"id\": 123, \"nome\": \"João Silva\", \"email\": \"joao@exemplo.com\", \"ativo\": true}}";
  
  @ JSON 2: Lista de produtos @
  vaJSONProdutos = "{\"produtos\": [{\"id\": 1, \"nome\": \"Notebook\", \"preco\": 2500.00, \"categoria\": \"Eletrônicos\"}, {\"id\": 2, \"nome\": \"Mouse\", \"preco\": 45.90, \"categoria\": \"Acessórios\"}, {\"id\": 3, \"nome\": \"Teclado\", \"preco\": 89.90, \"categoria\": \"Acessórios\"}]}";
  
  @ JSON 3: Estrutura complexa com arrays aninhados @
  vaJSONComplexo = "{\"empresa\": {\"nome\": \"Tech Solutions\", \"departamentos\": [{\"nome\": \"TI\", \"funcionarios\": [{\"nome\": \"Ana\", \"cargo\": \"Desenvolvedora\", \"salario\": 5000.00}, {\"nome\": \"Carlos\", \"cargo\": \"Analista\", \"salario\": 4500.00}]}, {\"nome\": \"RH\", \"funcionarios\": [{\"nome\": \"Maria\", \"cargo\": \"Recrutadora\", \"salario\": 3800.00}]}]}}";
  
  @ JSON 4: Resposta de API de frete (para manipulação manual) @
  vaJSONFrete = "{\"frete\": {\"vltotal\": 25.50, \"prazo\": 3, \"status\": \"ok\", \"servico\": \"PAC\", \"rastreamento\": \"BR123456789BR\"}}";
}

@ ===== ABORDAGEM 1: VALORELEMENTOJSON ===== @
Funcao exemploValorElementoJson(); {
  Mensagem(Retorna, "--- ABORDAGEM 1: VALORELEMENTOJSON ---");
  Mensagem(Retorna, "Ideal para: Dados únicos, metadados, configurações");
  
  @ Variáveis para extração @
  Definir Alfa vaId;
  Definir Alfa vaNome;
  Definir Alfa vaEmail;
  Definir Alfa vaAtivo;
  Definir Alfa vaNomeEmpresa;
  
  @ === EXEMPLO 1: Dados simples de usuário === @
  Mensagem(Retorna, "Exemplo 1: Dados de usuário");
  
  ValorElementoJson(vaJSONUsuario, "usuario", "id", vaId);
  ValorElementoJson(vaJSONUsuario, "usuario", "nome", vaNome);
  ValorElementoJson(vaJSONUsuario, "usuario", "email", vaEmail);
  ValorElementoJson(vaJSONUsuario, "usuario", "ativo", vaAtivo);
  
  vaMensagem = "ID: " + vaId;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Nome: " + vaNome;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Email: " + vaEmail;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Ativo: " + vaAtivo;
  Mensagem(Retorna, vaMensagem);
  
  @ === EXEMPLO 2: Acesso a níveis aninhados === @
  Mensagem(Retorna, "Exemplo 2: Níveis aninhados");
  
  ValorElementoJson(vaJSONComplexo, "empresa", "nome", vaNomeEmpresa);
  vaMensagem = "Nome da empresa: " + vaNomeEmpresa;
  Mensagem(Retorna, vaMensagem);
  
  @ === EXEMPLO 3: Limitação com arrays === @
  Mensagem(Retorna, "Exemplo 3: Limitação com arrays");
  
  Definir Alfa vaDepartamentos;
  ValorElementoJson(vaJSONComplexo, "empresa", "departamentos", vaDepartamentos);
  vaMensagem = "Departamentos (array): " + vaDepartamentos;
  Mensagem(Retorna, vaMensagem);
  Mensagem(Retorna, "ValorElementoJson não consegue processar arrays!");
  
  Mensagem(Retorna, "--- FIM VALORELEMENTOJSON ---");
}

@ ===== ABORDAGEM 2: LISTAREGRACARREGARJSON ===== @
Funcao exemploListaRegraCarregarJson(); {
  Mensagem(Retorna, "--- ABORDAGEM 2: LISTAREGRACARREGARJSON ---");
  Mensagem(Retorna, "Ideal para: Coleções de dados, arrays de objetos");
  
  @ Variáveis para lista @
  Definir Numero vnListaProdutos;
  Definir Numero vnListaFuncionarios;
  Definir Alfa vaAchou;
  Definir Alfa vaId;
  Definir Alfa vaNome;
  Definir Alfa vaPreco;
  Definir Alfa vaCategoria;
  Definir Alfa vaCargo;
  Definir Alfa vaSalario;
  
  @ === EXEMPLO 1: Lista de produtos === @
  Mensagem(Retorna, "Exemplo 1: Lista de produtos");
  
  ListaRegraCriarLista(vnListaProdutos);
  ListaRegraCarregarJson(vnListaProdutos, vaJSONProdutos, "produtos", "id;nome;preco;categoria");
  
  @ Navegar pela lista @
  ListaRegraPrimeiro(vnListaProdutos, vaAchou);
  Enquanto (vaAchou = "S") {
    ListaRegraObterValorAlfa(vnListaProdutos, "id", vaId, vaAchou);
    ListaRegraObterValorAlfa(vnListaProdutos, "nome", vaNome, vaAchou);
    ListaRegraObterValorAlfa(vnListaProdutos, "preco", vaPreco, vaAchou);
    ListaRegraObterValorAlfa(vnListaProdutos, "categoria", vaCategoria, vaAchou);
    
    vaMensagem = "Produto " + vaId + ": " + vaNome + " - R$ " + vaPreco + " (" + vaCategoria + ")";
    Mensagem(Retorna, vaMensagem);
    
    ListaRegraProximo(vnListaProdutos, vaAchou);
  }
  
  @ === EXEMPLO 2: Funcionários do departamento TI === @
  Mensagem(Retorna, "Exemplo 2: Funcionários do departamento TI");
  
  @ Extrair apenas o departamento TI como JSON @
  Definir Alfa vaDepartamentoTI;
  Definir Alfa vaJSONDepartamentoTI;
  
  @ Criar JSON específico para o departamento TI @
  vaJSONDepartamentoTI = "{\"funcionarios\": [{\"nome\": \"Ana\", \"cargo\": \"Desenvolvedora\", \"salario\": 5000.00}, {\"nome\": \"Carlos\", \"cargo\": \"Analista\", \"salario\": 4500.00}]}";
  
  ListaRegraCriarLista(vnListaFuncionarios);
  ListaRegraCarregarJson(vnListaFuncionarios, vaJSONDepartamentoTI, "funcionarios", "nome;cargo;salario");
  
  @ Navegar pela lista de funcionários @
  ListaRegraPrimeiro(vnListaFuncionarios, vaAchou);
  Enquanto (vaAchou = "S") {
    ListaRegraObterValorAlfa(vnListaFuncionarios, "nome", vaNome, vaAchou);
    ListaRegraObterValorAlfa(vnListaFuncionarios, "cargo", vaCargo, vaAchou);
    ListaRegraObterValorAlfa(vnListaFuncionarios, "salario", vaSalario, vaAchou);
    
    vaMensagem = "Funcionário: " + vaNome + " - " + vaCargo + " - R$ " + vaSalario;
    Mensagem(Retorna, vaMensagem);
    
    ListaRegraProximo(vnListaFuncionarios, vaAchou);
  }
  
  @ === LIMITAÇÃO: Arrays aninhados === @
  Mensagem(Retorna, "Exemplo 3: Limitação com arrays aninhados");
  Mensagem(Retorna, "ListaRegraCarregarJson não consegue processar arrays aninhados!");
  Mensagem(Retorna, "Para isso, use manipulação manual com PosicaoAlfa/LerPosicaoAlfa");
  
  Mensagem(Retorna, "--- FIM LISTAREGRACARREGARJSON ---");
}

@ ===== ABORDAGEM 3: MANIPULAÇÃO MANUAL ===== @
Funcao exemploManipulacaoManual(); {
  Mensagem(Retorna, "--- ABORDAGEM 3: MANIPULAÇÃO MANUAL ---");
  Mensagem(Retorna, "Ideal para: Casos complexos, arrays aninhados, controle total");
  
  @ Variáveis para extração manual @
  Definir Alfa vaValorFrete;
  Definir Alfa vaPrazo;
  Definir Alfa vaStatus;
  Definir Alfa vaServico;
  Definir Alfa vaRastreamento;
  Definir Numero vnPosicao;
  Definir Numero vnTamanhoJSON;
  Definir Numero vnInicio;
  Definir Numero vnFim;
  Definir Numero vnCodigoCaractere;
  Definir Numero vnCodigoVirgula; vnCodigoVirgula = 44; @ Código ASCII da vírgula @
  Definir Numero vnCodigoChaveFecha; vnCodigoChaveFecha = 125; @ Código ASCII de } @
  Definir Numero vnCodigoEspaco; vnCodigoEspaco = 32; @ Código ASCII do espaço @
  
  @ === EXEMPLO 1: Extrair valor do frete === @
  Mensagem(Retorna, "Exemplo 1: Extrair valor do frete");
  
  TamanhoAlfa(vaJSONFrete, vnTamanhoJSON);
  
  @ Buscar "vltotal" @
  PosicaoAlfa("\"vltotal\":", vaJSONFrete, vnPosicao);
  Se (vnPosicao > 0) {
    @ Posicionar após "vltotal": @
    vnPosicao = vnPosicao + 10; @ Tamanho de "vltotal": @
    
    @ Pular espaços @
    Enquanto (vnPosicao < vnTamanhoJSON) {
      LerPosicaoAlfa(vaJSONFrete, vnCodigoCaractere, vnPosicao);
      Se (vnCodigoCaractere = vnCodigoEspaco) {
        vnPosicao++;
      } Senao {
        Pare;
      }
    }
    
    @ Extrair valor até vírgula ou chave @
    vnInicio = vnPosicao;
    vnFim = vnInicio;
    
    Enquanto (vnFim < vnTamanhoJSON) {
      LerPosicaoAlfa(vaJSONFrete, vnCodigoCaractere, vnFim);
      Se ((vnCodigoCaractere <> vnCodigoVirgula) e (vnCodigoCaractere <> vnCodigoChaveFecha)) {
        vnFim++;
      } Senao {
        Pare;
      }
    }
    
    @ Extrair o valor @
    Se (vnFim > vnInicio) {
      vaValorFrete = vaJSONFrete; @ Fazer cópia primeiro @
      CopiarAlfa(vaValorFrete, vnInicio, vnFim - vnInicio);
      SubstAlfa(" ", "", vaValorFrete); @ Remover espaços @
      vaMensagem = "Valor do frete: R$ " + vaValorFrete;
      Mensagem(Retorna, vaMensagem);
    }
  }
  
  @ === EXEMPLO 2: Extrair prazo === @
  Mensagem(Retorna, "Exemplo 2: Extrair prazo");
  
  PosicaoAlfa("\"prazo\":", vaJSONFrete, vnPosicao);
  Se (vnPosicao > 0) {
    @ Posicionar após "prazo": @
    vnPosicao = vnPosicao + 8; @ Tamanho de "prazo": @
    
    @ Pular espaços @
    Enquanto (vnPosicao < vnTamanhoJSON) {
      LerPosicaoAlfa(vaJSONFrete, vnCodigoCaractere, vnPosicao);
      Se (vnCodigoCaractere = vnCodigoEspaco) {
        vnPosicao++;
      } Senao {
        Pare;
      }
    }
    
    @ Extrair prazo até vírgula ou chave @
    vnInicio = vnPosicao;
    vnFim = vnInicio;
    
    Enquanto (vnFim < vnTamanhoJSON) {
      LerPosicaoAlfa(vaJSONFrete, vnCodigoCaractere, vnFim);
      Se ((vnCodigoCaractere <> vnCodigoVirgula) e (vnCodigoCaractere <> vnCodigoChaveFecha)) {
        vnFim++;
      } Senao {
        Pare;
      }
    }
    
    @ Extrair o prazo @
    Se (vnFim > vnInicio) {
      vaPrazo = vaJSONFrete; @ Fazer cópia primeiro @
      CopiarAlfa(vaPrazo, vnInicio, vnFim - vnInicio);
      SubstAlfa(" ", "", vaPrazo); @ Remover espaços @
      vaMensagem = "Prazo de entrega: " + vaPrazo + " dias";
      Mensagem(Retorna, vaMensagem);
    }
  }
  
  @ === EXEMPLO 3: Extrair status === @
  Mensagem(Retorna, "Exemplo 3: Extrair status");
  
  PosicaoAlfa("\"status\":", vaJSONFrete, vnPosicao);
  Se (vnPosicao > 0) {
    @ Posicionar após "status": @
    vnPosicao = vnPosicao + 9; @ Tamanho de "status": @
    
    @ Pular espaços @
    Enquanto (vnPosicao < vnTamanhoJSON) {
      LerPosicaoAlfa(vaJSONFrete, vnCodigoCaractere, vnPosicao);
      Se (vnCodigoCaractere = vnCodigoEspaco) {
        vnPosicao++;
      } Senao {
        Pare;
      }
    }
    
    @ Extrair status até vírgula ou chave @
    vnInicio = vnPosicao;
    vnFim = vnInicio;
    
    Enquanto (vnFim < vnTamanhoJSON) {
      LerPosicaoAlfa(vaJSONFrete, vnCodigoCaractere, vnFim);
      Se ((vnCodigoCaractere <> vnCodigoVirgula) e (vnCodigoCaractere <> vnCodigoChaveFecha)) {
        vnFim++;
      } Senao {
        Pare;
      }
    }
    
    @ Extrair o status @
    Se (vnFim > vnInicio) {
      vaStatus = vaJSONFrete; @ Fazer cópia primeiro @
      CopiarAlfa(vaStatus, vnInicio, vnFim - vnInicio);
      SubstAlfa(" ", "", vaStatus); @ Remover espaços @
      vaMensagem = "Status: " + vaStatus;
      Mensagem(Retorna, vaMensagem);
    }
  }
  
  @ === EXEMPLO 4: Extrair serviço === @
  Mensagem(Retorna, "Exemplo 4: Extrair serviço");
  
  PosicaoAlfa("\"servico\":", vaJSONFrete, vnPosicao);
  Se (vnPosicao > 0) {
    @ Posicionar após "servico": @
    vnPosicao = vnPosicao + 10; @ Tamanho de "servico": @
    
    @ Pular espaços @
    Enquanto (vnPosicao < vnTamanhoJSON) {
      LerPosicaoAlfa(vaJSONFrete, vnCodigoCaractere, vnPosicao);
      Se (vnCodigoCaractere = vnCodigoEspaco) {
        vnPosicao++;
      } Senao {
        Pare;
      }
    }
    
    @ Extrair serviço até vírgula ou chave @
    vnInicio = vnPosicao;
    vnFim = vnInicio;
    
    Enquanto (vnFim < vnTamanhoJSON) {
      LerPosicaoAlfa(vaJSONFrete, vnCodigoCaractere, vnFim);
      Se ((vnCodigoCaractere <> vnCodigoVirgula) e (vnCodigoCaractere <> vnCodigoChaveFecha)) {
        vnFim++;
      } Senao {
        Pare;
      }
    }
    
    @ Extrair o serviço @
    Se (vnFim > vnInicio) {
      vaServico = vaJSONFrete; @ Fazer cópia primeiro @
      CopiarAlfa(vaServico, vnInicio, vnFim - vnInicio);
      SubstAlfa(" ", "", vaServico); @ Remover espaços @
      vaMensagem = "Serviço: " + vaServico;
      Mensagem(Retorna, vaMensagem);
    }
  }
  
  @ === RESUMO DOS DADOS EXTRAÍDOS === @
  Mensagem(Retorna, "=== RESUMO DOS DADOS EXTRAÍDOS MANUALMENTE ===");
  vaMensagem = "Valor: R$ " + vaValorFrete;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Prazo: " + vaPrazo + " dias";
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Status: " + vaStatus;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Serviço: " + vaServico;
  Mensagem(Retorna, vaMensagem);
  
  Mensagem(Retorna, "--- FIM MANIPULAÇÃO MANUAL ---");
}


