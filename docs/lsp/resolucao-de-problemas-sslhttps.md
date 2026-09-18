# Resolução de Problemas SSL/HTTPS

### Problemas Comuns e Soluções

As requisições HTTPS para APIs externas podem apresentar diversos problemas SSL/TLS. Esta seção documenta os erros mais comuns e suas soluções práticas.

#### **Erro: EIdOSSLConnectError - Error connecting with SSL**

**Sintomas:**

```lsp
Classe da exceção: EIdOSSLConnectError
[EIdOSSLConnectError] Error connecting with SSL
```

**Causa:** Configuração SSL/TLS incompatível entre o Senior e o servidor de destino.

**Solução:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;

HttpObjeto(vaHTTP);

@ CONFIGURAÇÃO SSL CORRETA @
HttpAlteraConfiguracaoSSL(vaHTTP, 0); @ SSL automático para melhor compatibilidade @
HttpHabilitaSNI(vaHTTP); @ Habilitar SNI para APIs modernas @
HttpAlteraRedirecionamento(vaHTTP, 1); @ Seguir redirecionamentos automaticamente @

HttpDesabilitaErroResposta(vaHTTP);
HttpPost(vaHTTP, "https://api.exemplo.com/endpoint", dados, vaResposta);
```

#### **Erro: SSL23_GET_SERVER_HELLO - sslv3 alert handshake failure**

**Sintomas:**

```lsp
error:14077410:SSL routines:SSL23_GET_SERVER_HELLO:sslv3 alert handshake failure
```

**Causa:** Incompatibilidade de versões SSL/TLS ou problemas de certificado.

**Solução com Sistema de Tentativas:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;
Definir Numero vnCodRes;
Definir Numero vnTentativa;

vnTentativa = 1;

@ TENTATIVA 1: SSL Automático + SNI @
HttpObjeto(vaHTTP);
HttpAlteraConfiguracaoSSL(vaHTTP, 0);
HttpHabilitaSNI(vaHTTP);
HttpDesabilitaErroResposta(vaHTTP);
HttpPost(vaHTTP, "https://api.exemplo.com/endpoint", dados, vaResposta);
HttpLeCodigoResposta(vaHTTP, vnCodRes);

Se ((vnCodRes < 200) ou (vnCodRes >= 300)) {
  @ TENTATIVA 2: SSL Forçado sem SNI @
  HttpObjeto(vaHTTP);
  HttpAlteraConfiguracaoSSL(vaHTTP, 2);
  HttpDesabilitaSNI(vaHTTP);
  HttpDesabilitaErroResposta(vaHTTP);
  HttpPost(vaHTTP, "https://api.exemplo.com/endpoint", dados, vaResposta);
  HttpLeCodigoResposta(vaHTTP, vnCodRes);
}

Se ((vnCodRes < 200) ou (vnCodRes >= 300)) {
  @ TENTATIVA 3: SSL Básico @
  HttpObjeto(vaHTTP);
  HttpAlteraConfiguracaoSSL(vaHTTP, 1);
  HttpDesabilitaErroResposta(vaHTTP);
  HttpPost(vaHTTP, "https://api.exemplo.com/endpoint", dados, vaResposta);
}
```

#### **Erro: EIdIOHandlerPropInvalid - IOHandler value is not valid**

**Sintomas:**

```lsp
[EIdIOHandlerPropInvalid] IOHandler value is not valid
```

**Causa:** Problema com o handler de entrada/saída da requisição HTTP.

**Solução:**

```lsp
Definir Alfa vaHTTP;

@ Recriar objeto HTTP completamente @
HttpObjeto(vaHTTP);

@ Configuração mínima primeiro @
HttpDesabilitaErroResposta(vaHTTP);

@ Depois adicionar configurações SSL @
HttpAlteraConfiguracaoSSL(vaHTTP, 0);

@ Headers básicos apenas @
HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json");
```

### **Configurações SSL Recomendadas por Cenário**

#### **Para APIs Modernas (Cloudflare, AWS, etc.)**

```lsp
HttpAlteraConfiguracaoSSL(vaHTTP, 0); @ SSL automático @
HttpHabilitaSNI(vaHTTP); @ SNI habilitado @
HttpAlteraRedirecionamento(vaHTTP, 1); @ Redirecionamentos @
```

#### **Para APIs Legadas ou Servidores Antigos**

```lsp
HttpAlteraConfiguracaoSSL(vaHTTP, 1); @ SSL básico @
HttpDesabilitaSNI(vaHTTP); @ SNI desabilitado @
```

#### **Para Problemas Persistentes**

```lsp
HttpAlteraConfiguracaoSSL(vaHTTP, 2); @ SSL sempre ativo @
HttpDesabilitaSNI(vaHTTP); @ Sem SNI @
```

### **Configurações Obrigatórias no SeniorConfigCenter**

Para requisições HTTPS funcionarem, configure no SeniorConfigCenter:

1. **Navegue para:** Conexões de rede → Envio de e-mail → Requisições REST
2. **Habilite:**
   - ✅ "Habilitar uso de rotinas"
   - ✅ "Utilizar SSL"

**Sem essas configurações, TODAS as requisições HTTPS falharão!**

### **Conversão de Formatos Decimais**

**Problema:** APIs retornam decimais com ponto (.) mas LSP espera vírgula (,).

```lsp
@ Resposta da API: "202.38" @
ValorElementoJson(vaJSON, "frete", "valor", vaValor);

@ ERRO: AlfaParaDecimal não aceita ponto @
@ AlfaParaDecimal(vaValor, vnValor); @ Falha! @

@ SOLUÇÃO: Converter ponto para vírgula @
SubstAlfa(".", ",", vaValor);
AlfaParaDecimal(vaValor, vnValor); @ Sucesso! @
```

### **Teste de Conectividade HTTP vs HTTPS**

Para diagnosticar problemas SSL, teste temporariamente com HTTP:

```lsp
@ TESTE 1: HTTP (sem SSL) @
vaURL = "http://api.exemplo.com/endpoint";
HttpPost(vaHTTP, vaURL, dados, vaResposta);

@ Se HTTP funcionar, o problema é SSL @
@ TESTE 2: HTTPS com configuração SSL @
vaURL = "https://api.exemplo.com/endpoint";
HttpAlteraConfiguracaoSSL(vaHTTP, 0);
HttpPost(vaHTTP, vaURL, dados, vaResposta);
```

### HttpPatch

Executa uma requisição HTTP PATCH para aplicar modificações parciais em um recurso. Ideal para atualizações que modificam apenas alguns campos.

**Sintaxe:** `HttpPatch(Alfa end Objeto, Alfa URL, Alfa Dados, Alfa end Retorno);`

**Parâmetros:**

- `Objeto`: Objeto HTTP criado com HttpObjeto
- `URL`: URL do recurso a ser modificado parcialmente
- `Dados`: Dados de modificação parcial no formato texto
- `Retorno`: Variável que receberá a resposta

**Exemplo Básico:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;
Definir Alfa vaDados;

HttpObjeto(vaHTTP);

@ Dados para modificação parcial (apenas os campos que mudaram) @
vaDados = "{\"status\": \"ativo\", \"ultimo_acesso\": \"2024-01-15\"}";

HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json");
HttpPatch(vaHTTP, "https://api.exemplo.com/usuarios/123", vaDados, vaResposta);
```

**Exemplo com Verificação:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;
Definir Alfa vaDados;
Definir Numero vnStatus;

HttpObjeto(vaHTTP);
HttpDesabilitaErroResposta(vaHTTP);

vaDados = "{\"email\": \"novo@exemplo.com\"}";

HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json");
HttpAlteraCabecalhoRequisicao(vaHTTP, "Authorization", "Bearer token123");

HttpPatch(vaHTTP, "https://api.exemplo.com/perfil", vaDados, vaResposta);

HttpLeCodigoResposta(vaHTTP, vnStatus);
Se (vnStatus = 200) {
  Mensagem(Retorna, "Perfil atualizado com sucesso!");
} Senao {
  Mensagem(Erro, "Erro ao atualizar. Status: " + vnStatus);
}
```

**Observações:**

- PATCH é usado para modificações parciais (só os campos alterados)
- Diferente do PUT, que substitui o recurso completo
- Suporta apenas formato texto, não arquivos binários

### HttpSetAttachment

Permite o envio de arquivos locais no corpo de uma requisição HTTP. Disponível para os métodos POST, PUT e PATCH.

**Sintaxe:** `HttpSetAttachment(Alfa end Objeto, Alfa CaminhoArquivo);`

**Parâmetros:**

- `Objeto`: Objeto HTTP criado com HttpObjeto
- `CaminhoArquivo`: Caminho completo do arquivo local a ser anexado

**Exemplo com POST:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;

HttpObjeto(vaHTTP);

@ Anexar arquivo @
HttpSetAttachment(vaHTTP, "C:\\temp\\documento.pdf");

@ Configurar cabeçalhos @
HttpAlteraCabecalhoRequisicao(vaHTTP, "Authorization", "Bearer token123");

HttpPost(vaHTTP, "https://api.exemplo.com/upload", "", vaResposta);
```

**Exemplo com Múltiplos Arquivos (conceitual):**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;

HttpObjeto(vaHTTP);

@ Para múltiplos arquivos, fazer requisições separadas @
HttpSetAttachment(vaHTTP, "C:\\docs\\relatorio.pdf");
HttpPost(vaHTTP, "https://api.exemplo.com/upload", "", vaResposta);

HttpSetAttachment(vaHTTP, "C:\\docs\\planilha.xlsx");
HttpPost(vaHTTP, "https://api.exemplo.com/upload", "", vaResposta);
```

**Observações:**

- O arquivo deve existir no caminho especificado
- Funciona com POST, PUT e PATCH
- Para múltiplos arquivos, faça requisições separadas

### Base64Encode / Base64Decode

Funções para codificar e decodificar strings em Base64, essenciais para autenticação HTTP básica e transmissão segura de dados.

#### Base64Encode

Codifica strings em Base64, comumente usado para autenticação básica HTTP.

**Sintaxe:** `Base64Encode(Alfa valor, Alfa end Base64Encode);`

**Parâmetros:**

- `valor`: String a ser codificada em Base64
- `Base64Encode`: Variável que receberá o resultado codificado

#### Base64Decode

Decodifica um valor Base64 de volta para texto original.

**Sintaxe:** `Base64Decode(Alfa valor, Alfa end Base64Decode);`

**Parâmetros:**

- `valor`: Valor em Base64 a ser decodificado
- `Base64Decode`: Variável que receberá o conteúdo decodificado

**Exemplo Básico de Codificação:**

```lsp
Definir Alfa vaValor;
Definir Alfa vaBase64;

vaValor = "valor para converter";
Base64Encode(vaValor, vaBase64);
Mensagem(Retorna, vaBase64); @ Exibirá: dmFsb3IgcGFyYSBjb252ZXJ0ZXI= @
```

**Exemplo Básico de Decodificação:**

```lsp
Definir Alfa vaValorBase64;
Definir Alfa vaValor;

vaValorBase64 = "dmFsb3IgcGFyYSBjb252ZXJ0ZXI=";
Base64Decode(vaValorBase64, vaValor);
Mensagem(Retorna, vaValor); @ Exibirá: valor para converter @
```

**Exemplo para Autenticação HTTP:**

```lsp
Definir Alfa vaUsuario;
Definir Alfa vaSenha;
Definir Alfa vaCredenciais;
Definir Alfa vaBase64;
Definir Alfa vaAuth;

vaUsuario = "admin";
vaSenha = "senha123";
vaCredenciais = vaUsuario + ":" + vaSenha;

@ Codificar credenciais @
Base64Encode(vaCredenciais, vaBase64);
vaAuth = "Basic " + vaBase64;

@ Usar vaAuth no cabeçalho Authorization @
HttpAlteraCabecalhoRequisicao(vaHTTP, "Authorization", vaAuth);
```

**Exemplo de Uso Completo (Codificar e Decodificar):**

```lsp
Definir Alfa vaTextoOriginal;
Definir Alfa vaTextoCodificado;
Definir Alfa vaTextoDecodificado;

vaTextoOriginal = "dados sensíveis da aplicação";

@ Codificar para transmissão segura @
Base64Encode(vaTextoOriginal, vaTextoCodificado);
Mensagem(Retorna, "Dados codificados: " + vaTextoCodificado);

@ Decodificar após receber @
Base64Decode(vaTextoCodificado, vaTextoDecodificado);
Mensagem(Retorna, "Dados decodificados: " + vaTextoDecodificado);

@ Verificar se são iguais @
Se (vaTextoOriginal = vaTextoDecodificado) {
  Mensagem(Retorna, "Codificação/Decodificação realizada com sucesso!");
}
```

**Casos de Uso Comuns:**

- **Autenticação HTTP Basic**: Codificar usuário:senha
- **Tokens de API**: Decodificar tokens JWT recebidos
- **Transmissão de dados**: Codificar dados binários como texto
- **Armazenamento**: Codificar credenciais para armazenamento temporário
- **Integração**: Decodificar dados recebidos de APIs externas

### Exemplo Completo: Sistema de Autenticação

Aqui está um exemplo completo de geração de token com autenticação básica:

```lsp
Definir Alfa vaToken;
Definir Funcao gerarToken();

gerarToken();

Funcao gerarToken(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaJSON;
  Definir Alfa vaCodRes;
  Definir Alfa vaMsgUsu;
  Definir Numero vnCodRes;
  
  Definir Alfa vaUsuario;
  Definir Alfa vaAPIKey;
  Definir Alfa vaEncode;
  Definir Alfa vaAuthToken;
  Definir Alfa vaURL;
  Definir Alfa vaDados;

  @ Credenciais de exemplo (substitua pelas reais) @
  vaUsuario = "usuario_demo";  
  vaAPIKey = "sk_test_1234567890abcdef1234567890abcdef12345678";
  
  @ Criar token de autenticação Basic @
  vaEncode = vaUsuario + ":" + vaAPIKey;
  Base64Encode(vaEncode, vaAuthToken); 
  vaAuthToken = "Basic " + vaAuthToken;
  
  @ Configurar URL e dados @
  vaURL = "https://api.exemplo.com/v1/auth/token"; 
  vaDados = "{\"numero_cartao\": \"0012345678\"}";
  
  @ Criar objeto HTTP @
  HttpObjeto(vaHTTP);

  @ Configurar tratamento de erros @
  HttpDesabilitaErroResposta(vaHTTP); 
  
  @ Configurar timeout @
  HttpSetaTimeout(vaHTTP, 30);
  
  @ Configurar cabeçalhos @
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept", "application/json;charset=utf-8");
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json;charset=utf-8");
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept-Charset", "utf-8");
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Cache-Control", "no-cache");
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Authorization", vaAuthToken);
  HttpAlteraCodifCaracPadrao(vaHTTP, "utf-8");
  
  @ Executar requisição @
  HttpPost(vaHTTP, vaURL, vaDados, vaJSON);
  
  @ Verificar código de resposta @
  HttpLeCodigoResposta(vaHTTP, vnCodRes);
  
  @ Processar resposta de sucesso @
  Se ((vnCodRes >= 200) e (vnCodRes <= 204)) {
    @ Extrair token do JSON @
    ValorElementoJson(vaJSON, "", "token", vaToken);
    
    @ Log de sucesso @
    Mensagem(Retorna, "Token gerado com sucesso!");
  }
  
  @ Tratamento de erro @
  Se ((vnCodRes < 200) ou (vnCodRes >= 300)) {
    IntParaAlfa(vnCodRes, vaCodRes);
    vaMsgUsu = "Erro HTTP [" + vaCodRes + "]: Falha na autenticação. Verifique as credenciais.";
    Mensagem(Erro, vaMsgUsu);
  }
}
```

### Funções de Configuração Avançada

#### HttpAlteraCabecalhoRequisicao

Configura cabeçalhos HTTP personalizados para requisições. Válido para todos os métodos HTTP.

**Sintaxe:** `HttpAlteraCabecalhoRequisicao(Alfa end Objeto, Alfa Nome, Alfa Valor);`

**Parâmetros:**

- `Objeto`: Objeto HTTP criado com HttpObjeto
- `Nome`: Nome do cabeçalho (não pode ser vazio)
- `Valor`: Valor do cabeçalho (vazio remove o cabeçalho)

**Exemplo com API REST:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;

HttpObjeto(vaHTTP);

HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept", "text/plain");
HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json");
HttpAlteraCabecalhoRequisicao(vaHTTP, "Authorization", "Bearer token123");
HttpAlteraCabecalhoRequisicao(vaHTTP, "User-Agent", "MeuApp/1.0");

HttpPost(vaHTTP, "https://exemplo.com/app/path", "<dados>", vaResposta);
```

#### HttpAlteraCodifCaracPadrao

Configura a codificação de caracteres para respostas do servidor quando não especificada.

**Sintaxe:** `HttpAlteraCodifCaracPadrao(Alfa end Objeto, Alfa Codificacao);`

**Parâmetros:**

- `Objeto`: Objeto HTTP criado com HttpObjeto
- `Codificacao`: Nome da codificação (UTF-8, ISO-8859-1, Windows-1252)

**Exemplo:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;

HttpObjeto(vaHTTP);

@ Configurar para UTF-8 @
HttpAlteraCodifCaracPadrao(vaHTTP, "utf-8");

HttpGet(vaHTTP, "https://api.exemplo.com/dados", vaResposta);
```

**Observações:**

- Valor padrão: ISO-8859-1
- Codificações suportadas: UTF-8, ISO-8859-1, Windows-1252
- Se a codificação for inválida, pode retornar vazio ou erro

#### HttpAlteraRedirecionamento

Controla o tratamento automático de redirecionamentos HTTP (3xx).

**Sintaxe:** `HttpAlteraRedirecionamento(Alfa Objeto, Numero AceitaRedirecionamento);`

**Parâmetros:**

- `Objeto`: Objeto HTTP criado com HttpObjeto
- `AceitaRedirecionamento`: 0 = Não trata, 1 = Trata redirecionamentos

**Exemplo:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;

HttpObjeto(vaHTTP);

@ Habilitar tratamento automático de redirecionamentos @
HttpAlteraRedirecionamento(vaHTTP, 1);

HttpGet(vaHTTP, "https://site-com-redirect.exemplo.com", vaResposta);
```

### Funções de Gerenciamento de Cookies

#### HttpHabilitarCookies / HttpDesabilitarCookies

Controla o armazenamento e envio automático de cookies durante as requisições.

**Sintaxe:**

- `HttpHabilitarCookies(Alfa Objeto);`
- `HttpDesabilitarCookies(Alfa Objeto);`

**Exemplo:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;

HttpObjeto(vaHTTP);

@ Habilitar cookies para manter sessão @
HttpHabilitarCookies(vaHTTP);

@ Fazer login @
HttpPost(vaHTTP, "https://app.exemplo.com/login", "user=admin&pass=123", vaResposta);

@ Os cookies de sessão serão enviados automaticamente @
HttpGet(vaHTTP, "https://app.exemplo.com/dashboard", vaResposta);

@ Desabilitar cookies se necessário @
HttpDesabilitarCookies(vaHTTP);
```

### Funções de Leitura de Respostas

#### HttpLeCabecalhoResposta

Obtém valores de cabeçalhos retornados pelo servidor após uma requisição.

**Sintaxe:** `HttpLeCabecalhoResposta(Alfa end Objeto, Alfa Nome, Alfa end Valor);`

**Parâmetros:**

- `Objeto`: Objeto HTTP após uma requisição
- `Nome`: Nome do cabeçalho a consultar
- `Valor`: Variável que receberá o valor (vazio se não existir)

**Exemplo:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;
Definir Alfa vaContentType;
Definir Alfa vaContentLength;
Definir Alfa vaServer;

HttpObjeto(vaHTTP);

HttpGet(vaHTTP, "https://exemplo.com/api/dados", vaResposta);

@ Ler cabeçalhos de resposta @
HttpLeCabecalhoResposta(vaHTTP, "Content-Type", vaContentType);
HttpLeCabecalhoResposta(vaHTTP, "Content-Length", vaContentLength);
HttpLeCabecalhoResposta(vaHTTP, "Server", vaServer);

Mensagem(Retorna, "Tipo: " + vaContentType + ", Tamanho: " + vaContentLength);
```

**Observações:**

- Disponível apenas após realizar uma requisição
- Se o mesmo cabeçalho aparecer múltiplas vezes, retorna apenas o primeiro
- Exceção: WWW-Authenticate e Proxy-Authenticate podem retornar múltiplos valores

#### HttpNormalizaRetorno

Aplica normalização Unicode para caracteres acentuados em respostas HTTP.

**Sintaxe:** `HttpNormalizaRetorno(Alfa end Objeto);`

**Exemplo:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;

HttpObjeto(vaHTTP);

@ Habilitar normalização Unicode @
HttpNormalizaRetorno(vaHTTP);

HttpGet(vaHTTP, "https://api.exemplo.com/dados-acentuados", vaResposta);

@ A resposta terá caracteres acentuados normalizados @
Mensagem(Retorna, vaResposta);
```

**Observações:**

- Converte caracteres como Á (dois code points) para Á (um code point)
- Útil para compatibilidade com sistemas que usam diferentes representações Unicode
- Aplica normalização canônica Unicode C

### Configuração de Proxy

#### HttpAlteraConfiguracaoProxy

Configura as definições de servidor proxy para as requisições.

**Sintaxe:** `HttpAlteraConfiguracaoProxy(Alfa Objeto, Numero UsarProxy, Alfa Servidor, Numero Porta, Numero AutPorUsu);`

**Parâmetros:**

- `UsarProxy`: 0 = Não usar, 1 = Usar proxy
- `Servidor`: Endereço do servidor proxy
- `Porta`: Porta do servidor proxy
- `AutPorUsu`: 0 = Sem autenticação, 1 = Com autenticação

**Exemplo:**

```lsp
Definir Alfa vaHTTP;

HttpObjeto(vaHTTP);

@ Configurar proxy corporativo @
HttpAlteraConfiguracaoProxy(vaHTTP, 1, "proxy.empresa.com.br", 8080, 1);

HttpGet(vaHTTP, "https://api.externa.com/dados", vaResposta);
```

#### HttpLeConfiguracaoProxy

Lê as configurações atuais de proxy do objeto HTTP.

**Sintaxe:** `HttpLeConfiguracaoProxy(Alfa Objeto, Numero end UsarProxy, Alfa end Servidor, Numero end Porta, Numero end AutPorUsu);`

**Exemplo:**

```lsp
Definir Alfa vaHTTP;
Definir Numero vnUsarProxy;
Definir Alfa vaServidor;
Definir Numero vnPorta;
Definir Numero vnAutPorUsu;

HttpObjeto(vaHTTP);

HttpLeConfiguracaoProxy(vaHTTP, vnUsarProxy, vaServidor, vnPorta, vnAutPorUsu);

Se (vnUsarProxy = 1) {
  Mensagem(Retorna, "Proxy: " + vaServidor + ":" + vnPorta);
}
```

#### HttpAlteraAutenticacaoProxy / HttpLeAutenticacaoProxy

Configura e lê as credenciais de autenticação para o servidor proxy.

**Sintaxe:**

- `HttpAlteraAutenticacaoProxy(Alfa Objeto, Alfa Usuario, Alfa Senha);`
- `HttpLeAutenticacaoProxy(Alfa Objeto, Alfa end Usuario, Alfa end Senha);`

**Parâmetros:**

- `Usuario`: Nome de usuário para autenticação no proxy
- `Senha`: Senha para autenticação no proxy

**Exemplo de Configuração:**

```lsp
Definir Alfa vaHTTP;

HttpObjeto(vaHTTP);

@ Configurar credenciais do proxy @
HttpAlteraAutenticacaoProxy(vaHTTP, "nome", "senha");
```

**Exemplo de Leitura:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaUsuario;
Definir Alfa vaSenha;

HttpObjeto(vaHTTP);

@ Ler credenciais configuradas @
HttpLeAutenticacaoProxy(vaHTTP, vaUsuario, vaSenha);

Mensagem(Retorna, "Usuário proxy: " + vaUsuario);
```

**⚠️ Observações Importantes:**

#### **Autenticação Automática:**

- Se não informar usuário/senha válidos e a conexão exigir autenticação em servidor proxy, será exibida uma **tela de autenticação**

#### **🌐 Limitação WEB 5.0:**

- A **tela de autenticação NÃO está disponível na WEB 5.0**
- Para conexões que exigem autenticação, **deve-se obrigatoriamente** informar usuário e senha válidos
- Configure através de uma das opções:
  1. **Configuração padrão** na Central de Configurações
  2. **SGU** (Sistema de Gerenciamento de Usuários)
  3. **Regra LSP** usando `HttpAlteraAutenticacaoProxy`

#### **Comportamento da Leitura:**

- Se configurado para **autenticação por usuário**: retorna valores do **SGU**
- Caso contrário: retorna valores das propriedades **Usuário padrão** e **Senha padrão**

#### Gerenciamento de Exceções de Proxy

##### HttpAdicionaExcecaoProxy

Adiciona endereços à lista de exceções de proxy (URLs que não passam pelo proxy).

**Sintaxe:** `HttpAdicionaExcecaoProxy(Alfa Objeto, Alfa Endereco);`

**Observação:** O endereço não deve ser precedido do protocolo (ex: "localhost" em vez de "http://localhost").

##### HttpLeContadorExcecoesProxy

Retorna a quantidade de exceções cadastradas na lista de proxy.

**Sintaxe:** `HttpLeContadorExcecoesProxy(Alfa Objeto, Numero end Quantidade);`

##### HttpLeExcecaoProxy

Retorna um endereço específico da lista de exceções de proxy pelo índice.

**Sintaxe:** `HttpLeExcecaoProxy(Alfa Objeto, Numero Indice, Alfa end Endereco);`

##### HttpExcluiExcecaoProxy

Remove um endereço específico da lista de exceções pelo índice.

**Sintaxe:** `HttpExcluiExcecaoProxy(Alfa Objeto, Numero Indice);`

##### HttpLimpaExcecoesProxy

Remove todos os endereços da lista de exceções de proxy.

**Sintaxe:** `HttpLimpaExcecoesProxy(Alfa Objeto);`

**Exemplo completo de gerenciamento de exceções:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaEndereco;
Definir Numero vnQuantidade;
Definir Numero vnIndice;

HttpObjeto(vaHTTP);

@ Limpar exceções existentes @
HttpLimpaExcecoesProxy(vaHTTP);

@ Adicionar exceções para serviços internos @
HttpAdicionaExcecaoProxy(vaHTTP, "localhost");
HttpAdicionaExcecaoProxy(vaHTTP, "127.0.0.1");
HttpAdicionaExcecaoProxy(vaHTTP, "api-interna.empresa.com.br");
HttpAdicionaExcecaoProxy(vaHTTP, "10.0.30.25");

@ Verificar quantidade de exceções @
HttpLeContadorExcecoesProxy(vaHTTP, vnQuantidade);
Mensagem(Retorna, "Total de exceções: " + vnQuantidade);

@ Listar todas as exceções @
Para (vnIndice = 0; vnIndice < vnQuantidade; vnIndice++) {
  HttpLeExcecaoProxy(vaHTTP, vnIndice, vaEndereco);
  Mensagem(Retorna, "Exceção " + vnIndice + ": " + vaEndereco);
}

@ Remover uma exceção específica (índice 2) @
HttpExcluiExcecaoProxy(vaHTTP, 2);
```

### Configuração SSL

#### HttpAlteraConfiguracaoSSL / HttpLeConfiguracaoSSL

Controla as configurações SSL/TLS para requisições HTTPS.

**Sintaxe:**

- `HttpAlteraConfiguracaoSSL(Alfa Objeto, Numero SSL);`
- `HttpLeConfiguracaoSSL(Alfa Objeto, Numero end SSL);`

**Valores SSL:**

- 0 = Automático
- 1 = Nunca
- 2 = Sempre

**Exemplo:**

```lsp
Definir Alfa vaHTTP;
Definir Numero vnSSL;

HttpObjeto(vaHTTP);

@ Sempre usar SSL @
HttpAlteraConfiguracaoSSL(vaHTTP, 2);

@ Verificar configuração @
HttpLeConfiguracaoSSL(vaHTTP, vnSSL);
```

### Configuração de Progresso de Download

#### HttpAlteraMostrarProgresso / HttpLeMostrarProgresso

Controla a exibição da barra de progresso durante downloads de arquivos.

**Sintaxe:**

- `HttpAlteraMostrarProgresso(Alfa Objeto, Numero Mostrar);`
- `HttpLeMostrarProgresso(Alfa Objeto, Numero end Mostrar);`

**Parâmetros:**

- `Mostrar`: 0 = Não exibir progresso, 1 = Exibir progresso

**Exemplo Básico:**

```lsp
Definir Alfa vaHTTP;

HttpObjeto(vaHTTP);

@ Habilitar barra de progresso @
HttpAlteraMostrarProgresso(vaHTTP, 1);
```

**Exemplo Completo:**

```lsp
Definir Alfa vaHTTP;
Definir Numero vnMostrarProgresso;

HttpObjeto(vaHTTP);

@ Habilitar barra de progresso para downloads @
HttpAlteraMostrarProgresso(vaHTTP, 1);

@ Verificar configuração atual @
HttpLeMostrarProgresso(vaHTTP, vnMostrarProgresso);

Se (vnMostrarProgresso = 1) {
  Mensagem(Retorna, "Progresso de download habilitado");
}

@ Fazer download com progresso visível @
HttpDownload(vaHTTP, "https://exemplo.com/arquivo-grande.zip", "C:\\Downloads\\arquivo.zip");

@ Desabilitar progresso para próximas operações @
HttpAlteraMostrarProgresso(vaHTTP, 0);
```

**Casos de Uso:**

- **Downloads grandes**: Habilite para mostrar progresso ao usuário
- **Downloads automáticos**: Desabilite para não interromper o fluxo
- **Experiência do usuário**: Use conforme a necessidade de feedback visual

### Configuração SNI (Server Name Indication)

#### HttpHabilitaSNI / HttpDesabilitaSNI

Controla o envio do nome do servidor na requisição HTTPS.

**Sintaxe:**

- `HttpHabilitaSNI(Alfa Objeto);`
- `HttpDesabilitaSNI(Alfa Objeto);`

**Exemplo:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;

HttpObjeto(vaHTTP);

@ Habilitar SNI para sites que exigem @
HttpHabilitaSNI(vaHTTP);

HttpGet(vaHTTP, "https://www.google.com.br/", vaResposta);

@ O nome "google.com.br" será enviado na requisição @
```

**Observações:**

- SNI é desabilitado por padrão
- Necessário para alguns servidores que hospedam múltiplos domínios
- Obrigatório para alguns certificados SSL modernos

### Funções Auxiliares Importantes

As funções HTTP da LSP contam com várias funções auxiliares que permitem controle granular sobre as requisições.

#### Configuração de Cabeçalhos

```lsp
@ Cabeçalhos comuns para APIs REST @
HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept", "application/json");
HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json");
HttpAlteraCabecalhoRequisicao(vaHTTP, "User-Agent", "MeuApp/1.0");
HttpAlteraCabecalhoRequisicao(vaHTTP, "Authorization", "Bearer " + vaToken);

@ Cabeçalhos para cache @
HttpAlteraCabecalhoRequisicao(vaHTTP, "Cache-Control", "no-cache");
HttpAlteraCabecalhoRequisicao(vaHTTP, "Pragma", "no-cache");
```

#### Verificação de Status HTTP

```lsp
HttpLeCodigoResposta(vaHTTP, vnCodigo);

Se (vnCodigo = 200) {
  @ Sucesso @
} Senao Se (vnCodigo = 201) {
  @ Criado com sucesso @
} Senao Se (vnCodigo = 401) {
  @ Não autorizado @
} Senao Se (vnCodigo = 404) {
  @ Não encontrado @
} Senao Se (vnCodigo >= 500) {
  @ Erro do servidor @
} Senao {
  @ Outros erros @
}
```

#### Controle de Erros

```lsp
@ Desabilita exceções automáticas para códigos 4xx/5xx @
HttpDesabilitaErroResposta(vaHTTP);

@ Habilita exceções automáticas (padrão) @
HttpHabilitaErroResposta(vaHTTP);
```

#### Configurações SSL e Proxy

```lsp
@ Para HTTPS sem certificado válido @
HttpHabilitaSNI(vaHTTP);

@ Configurar codificação @
HttpAlteraCodifCaracPadrao(vaHTTP, "utf-8");

@ Configurar proxy se necessário @
HttpAlteraConfiguracaoProxy(vaHTTP, 1, "proxy.exemplo.com", 8080, 1);
```

### Exemplo Completo: Configuração Corporativa

Aqui está um exemplo abrangente mostrando como configurar um objeto HTTP para um ambiente corporativo:

```lsp
Definir Funcao configurarHttpCorporativo();
Definir Funcao exemploRequisicaoCompleta();

configurarHttpCorporativo();
exemploRequisicaoCompleta();

Funcao configurarHttpCorporativo(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaResposta;
  Definir Numero vnStatus;
  
  @ Criar objeto HTTP @
  HttpObjeto(vaHTTP);
  
  @ Configurar proxy corporativo @
  HttpAlteraConfiguracaoProxy(vaHTTP, 1, "proxy.empresa.com.br", 8080, 1);
  
  @ Adicionar exceções de proxy para serviços internos @
  HttpAdicionaExcecaoProxy(vaHTTP, "localhost");
  HttpAdicionaExcecaoProxy(vaHTTP, "127.0.0.1");
  HttpAdicionaExcecaoProxy(vaHTTP, "api-interna.empresa.com.br");
  
  @ Configurar SSL @
  HttpAlteraConfiguracaoSSL(vaHTTP, 2); @ Sempre usar SSL @
  HttpHabilitaSNI(vaHTTP);
  
  @ Configurar codificação @
  HttpAlteraCodifCaracPadrao(vaHTTP, "utf-8");
  
  @ Configurar redirecionamentos @
  HttpAlteraRedirecionamento(vaHTTP, 1);
  
  @ Habilitar cookies para sessões @
  HttpHabilitarCookies(vaHTTP);
  
  @ Configurar normalização Unicode @
  HttpNormalizaRetorno(vaHTTP);
  
  @ Configurar timeout @
  HttpSetaTimeout(vaHTTP, 60);
  
  @ Desabilitar erros automáticos para controle manual @
  HttpDesabilitaErroResposta(vaHTTP);
  
  @ Configurar cabeçalhos padrão @
  HttpAlteraCabecalhoRequisicao(vaHTTP, "User-Agent", "SistemaCorporativo/1.0");
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept", "application/json");
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Cache-Control", "no-cache");
  
  @ Exemplo de requisição com toda configuração @
  HttpGet(vaHTTP, "https://api.externa.com/dados", vaResposta);
  
  @ Verificar resultado @
  HttpLeCodigoResposta(vaHTTP, vnStatus);
  Se (vnStatus = 200) {
    Mensagem(Retorna, "Configuração corporativa funcionando!");
  } Senao {
    Mensagem(Erro, "Erro na configuração. Status: " + vnStatus);
  }
}

Funcao exemploRequisicaoCompleta(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaResposta;
  Definir Alfa vaContentType;
  Definir Alfa vaServer;
  Definir Numero vnStatus;
  
  HttpObjeto(vaHTTP);
  
  @ Upload de arquivo com configuração completa @
  HttpSetAttachment(vaHTTP, "C:\\temp\\relatorio.pdf");
  HttpAlteraCabecalhoRequisicao(vaHTTP, "Authorization", "Bearer token123");
  HttpAlteraCabecalhoRequisicao(vaHTTP, "X-Upload-Type", "document");
  
  HttpPost(vaHTTP, "https://api.exemplo.com/upload", "", vaResposta);
  
  @ Analisar resposta @
  HttpLeCodigoResposta(vaHTTP, vnStatus);
  HttpLeCabecalhoResposta(vaHTTP, "Content-Type", vaContentType);
  HttpLeCabecalhoResposta(vaHTTP, "Server", vaServer);
  
  Se (vnStatus = 201) {
    Mensagem(Retorna, "Upload realizado com sucesso!");
    Mensagem(Retorna, "Servidor: " + vaServer);
  } Senao {
    Mensagem(Erro, "Falha no upload. Status: " + vnStatus);
  }
}
```

### Boas Práticas

✅ **Sempre configure timeouts** para evitar travamentos em requisições lentas
✅ **Use HttpDesabilitaErroResposta** para controle manual de erros HTTP
✅ **Configure cabeçalhos adequados** para cada tipo de API (Accept, Content-Type, etc.)
✅ **Valide códigos de status HTTP** antes de processar respostas
✅ **Use HTTPS** sempre que possível para garantir segurança
✅ **Trate erros de rede** adequadamente com mensagens claras
✅ **Para arquivos grandes**, use `HttpDownload` em vez de `HttpGet`
✅ **Mantenha credenciais seguras** e nunca faça hardcode em produção
✅ **Use Base64Encode/Base64Decode** para autenticação básica e decodificação de tokens
✅ **Configure User-Agent** para identificar sua aplicação
✅ **Configure proxy adequadamente** em ambientes corporativos
✅ **Use exceções de proxy** para acessos internos sem proxy
✅ **Habilite SNI** para sites que requerem certificados modernos
✅ **Configure codificação UTF-8** para suporte internacional
✅ **Use cookies** para manter sessões em aplicações web

### Códigos de Status HTTP Comuns

| Código | Significado | Uso Típico |
|--------|-------------|------------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 204 | No Content | Sucesso sem conteúdo de retorno |
| 400 | Bad Request | Requisição inválida ou malformada |
| 401 | Unauthorized | Autenticação necessária |
| 403 | Forbidden | Acesso negado |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito no estado do recurso |
| 422 | Unprocessable Entity | Dados inválidos |
| 500 | Internal Server Error | Erro interno do servidor |
| 502 | Bad Gateway | Erro de gateway |
| 503 | Service Unavailable | Serviço temporariamente indisponível |

### Observações Importantes

#### **Codificação e Caracteres**

- **Codificação padrão**: windows-1252. Para UTF-8, use `HttpAlteraCodifCaracPadrao(vaHTTP, "utf-8")`
- **Caracteres especiais**: Evite caracteres como `|` em URLs em alguns sistemas Senior
- **Unicode**: Use `HttpNormalizaRetorno` para normalizar caracteres acentuados
- **Codificações suportadas**: UTF-8, ISO-8859-1, Windows-1252

#### **SSL/TLS e Certificados**

- **SNI**: Use `HttpHabilitaSNI` para sites que requerem certificados modernos
- **Configuração SSL**: 0=Automático, 1=Nunca, 2=Sempre
- **HTTPS**: Sempre prefira HTTPS para segurança em produção

#### **Proxy e Rede**

- **Ambientes corporativos**: Configure proxy com `HttpAlteraConfiguracaoProxy`
- **Exceções de proxy**: Use `HttpAdicionaExcecaoProxy` para serviços internos
- **Redirecionamentos**: Habilite com `HttpAlteraRedirecionamento(vaHTTP, 1)`

#### **Upload e Download**

- **Upload de arquivos**: Use `HttpSetAttachment` para anexar arquivos
- **Download de arquivos grandes**: Prefira `HttpDownload` em vez de `HttpGet`
- **Formatos suportados**: POST/PUT/PATCH são limitados a formato texto
- **Múltiplos arquivos**: Faça requisições separadas para cada arquivo

#### **Sessões e Cookies**

- **Manter sessão**: Use `HttpHabilitarCookies` para login automático
- **Segurança**: Desabilite cookies quando não necessários
- **Persistência**: Cookies são mantidos durante toda a sessão do objeto HTTP

#### **Cabeçalhos e Respostas**

- **Content-Type**: Configure corretamente (application/json, application/x-www-form-urlencoded)
- **Leitura de cabeçalhos**: Use `HttpLeCabecalhoResposta` após requisições
- **User-Agent**: Sempre identifique sua aplicação
- **Authorization**: Use Base64Encode para autenticação básica
- **Tokens**: Use Base64Decode para decodificar tokens JWT recebidos

#### **Tratamento de Erros**

- **Controle manual**: Use `HttpDesabilitaErroResposta` para tratar erros manualmente
- **Verificação de status**: Sempre verifique códigos HTTP antes de processar
- **Timeouts**: Configure valores apropriados baseados na velocidade esperada
- **Logs**: Implemente logging adequado para depuração

#### **Performance e Boas Práticas**

- **Timeouts**: Configure sempre para evitar travamentos
- **Reutilização**: Um objeto HTTP pode ser reutilizado para múltiplas requisições
- **Conexões**: LSP gerencia automaticamente o pool de conexões
- **Cache**: Configure cabeçalhos Cache-Control adequadamente

### Manipulação de JSON

#### ValorElementoJson

Esta função serve para ler o valor de um campo específico de um arquivo JSON.

**Sintaxe:**

```lsp
ValorElementoJson(Alfa aJson, Alfa aGrupo, Alfa aElemento, Alfa End aValor);
```

**Parâmetros:**

| Nome | Tipo | Descrição |
|------|------|-----------|
| `aJson` | Alfa | Recebe o conteúdo de um arquivo JSON |
| `aGrupo` | Alfa | Recebe os grupos que devem ser posicionados para ler o elemento do JSON (os grupos devem ser separados por ";") |
| `aElemento` | Alfa | Recebe o campo a ser lido do JSON |
| `aValor` | Alfa | Variável alfanumérica que recebe o valor do campo lido do JSON |

**Exemplo Básico:**

```lsp
Definir Alfa vaJSON;
Definir Alfa vaId;
Definir Alfa vaNome;

vaJSON = "{\"usuario\": {\"id\": 123, \"nome\": \"João Silva\"}}";

@ Extrair o elemento "id" do grupo "usuario" @
ValorElementoJson(vaJSON, "usuario", "id", vaId);
@ vaId será "123" @

@ Extrair o elemento "nome" do grupo "usuario" @
ValorElementoJson(vaJSON, "usuario", "nome", vaNome);
@ vaNome será "João Silva" @

```

**Exemplo Prático com JSON Complexo:**

```lsp
Definir Funcao processarJSONComplexo(); {
  Definir Alfa vaJSON;
  Definir Alfa vaNomeEmpresa;
  Definir Alfa vaPais;
  Definir Alfa vaEstado;
  Definir Alfa vaCidade;
  Definir Alfa vaBairro;
  Definir Alfa vaRua;
  Definir Alfa vaNumero;
  Definir Alfa vaDepartamento;
  Definir Alfa vaProjeto;
  Definir Alfa vaVersao;
  Definir Alfa vaRetorno;

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
                                }                                                          \
                              ]                                                            \
                            }                                                              \
                          ]                                                                \
                        }                                                                  \
                }                                                                    \
          }";

  @ Extrair dados da empresa @
  ValorElementoJson(vaJSON, "resultado;empresa", "nome", vaNomeEmpresa);
  
  @ Extrair dados de localização (múltiplos níveis separados por ";") @
  ValorElementoJson(vaJSON, "resultado;empresa;localizacao", "pais", vaPais);
  ValorElementoJson(vaJSON, "resultado;empresa;localizacao", "estado", vaEstado);
  ValorElementoJson(vaJSON, "resultado;empresa;localizacao;cidade", "nome", vaCidade);
  ValorElementoJson(vaJSON, "resultado;empresa;localizacao;cidade;bairro", "nome", vaBairro);
  ValorElementoJson(vaJSON, "resultado;empresa;localizacao;cidade;bairro;rua", "nome", vaRua);
  ValorElementoJson(vaJSON, "resultado;empresa;localizacao;cidade;bairro;rua", "numero", vaNumero);
  
  @ Extrair dados do departamento (primeiro elemento do array) @
  ValorElementoJson(vaJSON, "resultado;empresa;departamentos", "nome", vaDepartamento);
  
  @ Extrair dados do projeto (primeiro elemento do array aninhado) @
  ValorElementoJson(vaJSON, "resultado;empresa;departamentos;projetos", "nome", vaProjeto);
  ValorElementoJson(vaJSON, "resultado;empresa;departamentos;projetos", "versao", vaVersao);

  vaRetorno = "Empresa: " + vaNomeEmpresa + "\n" +
               "Localização: " + vaCidade + " - " + vaEstado + " - " + vaPais + "\n" +
               "Endereço: " + vaRua + ", " + vaNumero + " - " + vaBairro + "\n" +
               "Departamento: " + vaDepartamento + "\n" +
               "Projeto: " + vaProjeto + " v" + vaVersao;

  Mensagem(Retorna, vaRetorno);
}
```

**Exemplo Prático com API:**

```lsp
Funcao processarRespostaAPI(); {
  Definir Alfa vaHTTP;
  Definir Alfa vaJSON;
  Definir Alfa vaStatus;
  Definir Alfa vaMensagem;
  Definir Alfa vaUsuario;
  
  HttpObjeto(vaHTTP);
  HttpGet(vaHTTP, "https://reqres.in/api/users/2", vaJSON);
  
  @ JSON retornado: {"data":{"id":2,"email":"janet.weaver@reqres.in","first_name":"Janet","last_name":"Weaver"},"support":{"url":"https://reqres.in/#support-heading","text":"To keep ReqRes free..."}} @
  
  @ Extrair dados do usuário @
  ValorElementoJson(vaJSON, "data", "first_name", vaUsuario);
  ValorElementoJson(vaJSON, "data", "email", vaStatus);
  
  vaMensagem = "Usuário: " + vaUsuario + " - Email: " + vaStatus;
  Mensagem(Retorna, vaMensagem);
}
```

**Observações Importantes:**

1. **Parâmetro de Grupo**: Para acessar elementos em níveis aninhados, use ponto e vírgula (;) para separar os grupos. Por exemplo: `"resultado;empresa;localizacao"` para acessar o grupo `localizacao` que está dentro de `empresa`, que por sua vez está dentro de `resultado`.

2. **Arrays**: A função não consegue percorrer arrays automaticamente. Ela sempre encontra apenas a primeira ocorrência do elemento especificado.

3. **Notação de Ponto**: Não é possível usar a notação de ponto (.) como em outras linguagens. Por exemplo: `resultado.empresa.nome` não funciona.

4. **Índices de Array**: Não é possível acessar elementos de array pelo índice. Por exemplo: `resultado[0]` ou `resultado[1]` não funcionam.

5. **Case Sensitive**: Os nomes dos grupos e elementos são sensíveis a maiúsculas e minúsculas. Certifique-se de usar exatamente a mesma grafia que está no JSON.
