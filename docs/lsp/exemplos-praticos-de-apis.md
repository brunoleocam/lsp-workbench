# Exemplos Práticos de APIs

Esta seção contém exemplos reais de integração com APIs públicas usando as funções HTTP da LSP.

### Exemplo 1: Busca CEP na API ViaCEP

Função completa para buscar informações de CEP usando a API gratuita do ViaCEP.

```lsp
Funcao buscarCepApi(Numero vnCepApi); {
  Definir Alfa vaCepApi;
  Definir Alfa vaHTTP;
  Definir Alfa vaURL;
  Definir Alfa vaJSON;
  Definir Alfa vaCodRes;
  Definir Alfa vaMsgUsu;
  Definir Numero vnCodRes;

  @ Tratamento de Variáveis @
  vaURL = "https://viacep.com.br/ws/__NUMCEP__/json/"; @ URL do ViaCEP @
  vaJSON = ""; @ Objeto de Retorno da Requisição @
  vnCodRes = 0; @ Cód. HTTP Response @

  ConverteMascara(1, vnCepApi, vaCepApi, "99999999");
  TrocaString(vaURL, "__NUMCEP__", vaCepApi);

  @ Cria Objeto HTTP @
  HttpObjeto(vaHTTP);

  @ Desabilita Erro Padrão, evita que mensagens de erros HTTP 4XX/5XX gerem Exceptions em tela ao usuário @
  HttpDesabilitaErroResposta(vaHTTP);

  @ Altera os Cabeçalhos da Requisição @
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept", "application/json;charset=utf-8");
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept-Encoding", "gzip, deflate, br");
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
    @ Logradouro @
    ValorElementoJson(vaJSON, "", "logradouro", vaLogradouro);

    @ Complemento @
    ValorElementoJson(vaJSON, "", "complemento", vaComplemento);

    @ Bairro @
    ValorElementoJson(vaJSON, "", "bairro", vaBairro);

    @ Cidade @
    ValorElementoJson(vaJSON, "", "localidade", vaCidadeCep);

    @ Estado @
    ValorElementoJson(vaJSON, "", "uf", vaEstadoCep);

    @ IBGE @
    ValorElementoJson(vaJSON, "", "ibge", vaIbge);
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
```

### Exemplo 2: Busca Cidade na API IBGE

Função para obter informações de municípios usando a API do IBGE.

```lsp
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
```

### **Características dos Exemplos**

#### **Exemplo ViaCEP:**

- **Método**: GET
- **Formato**: JSON
- **Encoding**: UTF-8
- **Tratamento**: Erros HTTP e parsing JSON
- **Casos de uso**: Autocompletar endereços, validação de CEP

#### **Exemplo IBGE:**

- **Método**: GET
- **Formato**: JSON com view nivelada
- **API**: Gratuita e confiável do governo
- **Casos de uso**: Listagem de municípios, dados geográficos

#### **Boas Práticas Demonstradas:**

1. **Configuração de encoding UTF-8** para caracteres especiais
2. **Desabilitação de erros automáticos** para controle manual
3. **Verificação de códigos de status** antes de processar
4. **Formatação adequada de parâmetros** com ConverteMascara
5. **Tratamento de erros** com mensagens informativas

---
