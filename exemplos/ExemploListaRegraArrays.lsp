@ ExemploListaRegraArrays.lsp @
@ Exemplo de como acessar arrays em JSON usando ListaRegra* @

@ Variáveis @
Definir Alfa vaJSON;
Definir Alfa vaMensagem;

Definir Funcao Principal();
Definir Funcao criarJSON();
Definir Funcao PercorrerArraysComListaRegra();

@ Executar função principal @
Principal(); 

@ Função principal @
Funcao Principal(); {
  @ Criar JSON @
  criarJSON();
   
  @ Executar percorrimento de arrays @
  PercorrerArraysComListaRegra();
        
  vaMensagem = "Processamento concluído!";
  Mensagem(Retorna, vaMensagem);
}

@ Criar JSON com arrays @
Funcao criarJSON();{
  vaJSON = "{                                                                    \
                \"resultado\": {                                                     \     
                        \"empresa\": {                                                     \
                          \"nome\": \"Tech Solutions\",                                    \
                          \"localizacao\": {                                               \
                            \"pais\": \"Brasil\",                                          \
                            \"estado\": \"Paraná\",                                        \
                            \"cidade\": {                                                  \
                              \"nome\": \"Arapongas\",                                     \
                              \"bairro\": {                                                \
                                \"nome\": \"Centro\",                                      \
                                \"rua\": {                                                 \
                                  \"nome\": \"Rua das Palmeiras\",                         \
                                  \"numero\": 123                                          \
                                }                                                          \
                              }                                                            \
                            }                                                              \
                          },                                                               \
                          \"departamentos\": [                                             \ 
                            {                                                              \
                              \"nome\": \"TI\",                                            \
                              \"projetos\": [                                              \
                                {                                                          \
                                  \"nome\": \"Sistema de Gestão\",                         \
                                  \"versao\": \"2.1.0\"                                    \
                                },                                                         \
                                {                                                          \
                                  \"nome\": \"App Mobile\",                                \
                                  \"versao\": \"1.5.2\"                                    \
                                }                                                          \
                              ]                                                            \
                            },                                                             \
                            {                                                              \
                              \"nome\": \"RH\",                                            \
                              \"projetos\": [                                              \
                                {                                                          \
                                  \"nome\": \"Portal do Colaborador\",                     \
                                  \"versao\": \"3.0.1\"                                    \
                                }                                                          \
                              ]                                                            \
                            }                                                              \
                          ],                                                                \
                        }                                                                  \
                }                                                                    \
          }";
}

@ Função para percorrer arrays usando ListaRegra* @
Funcao PercorrerArraysComListaRegra(); {
  Definir Alfa vaDepartamentosJSON;
  Definir Alfa vaProjetosJSON;
  Definir Alfa vaNomeDepartamento;
  Definir Alfa vaNomeProjeto;
  Definir Alfa vaVersaoProjeto;
  
  vaMensagem = "=== PERCORRENDO ARRAYS COM LISTAREGRA* ===";
  Mensagem(Retorna, vaMensagem);
  
  @ Passo 1: Extrair array de departamentos como JSON string @
  ValorElementoJson(vaJSON, "resultado;empresa", "departamentos", vaDepartamentosJSON);
  vaMensagem = "Array de departamentos extraído: " + vaDepartamentosJSON;
  Mensagem(Retorna, vaMensagem);
  
  @ Passo 2: Carregar array em lista de regras @
  ListaRegraCarrega(vaDepartamentosJSON, "departamentos");
  vaMensagem = "Array carregado em lista de regras";
  Mensagem(Retorna, vaMensagem);
  
  @ Passo 3: Navegar pelos departamentos @
  ListaRegraPrimeiro("departamentos");
  
  Enquanto (ListaRegraEOF("departamentos") = 0) {
    @ Obter nome do departamento atual @
    ListaRegraDados("departamentos", "nome", vaNomeDepartamento);
    vaMensagem = "Departamento: " + vaNomeDepartamento;
    Mensagem(Retorna, vaMensagem);
    
    @ Passo 4: Extrair projetos do departamento atual @
    ListaRegraDados("departamentos", "projetos", vaProjetosJSON);
    vaMensagem = "Projetos do departamento " + vaNomeDepartamento + ": " + vaProjetosJSON;
    Mensagem(Retorna, vaMensagem);
    
    @ Passo 5: Carregar projetos em lista de regras @
    ListaRegraCarrega(vaProjetosJSON, "projetos");
    
    @ Passo 6: Navegar pelos projetos @
    ListaRegraPrimeiro("projetos");
    
    Enquanto (ListaRegraEOF("projetos") = 0) {
      @ Obter dados do projeto atual @
      ListaRegraDados("projetos", "nome", vaNomeProjeto);
      ListaRegraDados("projetos", "versao", vaVersaoProjeto);
      
      vaMensagem = "  - Projeto: " + vaNomeProjeto + " (v" + vaVersaoProjeto + ")";
      Mensagem(Retorna, vaMensagem);
      
      @ Próximo projeto @
      ListaRegraProximo("projetos");
    }
    
    @ Liberar lista de projetos @
    ListaRegraLiberarLista("projetos");
    
    @ Próximo departamento @
    ListaRegraProximo("departamentos");
  }
  
  @ Liberar lista de departamentos @
  ListaRegraLiberarLista("departamentos");
  
  vaMensagem = "Percorrimento de arrays concluído!";
  Mensagem(Retorna, vaMensagem);
} 