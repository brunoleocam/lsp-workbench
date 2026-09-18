/*
 * EXEMPLOS JSONPlaceholder API - Posts e Comments
 * A JSONPlaceholder API simula operações CRUD
 * Observação: Apenas GET funciona realmente, os outros métodos simulam
 * API: https://jsonplaceholder.typicode.com
 */

@ Variáveis globais @
Definir Alfa vaTituloPost;
Definir Alfa vaConteudoPost;
Definir Numero vnUserIdPost;

@ Execução dos exemplos @
Mensagem(Retorna, "=== EXEMPLOS JSONPlaceholder API ===");

buscarPostJsonPlaceholder();

vaTituloPost = "Meu novo post";
vaConteudoPost = "Este é o conteúdo do meu post de exemplo";
vnUserIdPost = 1;
criarPostJsonPlaceholder();

Mensagem(Retorna, "=== FIM DOS EXEMPLOS ===");

@ ---FUNÇÕES----@

@ Buscar post específico @
Funcao buscarPostJsonPlaceholder(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaJSON;
  Definir Alfa vaTitulo;
  Definir Alfa vaConteudo;
  Definir Alfa vaMensagem;
  Definir Numero vnCodRes;

  @ Configura HTTP @
  HttpObjeto(vaHTTP);
  HttpDesabilitaErroResposta(vaHTTP);
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept", "application/json");

  @ Busca post ID 1 @
  HttpGet(vaHTTP, "https://jsonplaceholder.typicode.com/posts/1", vaJSON);
  HttpLeCodigoResposta(vaHTTP, vnCodRes);

  Se (vnCodRes = 200) {
    ValorElementoJson(vaJSON, "", "title", vaTitulo);
    ValorElementoJson(vaJSON, "", "body", vaConteudo);
    vaMensagem = "✅ Post encontrado: " + vaTitulo;
    Mensagem(Retorna, vaMensagem);
  } Senao {
    Mensagem(Erro, "❌ Erro ao buscar post");
  }
};

@ Criar novo post usando variáveis globais @
Funcao criarPostJsonPlaceholder(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaJSON;
  Definir Alfa vaBody;
  Definir Alfa vaUserIdStr;
  Definir Alfa vaNovoId;
  Definir Alfa vaMensagem;
  Definir Numero vnCodRes;

  @ Converte userId para string @
  IntParaAlfa(vnUserIdPost, vaUserIdStr);

  @ Monta JSON usando variáveis globais @
  vaBody = "{\"title\": \"" + vaTituloPost + "\", \"body\": \"" + vaConteudoPost + "\", \"userId\": " + vaUserIdStr + "}";

  @ Configura HTTP @
  HttpObjeto(vaHTTP);
  HttpDesabilitaErroResposta(vaHTTP);
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json");

  @ Executa POST @
  HttpPost(vaHTTP, "https://jsonplaceholder.typicode.com/posts", vaBody, vaJSON);
  HttpLeCodigoResposta(vaHTTP, vnCodRes);

  Se (vnCodRes = 201) {
    ValorElementoJson(vaJSON, "", "id", vaNovoId);
    vaMensagem = "✅ Post \"" + vaTituloPost + "\" criado com ID: " + vaNovoId;
    Mensagem(Retorna, vaMensagem);
  } Senao {
    Mensagem(Erro, "❌ Erro ao criar post");
  }
}; 
