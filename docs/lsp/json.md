# Manipulação de JSON

A LSP oferece três abordagens diferentes para trabalhar com dados JSON, cada uma com suas características e casos de uso específicos. A escolha da abordagem depende do tipo de dados que você precisa processar e da complexidade da estrutura JSON.

### **1. ValorElementoJson - Para Dados Simples**

**Quando usar:** Para extrair valores únicos de campos específicos do JSON.

**Características:**

- Extrai um valor por vez
- Ideal para dados simples ou metadados
- Mais rápido e simples de usar
- Não consegue percorrer arrays

**Exemplo:**

```lsp
Definir Alfa vaJSON;
Definir Alfa vaToken;
Definir Alfa vaNomeUsuario;

vaJSON = "{\"usuario\": {\"nome\": \"João\", \"token\": \"abc123\"}}";

@ Extrair token do usuário @
ValorElementoJson(vaJSON, "usuario", "token", vaToken);
@ vaToken = "abc123" @

@ Extrair nome do usuário @
ValorElementoJson(vaJSON, "usuario", "nome", vaNomeUsuario);
@ vaNomeUsuario = "João" @
```

### **2. ListaRegraCarregarJson - Para Coleções de Dados**

**Quando usar:** Para processar arrays de objetos JSON e trabalhar com múltiplos registros.

**Características:**

- Carrega múltiplos registros em uma lista estruturada
- Ideal para dados tabulares ou coleções
- Permite navegar pelos registros usando funções de lista
- Não consegue percorrer arrays aninhados

**Exemplo:**

```lsp
Definir Numero vnLista;
Definir Alfa vaAchou;
Definir Alfa vaNome;
Definir Alfa vaEmail;

vaJSON = "{\"usuarios\": [{\"nome\": \"João\", \"email\": \"joao@exemplo.com\"}, {\"nome\": \"Maria\", \"email\": \"maria@exemplo.com\"}]}";

@ Criar lista e carregar usuários @
ListaRegraCriarLista(vnLista);
ListaRegraCarregarJson(vnLista, vaJSON, "usuarios", "nome;email");

@ Navegar pela lista @
ListaRegraPrimeiro(vnLista, vaAchou);
Enquanto (vaAchou = "S") {
  ListaRegraObterValorAlfa(vnLista, "nome", vaNome, vaAchou);
  ListaRegraObterValorAlfa(vnLista, "email", vaEmail, vaAchou);
  
  @ Processar cada usuário @
  Mensagem(Retorna, "Usuário: " + vaNome + " - " + vaEmail);
  
  ListaRegraProximo(vnLista, vaAchou);
}
```

### **3. Manipulação Manual com PosicaoAlfa e LerPosicaoAlfa - Para Casos Complexos**

**Quando usar:** Quando as funções padrão não conseguem atender suas necessidades, especialmente para:

- Arrays aninhados
- Estruturas JSON complexas
- Extração de dados específicos com lógica customizada
- Controle total sobre o parsing

**Características:**

- Controle total sobre a extração de dados
- Pode processar qualquer estrutura JSON
- Mais complexo de implementar
- Requer conhecimento de manipulação de strings e códigos ASCII

**Exemplo Prático - Extraindo Dados de Resposta de API:**

```lsp
Definir Funcao extrairDadosJSONManual(); {
  Definir Alfa vaJSONResposta;
  Definir Alfa vaValorFrete;
  Definir Alfa vaPrazo;
  Definir Numero vnPosicaoVlTotal;
  Definir Numero vnPosicaoPrazo;
  Definir Numero vnTamanhoJSON;
  Definir Numero vnInicioVal;
  Definir Numero vnFimVal;
  Definir Numero vnCodigoCaractere;
  Definir Numero vnCodigoVirgula; vnCodigoVirgula = 44; @ Código ASCII da vírgula @
  Definir Numero vnCodigoChaveFecha; vnCodigoChaveFecha = 125; @ Código ASCII de } @
  
  @ JSON de exemplo @
  vaJSONResposta = "{\"frete\": {\"vltotal\": 25.50, \"prazo\": 3, \"status\": \"ok\"}}";
  
  @ Obter tamanho total do JSON @
  TamanhoAlfa(vaJSONResposta, vnTamanhoJSON);
  
  @ === EXTRAIR VALOR TOTAL === @
  PosicaoAlfa("\"vltotal\":", vaJSONResposta, vnPosicaoVlTotal);
  Se (vnPosicaoVlTotal > 0) {
    @ Posicionar após "vltotal": @
    vnPosicaoVlTotal = vnPosicaoVlTotal + 10; @ Tamanho de "vltotal": @
    
    @ Pular espaços @
    Enquanto (vnPosicaoVlTotal < vnTamanhoJSON) {
      LerPosicaoAlfa(vaJSONResposta, vnCodigoCaractere, vnPosicaoVlTotal);
      Se (vnCodigoCaractere = 32) { @ Código ASCII do espaço @
        vnPosicaoVlTotal++;
      } Senao {
        Pare;
      }
    }
    
    @ Extrair valor até vírgula ou chave @
    vnInicioVal = vnPosicaoVlTotal;
    vnFimVal = vnInicioVal;
    
    Enquanto (vnFimVal < vnTamanhoJSON) {
      LerPosicaoAlfa(vaJSONResposta, vnCodigoCaractere, vnFimVal);
      Se ((vnCodigoCaractere <> vnCodigoVirgula) e (vnCodigoCaractere <> vnCodigoChaveFecha)) {
        vnFimVal++;
      } Senao {
        Pare;
      }
    }
    
    @ Extrair o valor @
    Se (vnFimVal > vnInicioVal) {
      vaValorFrete = vaJSONResposta; @ Fazer cópia primeiro @
      CopiarAlfa(vaValorFrete, vnInicioVal, vnFimVal - vnInicioVal);
      SubstAlfa(" ", "", vaValorFrete); @ Remover espaços @
    }
  }
  
  @ === EXTRAIR PRAZO === @
  PosicaoAlfa("\"prazo\":", vaJSONResposta, vnPosicaoPrazo);
  Se (vnPosicaoPrazo > 0) {
    @ Posicionar após "prazo": @
    vnPosicaoPrazo = vnPosicaoPrazo + 8; @ Tamanho de "prazo": @
    
    @ Pular espaços @
    Enquanto (vnPosicaoPrazo < vnTamanhoJSON) {
      LerPosicaoAlfa(vaJSONResposta, vnCodigoCaractere, vnPosicaoPrazo);
      Se (vnCodigoCaractere = 32) { @ Código ASCII do espaço @
        vnPosicaoPrazo++;
      } Senao {
        Pare;
      }
    }
    
    @ Extrair prazo até vírgula ou chave @
    vnInicioVal = vnPosicaoPrazo;
    vnFimVal = vnInicioVal;
    
    Enquanto (vnFimVal < vnTamanhoJSON) {
      LerPosicaoAlfa(vaJSONResposta, vnCodigoCaractere, vnFimVal);
      Se ((vnCodigoCaractere <> vnCodigoVirgula) e (vnCodigoCaractere <> vnCodigoChaveFecha)) {
        vnFimVal++;
      } Senao {
        Pare;
      }
    }
    
    @ Extrair o prazo @
    Se (vnFimVal > vnInicioVal) {
      vaPrazo = vaJSONResposta; @ Fazer cópia primeiro @
      CopiarAlfa(vaPrazo, vnInicioVal, vnFimVal - vnInicioVal);
      SubstAlfa(" ", "", vaPrazo); @ Remover espaços @
    }
  }
  
  @ Mostrar resultados @
  Mensagem(Retorna, "Valor do Frete: R$ " + vaValorFrete + " - Prazo: " + vaPrazo + " dias");
}
```

### **Comparativo das Abordagens**

| Aspecto | ValorElementoJson | ListaRegraCarregarJson | Manipulação Manual |
|---------|-------------------|-------------------------|-------------------|
| **Facilidade de Uso** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Flexibilidade** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Manutenibilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Controle** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### **Recomendações de Uso**

#### **Use ValorElementoJson quando:**
- Precisar de dados únicos ou metadados
- Trabalhar com JSON simples e estruturado
- Quiser máxima performance
- Não precisar processar arrays

#### **Use ListaRegraCarregarJson quando:**
- Precisar processar coleções de dados
- Trabalhar com arrays de objetos
- Quiser navegar pelos registros facilmente
- Precisar de uma abordagem estruturada

#### **Use Manipulação Manual quando:**
- As funções padrão não conseguem atender suas necessidades
- Precisar processar arrays aninhados
- Quiser controle total sobre a extração
- Tiver estruturas JSON muito complexas

### **Dicas Importantes**

1. **Sempre comece com as funções padrão** - Use `ValorElementoJson` ou `ListaRegraCarregarJson` primeiro
2. **Use manipulação manual apenas quando necessário** - É mais complexo e propenso a erros
3. **Teste com diferentes estruturas JSON** - Valide se a abordagem escolhida funciona com seus dados
4. **Considere a manutenibilidade** - Código mais simples é mais fácil de manter
5. **Documente a lógica** - Especialmente quando usar manipulação manual
