@ TesteProfundidadeArrays.lsp @
@ Teste para verificar a profundidade máxima de arrays aninhados @

@ Variáveis @
Definir Alfa vaJSONProfundo;
Definir Alfa vaResultado;
Definir Alfa vaMensagem;

Definir Funcao Principal();
Definir Funcao criarJSONProfundo();
Definir Funcao testarProfundidade();

@ Executar função principal @
Principal(); 

@ Função principal @
Funcao Principal(); {
  @ Criar JSON com múltiplos níveis de arrays @
  criarJSONProfundo();
   
  @ Executar testes de profundidade @
  testarProfundidade();
        
  vaMensagem = "Testes de profundidade concluídos!";
  Mensagem(Retorna, vaMensagem);
}

@ Criar JSON com múltiplos níveis de arrays @
Funcao criarJSONProfundo();{
  @ JSON com 4 níveis de arrays aninhados @
  vaJSONProfundo = "{                                                                    \
                     \"nivel1\": [                                                      \
                         {                                                            \
                             \"id\": \"nivel1-001\",                                   \
                             \"nivel2\": [                                             \
                                 {                                                    \
                                     \"id\": \"nivel2-001\",                           \
                                     \"nivel3\": [                                     \
                                         {                                            \
                                             \"id\": \"nivel3-001\",                   \
                                             \"nivel4\": [                             \
                                                 {                                    \
                                                     \"id\": \"nivel4-001\",           \
                                                     \"valor\": \"Chegou ao nível 4!\" \
                                                 }                                    \
                                             ]                                        \
                                         }                                            \
                                     ]                                                \
                                 }                                                    \
                             ]                                                        \
                         }                                                            \
                     ]                                                               \ 
                   }";
}

@ Função para testar profundidade @
Funcao testarProfundidade(); {
  vaMensagem = "=== TESTE DE PROFUNDIDADE DE ARRAYS ===";
  Mensagem(Retorna, vaMensagem);
  
  @ Teste Nível 1 @
  ValorElementoJson(vaJSONProfundo,"nivel1","id",vaResultado);
  vaMensagem = "Nível 1 - id: " + vaResultado;
  Mensagem(Retorna, vaMensagem);
  
  @ Teste Nível 2 @
  ValorElementoJson(vaJSONProfundo,"nivel1;nivel2","id",vaResultado);
  vaMensagem = "Nível 2 - id: " + vaResultado;
  Mensagem(Retorna, vaMensagem);
  
  @ Teste Nível 3 @
  ValorElementoJson(vaJSONProfundo,"nivel1;nivel2;nivel3","id",vaResultado);
  vaMensagem = "Nível 3 - id: " + vaResultado;
  Mensagem(Retorna, vaMensagem);
  
  @ Teste Nível 4 @
  ValorElementoJson(vaJSONProfundo,"nivel1;nivel2;nivel3;nivel4","id",vaResultado);
  vaMensagem = "Nível 4 - id: " + vaResultado;
  Mensagem(Retorna, vaMensagem);
  
  @ Teste Nível 4 - valor @
  ValorElementoJson(vaJSONProfundo,"nivel1;nivel2;nivel3;nivel4","valor",vaResultado);
  vaMensagem = "Nível 4 - valor: " + vaResultado;
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "=== ANÁLISE DOS RESULTADOS ===";
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Se todos os níveis funcionaram: Arrays aninhados são suportados";
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Se algum nível falhou: Há limitação na profundidade";
  Mensagem(Retorna, vaMensagem);
} 