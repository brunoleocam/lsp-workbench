@ Função para obter informações de municípios usando a API do IBGE. @

Funcao buscarCidadeApi(Numero vnCidApi); {
    Definir Alfa vaCidApi;
    Definir Alfa vaHTTP;
    Definir Alfa vaURL;
    Definir Alfa vaJSON;
    Definir Alfa vaCodRes;
    Definir Alfa vaMsgUsu;
    Definir Numero vnCodRes;
  
    @ Tratamento de Variáveis @
    vaURL = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios/__NUMCID__?view=nivelado"; @ URL do IBGE @
    vaJSON = ""; @ Objeto de Retorno da Requisição @
    vnCodRes = 0; @ Cód. HTTP Response @
  
    ConverteMascara(1, vnCidApi, vaCidApi, "9999999");
    TrocaString(vaURL, "__NUMCID__", vaCidApi);
  
    @ Cria Objeto HTTP @
    HttpObjeto(vaHTTP);
  
    @ Desabilita Erro Padrão, evita que mensagens de erros HTTP 4XX/5XX gerem Exceptions em tela ao usuário @
    HttpDesabilitaErroResposta(vaHTTP);
  
    @ Altera os Cabeçalhos da Requisição @
    HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept", "application/json;charset=utf-8");
    @ HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept-Encoding", "gzip, deflate, br"); @
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
      @ Cidade @
      ValorElementoJson(vaJSON, "", "municipio-nome", vaCidadeRai);
  
      @ Estado @
      ValorElementoJson(vaJSON, "", "UF-sigla", vaEstadoRai);
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
