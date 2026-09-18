/*
 * EXEMPLOS HTTPBin API - Teste de Headers e Dados
 * HTTPBin retorna informações detalhadas sobre a requisição
 * Ideal para testar headers, autenticação e debugging
 * API: https://httpbin.org
 */

@ Variáveis globais @
Definir Alfa vaUserAgent;
Definir Alfa vaNomeCompleto;
Definir Alfa vaEmail;

@ Execução dos exemplos @
Mensagem(Retorna, "=== EXEMPLOS HTTPBIN API ===");

vaUserAgent = "LSP-Cliente/1.0";
testarHeadersHttpBin();

vaNomeCompleto = "João da Silva";
vaEmail = "joao@exemplo.com";
testarPostDataHttpBin();

testarStatusCodesHttpBin();

Mensagem(Retorna, "=== FIM DOS EXEMPLOS ===");

@ ---FUNÇÕES----@

@ Testar envio e recebimento de headers @
Funcao testarHeadersHttpBin(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaJSON;
  Definir Alfa vaUserAgentRecebido;
  Definir Alfa vaHost;
  Definir Alfa vaMensagem;
  Definir Numero vnCodRes;

  @ Configura HTTP com header dinâmico @
  HttpObjeto(vaHTTP);
  HttpDesabilitaErroResposta(vaHTTP);
  HttpAlteraCabecalhoRequisicao(vaHTTP, "User-Agent", vaUserAgent);
  HttpAlteraCabecalhoRequisicao(vaHTTP, "X-Custom-Header", "Teste-LSP");
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept", "application/json");

  @ Testa endpoint que retorna headers enviados @
  HttpGet(vaHTTP, "https://httpbin.org/headers", vaJSON);
  HttpLeCodigoResposta(vaHTTP, vnCodRes);

  Se (vnCodRes = 200) {
    ValorElementoJson(vaJSON, "headers", "User-Agent", vaUserAgentRecebido);
    ValorElementoJson(vaJSON, "headers", "Host", vaHost);
    vaMensagem = "✅ User-Agent enviado: " + vaUserAgent + " / Recebido: " + vaUserAgentRecebido;
    Mensagem(Retorna, vaMensagem);
    vaMensagem = "Host: " + vaHost;
    Mensagem(Retorna, vaMensagem);
  } Senao {
    Mensagem(Erro, "❌ Erro ao testar headers");
  }
};

@ Testar envio de dados via POST @
Funcao testarPostDataHttpBin(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaJSON;
  Definir Alfa vaBody;
  Definir Alfa vaDadosRecebidos;
  Definir Alfa vaMensagem;
  Definir Numero vnCodRes;

  @ Monta dados JSON usando variáveis globais @
  vaBody = "{\"nome\": \"" + vaNomeCompleto + "\", \"email\": \"" + vaEmail + "\"}";

  @ Configura HTTP @
  HttpObjeto(vaHTTP);
  HttpDesabilitaErroResposta(vaHTTP);
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json");

  @ Envia dados via POST - HTTPBin retorna exatamente o que recebeu @
  HttpPost(vaHTTP, "https://httpbin.org/post", vaBody, vaJSON);
  HttpLeCodigoResposta(vaHTTP, vnCodRes);

  Se (vnCodRes = 200) {
    ValorElementoJson(vaJSON, "json", "nome", vaDadosRecebidos);
    vaMensagem = "✅ POST realizado - Nome enviado: " + vaNomeCompleto + " / Recebido: " + vaDadosRecebidos;
    Mensagem(Retorna, vaMensagem);
    
    @ Verifica email recebido @
    ValorElementoJson(vaJSON, "json", "email", vaDadosRecebidos);
    vaMensagem = "Email recebido: " + vaDadosRecebidos;
    Mensagem(Retorna, vaMensagem);
  } Senao {
    Mensagem(Erro, "❌ Erro ao enviar dados via POST");
  }
};

@ Testar diferentes status codes @
Funcao testarStatusCodesHttpBin(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaJSON;
  Definir Alfa vaMensagem;
  Definir Alfa vaStatus;
  Definir Numero vnCodRes;

  HttpObjeto(vaHTTP);
  HttpDesabilitaErroResposta(vaHTTP);

  @ Testa status 200 (OK) @
  HttpGet(vaHTTP, "https://httpbin.org/status/200", vaJSON);
  HttpLeCodigoResposta(vaHTTP, vnCodRes);
  IntParaAlfa(vnCodRes, vaStatus);
  vaMensagem = "✅ Status 200 testado - Recebido: " + vaStatus;
  Mensagem(Retorna, vaMensagem);

  @ Testa status 404 (Not Found) @
  HttpGet(vaHTTP, "https://httpbin.org/status/404", vaJSON);
  HttpLeCodigoResposta(vaHTTP, vnCodRes);
  IntParaAlfa(vnCodRes, vaStatus);
  vaMensagem = "⚠️ Status 404 testado - Recebido: " + vaStatus;
  Mensagem(Retorna, vaMensagem);

  @ Testa delay de 2 segundos @
  HttpGet(vaHTTP, "https://httpbin.org/delay/2", vaJSON);
  HttpLeCodigoResposta(vaHTTP, vnCodRes);
  IntParaAlfa(vnCodRes, vaStatus);
  vaMensagem = "✅ Delay testado - Status: " + vaStatus;
  Mensagem(Retorna, vaMensagem);
}; 
