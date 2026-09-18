@ Função completa para buscar informações de CEP usando a API gratuita do ViaCEP. @

Funcao buscarCepApi(Numero vnCepApi); {
    Definir Alfa vaCepApi;
    Definir Alfa vaHTTP;
    Definir Alfa vaURL;
    Definir Alfa vaJSON;
    Definir Alfa vaCodRes;
    Definir Alfa vaMsgUsu;
    Definir Numero vnCodRes;
  
    @ Tratamento de Variáveis @
    vaURL = "https://viacep.com.br/ws/__NUMCEP__/json/"; @ URL do ViaCEP @
    vaJSON = ""; @ Objeto de Retorno da Requisição @
    vnCodRes = 0; @ Cód. HTTP Response @
  
    ConverteMascara(1, vnCepApi, vaCepApi, "99999999");
    TrocaString(vaURL, "__NUMCEP__", vaCepApi);
  
    @ Cria Objeto HTTP @
    HttpObjeto(vaHTTP);
  
    @ Desabilita Erro Padrão, evita que mensagens de erros HTTP 4XX/5XX gerem Exceptions em tela ao usuário @
    HttpDesabilitaErroResposta(vaHTTP);
  
    @ Altera os Cabeçalhos da Requisição @
    HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept", "application/json;charset=utf-8");
    HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept-Encoding", "gzip, deflate, br");
    HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept-Charset", "utf-8");
    HttpAlteraCabecalhoRequisicao(vaHTTP, "Cache-Control", "no-cache");
    HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json;charset=utf-8");
    HttpAlteraCodifCaracPadrao(vaHTTP, "utf-8");
  
    @ Efetua a Requisição @
    HttpGet(vaHTTP, vaURL, vaJSON);
  
    @ Verifica Cód. HTTP Response @
    HttpLeCodigoResposta(vaHTTP, vnCodRes);
  
    @ Se a resposta foi "OK", extrai os dados do JSON @
    Se ((vnCodRes >= 200) e (vnCodRes <= 204)) {
      @ Logradouro @
      ValorElementoJson(vaJSON, "", "logradouro", vaLogradouro);
  
      @ Complemento @
      ValorElementoJson(vaJSON, "", "complemento", vaComplemento);
  
      @ Bairro @
      ValorElementoJson(vaJSON, "", "bairro", vaBairro);
  
      @ Cidade @
      ValorElementoJson(vaJSON, "", "localidade", vaCidadeCep);
  
      @ Estado @
      ValorElementoJson(vaJSON, "", "uf", vaEstadoCep);
  
      @ IBGE @
      ValorElementoJson(vaJSON, "", "ibge", vaIbge);
    }
  
    @ Tratamento de Erro @
    Se ((vnCodRes < 200) ou (vnCodRes >= 300)) {
      @ Tratamento de Variáveis @
      IntParaAlfa(vnCodRes, vaCodRes);
  
      @ Mensagem @
      vaMsgUsu = "HTTP [" + vaCodRes + "]: Verifique os parâmetros da requisição";
      Mensagem(Retorna, vaMsgUsu);
    }
  }
