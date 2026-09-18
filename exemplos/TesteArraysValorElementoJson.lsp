@ TesteArraysValorElementoJson.lsp @
@ Teste para demonstrar como ValorElementoJson funciona com arrays @

@ Variáveis @
Definir Alfa vaJSONArray1;
Definir Alfa vaJSONArray2;
Definir Alfa vaResultado;
Definir Alfa vaMensagem;

Definir Funcao Principal();
Definir Funcao criarJSONs();
Definir Funcao testarArrays();

@ Executar função principal @
Principal(); 

@ Função principal @
Funcao Principal(); {
  @ Criar JSONs de teste @
  criarJSONs();
   
  @ Executar testes @
  testarArrays();
        
  vaMensagem = "Testes concluídos!";
  Mensagem(Retorna, vaMensagem);
}

@ Criar JSONs de teste @
Funcao criarJSONs();{
  @ JSON com array de 1 elemento (funciona) @
  vaJSONArray1 = "{                                                                    \
                    \"data\": [                                                      \
                        {                                                            \
                            \"id_boleto\": \"a82592a9-29cd-4ebd-a39d-e289622e1656\", \
                            \"nome\": \"Boleto Único\"                                \
                        }                                                            \
                    ]                                                               \ 
                  }";

  @ JSON com array de 2 elementos (não funciona) @
  vaJSONArray2 = "{                                                                    \
                    \"data\": [                                                      \
                        {                                                            \
                            \"id_boleto\": \"a82592a9-29cd-4ebd-a39d-e289622e1656\", \
                            \"nome\": \"Boleto 1\"                                   \
                        },                                                           \
                        {                                                            \
                            \"id_boleto\": \"b93603b0-30de-5fce-b40e-f390733f2757\", \
                            \"nome\": \"Boleto 2\"                                   \
                        }                                                            \
                    ]                                                               \ 
                  }";
}

@ Função para testar arrays @
Funcao testarArrays(); {
  vaMensagem = "=== TESTE: ARRAY COM 1 ELEMENTO ===";
  Mensagem(Retorna, vaMensagem);
  
  @ Teste 1: Array com 1 elemento @
  ValorElementoJson(vaJSONArray1,"data","id_boleto",vaResultado);
  vaMensagem = "Array[1] - id_boleto: " + vaResultado;
  Mensagem(Retorna, vaMensagem);
  
  ValorElementoJson(vaJSONArray1,"data","nome",vaResultado);
  vaMensagem = "Array[1] - nome: " + vaResultado;
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "=== TESTE: ARRAY COM 2 ELEMENTOS ===";
  Mensagem(Retorna, vaMensagem);
  
  @ Teste 2: Array com 2 elementos @
  ValorElementoJson(vaJSONArray2,"data","id_boleto",vaResultado);
  vaMensagem = "Array[2] - id_boleto: " + vaResultado;
  Mensagem(Retorna, vaMensagem);
  
  ValorElementoJson(vaJSONArray2,"data","nome",vaResultado);
  vaMensagem = "Array[2] - nome: " + vaResultado;
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "=== CONCLUSÃO ===";
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "ValorElementoJson funciona com arrays de 1 elemento";
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "ValorElementoJson NÃO funciona com arrays de múltiplos elementos";
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Para arrays múltiplos, use ListaRegra*";
  Mensagem(Retorna, vaMensagem);
} 