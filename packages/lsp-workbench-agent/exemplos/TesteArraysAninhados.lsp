@ TesteArraysAninhados.lsp @
@ Teste para verificar se ValorElementoJson consegue acessar arrays aninhados @

@ Variáveis @
Definir Alfa vaJSONArrayAninhado;
Definir Alfa vaResultado;
Definir Alfa vaMensagem;

Definir Funcao Principal();
Definir Funcao criarJSONAninhado();
Definir Funcao testarArraysAninhados();

@ Executar função principal @
Principal(); 

@ Função principal @
Funcao Principal(); {
  @ Criar JSON com arrays aninhados @
  criarJSONAninhado();
   
  @ Executar testes @
  testarArraysAninhados();
        
  vaMensagem = "Testes concluídos!";
  Mensagem(Retorna, vaMensagem);
}

@ Criar JSON com arrays aninhados @
Funcao criarJSONAninhado();{
  @ JSON com arrays aninhados (array dentro de array) @
  vaJSONArrayAninhado = "{                                                                    \
                          \"data\": [                                                      \
                              {                                                            \
                                  \"id_boleto\": \"a82592a9-29cd-4ebd-a39d-e289622e1656\", \
                                  \"dado_boleto\": {                                       \
                                      \"dados_individuais_boleto\": [                      \
                                          {                                                \
                                              \"situacao_geral_boleto\": \"Paga\",         \
                                              \"parcelas\": [                              \
                                                  {                                        \
                                                      \"numero_parcela\": 1,               \
                                                      \"valor_parcela\": 150.00,           \
                                                      \"status_parcela\": \"Paga\"         \
                                                  }                                        \
                                              ]                                            \
                                          }                                                \
                                      ],                                                   \
                                  }                                                        \
                              }                                                            \
                          ]                                                               \ 
                        }";
}

@ Função para testar arrays aninhados @
Funcao testarArraysAninhados(); {
  vaMensagem = "=== TESTE: ARRAYS ANINHADOS ===";
  Mensagem(Retorna, vaMensagem);
  
  @ Teste 1: Acessar primeiro nível de array @
  ValorElementoJson(vaJSONArrayAninhado,"data","id_boleto",vaResultado);
  vaMensagem = "Nível 1 - id_boleto: " + vaResultado;
  Mensagem(Retorna, vaMensagem);
  
  @ Teste 2: Acessar segundo nível de array @
  ValorElementoJson(vaJSONArrayAninhado,"data;dado_boleto;dados_individuais_boleto","situacao_geral_boleto",vaResultado);
  vaMensagem = "Nível 2 - situacao_geral_boleto: " + vaResultado;
  Mensagem(Retorna, vaMensagem);
  
  @ Teste 3: Acessar terceiro nível de array (array dentro de array) @
  ValorElementoJson(vaJSONArrayAninhado,"data;dado_boleto;dados_individuais_boleto;parcelas","numero_parcela",vaResultado);
  vaMensagem = "Nível 3 - numero_parcela: " + vaResultado;
  Mensagem(Retorna, vaMensagem);
  
  @ Teste 4: Acessar valor da parcela @
  ValorElementoJson(vaJSONArrayAninhado,"data;dado_boleto;dados_individuais_boleto;parcelas","valor_parcela",vaResultado);
  vaMensagem = "Nível 3 - valor_parcela: " + vaResultado;
  Mensagem(Retorna, vaMensagem);
  
  @ Teste 5: Acessar status da parcela @
  ValorElementoJson(vaJSONArrayAninhado,"data;dado_boleto;dados_individuais_boleto;parcelas","status_parcela",vaResultado);
  vaMensagem = "Nível 3 - status_parcela: " + vaResultado;
  Mensagem(Retorna, vaMensagem);
  
  vaMensagem = "=== CONCLUSÃO ===";
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Se todos os valores aparecerem, arrays aninhados funcionam!";
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Se algum valor ficar vazio, há limitação na profundidade";
  Mensagem(Retorna, vaMensagem);
} 