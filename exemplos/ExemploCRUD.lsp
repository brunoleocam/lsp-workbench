/*
 * EXEMPLOS CRUD COMPLETO - ReqRes API
 * Demonstra todas as operações: GET, POST, PUT, PATCH, DELETE
 * API: https://reqres.in
 */

@ Variáveis globais @
Definir Alfa vaNomeUsuario;
Definir Alfa vaCargoUsuario;
Definir Numero vnIdUsuario;

@ Execução dos exemplos @
Mensagem(Retorna, "=== CRUD COMPLETO - REQRES API ===");

exemploGetUsuario();

vaNomeUsuario = "João Silva";
vaCargoUsuario = "Desenvolvedor";
exemploPostUsuario();

vnIdUsuario = 2;
vaNomeUsuario = "João Santos";
vaCargoUsuario = "Analista Senior";
exemploPutUsuario();

vnIdUsuario = 2;
vaCargoUsuario = "Tech Lead";
exemploPatchUsuario();

vnIdUsuario = 2;
exemploDeleteUsuario();

Mensagem(Retorna, "=== FIM DOS EXEMPLOS ===");

@ ---FUNÇÕES----@

@ GET - Buscar usuário específico @
Funcao exemploGetUsuario(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaJSON;
  Definir Alfa vaNome;
  Definir Alfa vaSobrenome;
  Definir Alfa vaEmail;
  Definir Alfa vaMensagem;
  Definir Numero vnCodRes;

  HttpObjeto(vaHTTP);
  HttpDesabilitaErroResposta(vaHTTP);

  @ Busca usuário ID 2 @
  HttpGet(vaHTTP, "https://reqres.in/api/users/2", vaJSON);
  HttpLeCodigoResposta(vaHTTP, vnCodRes);

  Se (vnCodRes = 200) {
    ValorElementoJson(vaJSON, "data", "first_name", vaNome);
    ValorElementoJson(vaJSON, "data", "last_name", vaSobrenome);
    ValorElementoJson(vaJSON, "data", "email", vaEmail);
    vaMensagem = "GET - Usuario: " + vaNome + " " + vaSobrenome + " (" + vaEmail + ")";
    Mensagem(Retorna, vaMensagem);
  } Senao {
    Mensagem(Erro, "Erro no GET");
  }
};

@ POST - Criar novo usuário @
Funcao exemploPostUsuario(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaJSON;
  Definir Alfa vaBody;
  Definir Alfa vaNovoId;
  Definir Alfa vaMensagem;
  Definir Numero vnCodRes;

  @ Monta dados usando variáveis globais @
  vaBody = "{\"name\": \"" + vaNomeUsuario + "\", \"job\": \"" + vaCargoUsuario + "\"}";

  HttpObjeto(vaHTTP);
  HttpDesabilitaErroResposta(vaHTTP);
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json");

  @ Cria usuário @
  HttpPost(vaHTTP, "https://reqres.in/api/users", vaBody, vaJSON);
  HttpLeCodigoResposta(vaHTTP, vnCodRes);

  Se (vnCodRes = 201) {
    ValorElementoJson(vaJSON, "", "id", vaNovoId);
    vaMensagem = "POST - Usuario " + vaNomeUsuario + " criado com ID: " + vaNovoId;
    Mensagem(Retorna, vaMensagem);
  } Senao {
    Mensagem(Erro, "Erro no POST");
  }
};

@ PUT - Atualizar usuário completamente @
Funcao exemploPutUsuario(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaJSON;
  Definir Alfa vaBody;
  Definir Alfa vaURL;
  Definir Alfa vaIdStr;
  Definir Alfa vaDataAtualizacao;
  Definir Alfa vaMensagem;
  Definir Numero vnCodRes;

  @ Monta URL com ID dinâmico @
  IntParaAlfa(vnIdUsuario, vaIdStr);
  vaURL = "https://reqres.in/api/users/" + vaIdStr;

  @ Dados completos usando variáveis globais @
  vaBody = "{\"name\": \"" + vaNomeUsuario + "\", \"job\": \"" + vaCargoUsuario + "\"}";

  HttpObjeto(vaHTTP);
  HttpDesabilitaErroResposta(vaHTTP);
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json");

  @ Atualiza usuário @
  HttpPut(vaHTTP, vaURL, vaBody, vaJSON);
  HttpLeCodigoResposta(vaHTTP, vnCodRes);

  Se (vnCodRes = 200) {
    ValorElementoJson(vaJSON, "", "updatedAt", vaDataAtualizacao);
    vaMensagem = "PUT - Usuario " + vaNomeUsuario + " (ID " + vaIdStr + ") atualizado";
    Mensagem(Retorna, vaMensagem);
  } Senao {
    Mensagem(Erro, "Erro no PUT");
  }
};

@ PATCH - Atualizar parcialmente @
Funcao exemploPatchUsuario(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaJSON;
  Definir Alfa vaBody;
  Definir Alfa vaURL;
  Definir Alfa vaIdStr;
  Definir Alfa vaDataAtualizacao;
  Definir Alfa vaMensagem;
  Definir Numero vnCodRes;

  @ Monta URL com ID dinâmico @
  IntParaAlfa(vnIdUsuario, vaIdStr);
  vaURL = "https://reqres.in/api/users/" + vaIdStr;

  @ Atualiza apenas o cargo usando variável global @
  vaBody = "{\"job\": \"" + vaCargoUsuario + "\"}";

  HttpObjeto(vaHTTP);
  HttpDesabilitaErroResposta(vaHTTP);
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json");

  @ Atualiza parcialmente @
  HttpPatch(vaHTTP, vaURL, vaBody, vaJSON);
  HttpLeCodigoResposta(vaHTTP, vnCodRes);

  Se (vnCodRes = 200) {
    ValorElementoJson(vaJSON, "", "updatedAt", vaDataAtualizacao);
    vaMensagem = "PATCH - Cargo atualizado para: " + vaCargoUsuario;
    Mensagem(Retorna, vaMensagem);
  } Senao {
    Mensagem(Erro, "Erro no PATCH");
  }
};

@ DELETE - Excluir usuário @
Funcao exemploDeleteUsuario(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaJSON;
  Definir Alfa vaURL;
  Definir Alfa vaIdStr;
  Definir Alfa vaMensagem;
  Definir Numero vnCodRes;

  @ Monta URL com ID dinâmico @
  IntParaAlfa(vnIdUsuario, vaIdStr);
  vaURL = "https://reqres.in/api/users/" + vaIdStr;

  HttpObjeto(vaHTTP);
  HttpDesabilitaErroResposta(vaHTTP);

  @ Exclui usuário @
  HttpDelete(vaHTTP, vaURL, vaJSON);
  HttpLeCodigoResposta(vaHTTP, vnCodRes);

  Se (vnCodRes = 204) {
    vaMensagem = "DELETE - Usuario ID " + vaIdStr + " excluido com sucesso!";
    Mensagem(Retorna, vaMensagem);
  } Senao {
    IntParaAlfa(vnCodRes, vaMensagem);
    vaMensagem = "DELETE - Status: " + vaMensagem;
    Mensagem(Retorna, vaMensagem);
  }
}; 
