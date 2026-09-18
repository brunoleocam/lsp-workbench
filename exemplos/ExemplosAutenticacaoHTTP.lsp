/*
 * EXEMPLOS DE AUTENTICACAO HTTP
 * Demonstra Basic Auth e Bearer Token
 * API: https://httpbin.org
 */

@ Variáveis globais @
Definir Alfa vaUsuarioAuth;
Definir Alfa vaSenhaAuth;
Definir Alfa vaTokenBearer;

@ Execução dos exemplos @
Mensagem(Retorna, "=== EXEMPLOS DE AUTENTICACAO ===");

vaUsuarioAuth = "bruno";
vaSenhaAuth = "1234";
exemploBasicAuth();

vaTokenBearer = "meu-token-secreto";
exemploBearerToken();

Mensagem(Retorna, "=== FIM DOS EXEMPLOS ===");

@ ---FUNÇÕES----@

@ Basic Auth usando variáveis globais @
Funcao exemploBasicAuth(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaJSON;
  Definir Alfa vaURL;
  Definir Alfa vaCredencial;
  Definir Alfa vaAuth;
  Definir Alfa vaUsuario;
  Definir Alfa vaMensagem;
  Definir Numero vnCodRes;

  HttpObjeto(vaHTTP);
  HttpDesabilitaErroResposta(vaHTTP);

  @ Monta URL com credenciais dinâmicas @
  vaURL = "https://httpbin.org/basic-auth/" + vaUsuarioAuth + "/" + vaSenhaAuth;

  @ Gera header Authorization (usuario:senha em Base64) @
  vaCredencial = vaUsuarioAuth + ":" + vaSenhaAuth;
  Base64Encode(vaCredencial, vaAuth);
  vaAuth = "Basic " + vaAuth;
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Authorization", vaAuth);

  @ Testa autenticação @
  HttpGet(vaHTTP, vaURL, vaJSON);
  HttpLeCodigoResposta(vaHTTP, vnCodRes);

  Se (vnCodRes = 200) {
    ValorElementoJson(vaJSON, "", "user", vaUsuario);
    vaMensagem = "Basic Auth OK - Usuario: " + vaUsuario;
    Mensagem(Retorna, vaMensagem);
  } Senao {
    IntParaAlfa(vnCodRes, vaMensagem);
    vaMensagem = "Basic Auth falhou - Status: " + vaMensagem;
    Mensagem(Retorna, vaMensagem);
  }
};

@ Bearer Token usando variável global @
Funcao exemploBearerToken(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaJSON;
  Definir Alfa vaAuth;
  Definir Alfa vaToken;
  Definir Alfa vaMensagem;
  Definir Numero vnCodRes;

  HttpObjeto(vaHTTP);
  HttpDesabilitaErroResposta(vaHTTP);

  @ Monta header Authorization com token dinâmico @
  vaAuth = "Bearer " + vaTokenBearer;
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Authorization", vaAuth);

  @ Testa Bearer Token @
  HttpGet(vaHTTP, "https://httpbin.org/bearer", vaJSON);
  HttpLeCodigoResposta(vaHTTP, vnCodRes);

  Se (vnCodRes = 200) {
    ValorElementoJson(vaJSON, "", "token", vaToken);
    vaMensagem = "Bearer Token OK - Token: " + vaToken;
    Mensagem(Retorna, vaMensagem);
  } Senao {
    IntParaAlfa(vnCodRes, vaMensagem);
    vaMensagem = "Bearer Token falhou - Status: " + vaMensagem;
    Mensagem(Retorna, vaMensagem);
  }
}; 
