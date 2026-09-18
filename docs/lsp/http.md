# Chamada HTTP

A LSP oferece um conjunto robusto de funções para realizar requisições HTTP/HTTPS, permitindo integração com APIs REST, web services e outros endpoints HTTP. Estas funções suportam todos os métodos HTTP principais e oferecem controle granular sobre cabeçalhos, timeouts e tratamento de respostas.

### Visão Geral das Funções HTTP

| Função | Descrição |
|--------|-----------|
| **Métodos HTTP Principais** | |
| HttpGet | Executa requisições GET para obter dados |
| HttpPost | Executa requisições POST para enviar dados |
| HttpPut | Executa requisições PUT para atualizar recursos |
| HttpPatch | Executa requisições PATCH para modificações parciais |
| HttpDelete | Executa requisições DELETE para remover recursos |
| HttpDeleteBody | Executa requisições DELETE com corpo da mensagem |
| HttpDownload | Faz download de arquivos diretamente para disco |
| **Configuração e Upload** | |
| HttpSetAttachment | Anexa arquivos locais ao corpo da requisição |
| HttpAlteraCabecalhoRequisicao | Configura cabeçalhos HTTP personalizados |
| HttpAlteraCodifCaracPadrao | Define codificação de caracteres padrão |
| HttpAlteraRedirecionamento | Controla tratamento de redirecionamentos |
| HttpSetaTimeout | Define timeout para requisições |
| **Gerenciamento de Sessão** | |
| HttpHabilitarCookies | Habilita armazenamento automático de cookies |
| HttpDesabilitarCookies | Desabilita armazenamento de cookies |
| **Leitura de Respostas** | |
| HttpLeCabecalhoResposta | Obtém cabeçalhos de resposta do servidor |
| HttpLeCodigoResposta | Consulta código de status da resposta |
| HttpNormalizaRetorno | Normaliza caracteres Unicode em respostas |
| **Configuração de Proxy** | |
| HttpAlteraConfiguracaoProxy | Configura definições de servidor proxy |
| HttpLeConfiguracaoProxy | Lê configurações atuais de proxy |
| **Configuração SSL/TLS** | |
| HttpAlteraConfiguracaoSSL | Configura opções SSL/TLS |
| HttpLeConfiguracaoSSL | Lê configurações SSL atuais |
| HttpHabilitaSNI | Habilita Server Name Indication |
| HttpDesabilitaSNI | Desabilita Server Name Indication |
| **Utilitários** | |
| HttpObjeto | Cria objeto HTTP com configurações padrão |
| HttpDesabilitaErroResposta | Desabilita erros automáticos HTTP |
| HttpHabilitaErroResposta | Habilita erros automáticos HTTP |
| Base64Encode | Codifica strings em Base64 para autenticação |
| Base64Decode | Decodifica strings Base64 de volta para texto |

### Configuração Inicial

Antes de realizar qualquer requisição HTTP, é necessário criar um objeto HTTP:

```lsp
Definir Alfa vaHTTP;
HttpObjeto(vaHTTP);
```

### **Importante: Configurações e Limitações HTTP**

#### **Configurações de Acesso**

As funções que executam requisições (HttpGet, HttpPost, HttpPut, HttpPatch, HttpDelete e HttpDownload) necessitam de um **HttpObjeto** que contenha as configurações de acesso como:

- Servidor proxy
- Configurações SSL/TLS
- Codificação de caracteres
- Timeouts
- Cookies

#### **Formas de Configurar:**

1. **🌐 Central de Configurações Senior**
   - Configure na tela "Configurações de Internet"
   - Aplicadas automaticamente para todos os objetos HTTP

2. **💻 Dentro da regra LSP**
   - Configure programaticamente usando as funções de manipulação
   - Alterações feitas apenas **em memória** no objeto HTTP específico
   - Sobrescreve as configurações da Central de Configurações

#### **Limitações Importantes:**

- **Certificados digitais**: As funções HTTP LSP **NÃO oferecem suporte** ao uso de certificados digitais
- **Parâmetros suportados**: Apenas parâmetros que compõem as requisições (headers, content-type, autenticação básica, etc.)

**Exemplo de configuração programática:**

```lsp
Definir Alfa vaHTTP;

HttpObjeto(vaHTTP);

@ Configurações específicas para esta requisição @
HttpAlteraConfiguracaoProxy(vaHTTP, 1, "proxy.empresa.com", 8080, 1);
HttpAlteraConfiguracaoSSL(vaHTTP, 2); @ Sempre SSL @
HttpAlteraCodifCaracPadrao(vaHTTP, "utf-8");
HttpSetaTimeout(vaHTTP, 30);

@ Essas configurações só afetam este objeto vaHTTP @
HttpGet(vaHTTP, "https://api.exemplo.com/dados", vaResposta);
```

### HttpGet

Executa uma requisição HTTP GET para obter dados de um servidor. É o método mais utilizado para consulta de dados em APIs REST.

**Sintaxe:** `HttpGet(Alfa Objeto, Alfa URL, Alfa end HTML);`

**Parâmetros:**

- `Objeto`: Objeto HTTP criado com HttpObjeto
- `URL`: URL completa do endpoint (deve incluir http:// ou https://)
- `HTML`: Variável que receberá a resposta do servidor

**Exemplo Básico:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;

HttpObjeto(vaHTTP);
HttpGet(vaHTTP, "https://www.senior.com.br/index.htm", vaResposta);
Mensagem(Retorna, vaResposta);
```

**Exemplo com Cabeçalhos Personalizados:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;

HttpObjeto(vaHTTP);

@ Configurar cabeçalhos @
HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept", "application/json");
HttpAlteraCabecalhoRequisicao(vaHTTP, "User-Agent", "SeniorApp/1.0");
HttpAlteraCabecalhoRequisicao(vaHTTP, "Authorization", "Bearer token123");

HttpGet(vaHTTP, "https://api.exemplo.com/dados", vaResposta);
```

**Exemplo com Verificação de Status:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;
Definir Numero vnStatus;

HttpObjeto(vaHTTP);
HttpDesabilitaErroResposta(vaHTTP);

HttpGet(vaHTTP, "https://api.exemplo.com/usuarios", vaResposta);
HttpLeCodigoResposta(vaHTTP, vnStatus);

Se (vnStatus = 200) {
  @ Processar resposta @
  Mensagem(Retorna, "Dados recebidos com sucesso!");
} Senao {
  @ Tratar erro @
  Mensagem(Erro, "Erro na requisição. Status: " + vnStatus);
}
```

**Observações:**

- Sempre informe a URL completa com protocolo (http:// ou https://)
- Para HTTPS sem certificado, use `HttpHabilitaSNI(vaHTTP)` antes da requisição
- Caracteres especiais na URL podem causar erros em alguns sistemas
- Use `HttpDesabilitaErroResposta` para controle manual de erros

### HttpPost

Executa uma requisição HTTP POST para enviar dados ao servidor. Utilizado para criação de recursos, envio de formulários e dados em geral.

**Sintaxe:** `HttpPost(Alfa Objeto, Alfa URL, Alfa Dados, Alfa end HTML);`

**Parâmetros:**

- `Objeto`: Objeto HTTP criado com HttpObjeto
- `URL`: URL do endpoint
- `Dados`: Dados a serem enviados no corpo da requisição
- `HTML`: Variável que receberá a resposta

**Exemplo com Dados de Formulário:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;
Definir Alfa vaDados;

HttpObjeto(vaHTTP);

@ Dados no formato application/x-www-form-urlencoded @
vaDados = "NomeUsuario=SENIOR&EmailUsuario=senior@senior.com.br&Texto=SENIOR+SA";

HttpPost(vaHTTP, "https://www.senior.com.br/cadastro.html", vaDados, vaResposta);
Mensagem(Retorna, vaResposta);
```

**Exemplo com JSON:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;
Definir Alfa vaDados;

HttpObjeto(vaHTTP);

@ Configurar para JSON @
HttpAlteraCabecalhoRequisicao(vaHTTP, "Accept", "text/plain");
HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json");

@ Dados em formato JSON @
vaDados = "{\"NomeParametro1\": \"valor1\", \"NomeParametro2\": \"valor2\"}";

HttpPost(vaHTTP, "https://exemplo.com/app/path", vaDados, vaResposta);
```

**Exemplo com Autenticação:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;
Definir Alfa vaDados;
Definir Alfa vaToken;

HttpObjeto(vaHTTP);

@ Configurar autenticação @
vaToken = "Bearer seu_token_aqui";
HttpAlteraCabecalhoRequisicao(vaHTTP, "Authorization", vaToken);
HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json");

vaDados = "{\"nome\": \"João\", \"email\": \"joao@exemplo.com\"}";
HttpPost(vaHTTP, "https://api.exemplo.com/usuarios", vaDados, vaResposta);
```

**Observações:**

- O Content-Type padrão é `application/x-www-form-urlencoded; charset=windows-1252`
- Para JSON, sempre configure `Content-Type: application/json`
- Para UTF-8, configure explicitamente com `HttpAlteraCodifCaracPadrao`
- Quando usar JSON, os dados devem estar no formato correto, caso contrário retornará erro 400

### HttpPut

Executa uma requisição HTTP PUT para atualizar recursos existentes. Usado para modificar dados de um recurso específico.

**Sintaxe:** `HttpPut(Alfa Objeto, Alfa URL, Alfa Dados, Alfa end HTML);`

**Parâmetros:**

- `Objeto`: Objeto HTTP criado com HttpObjeto
- `URL`: URL do recurso a ser atualizado
- `Dados`: Dados de atualização
- `HTML`: Variável que receberá a resposta

**Exemplo Básico:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;
Definir Alfa vaDados;

HttpObjeto(vaHTTP);

vaDados = "NomeUsuario=SENIOR&EmailUsuario=senior@senior.com.br&Texto=SENIOR+SA";
HttpPut(vaHTTP, "https://www.senior.com.br/cadastro.html", vaDados, vaResposta);
Mensagem(Retorna, vaResposta);
```

**Exemplo com JSON:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;
Definir Alfa vaDados;

HttpObjeto(vaHTTP);

@ Configurar cabeçalhos @
HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json");
HttpAlteraCabecalhoRequisicao(vaHTTP, "Authorization", "Bearer token123");

@ Dados para atualização @
vaDados = "{\"nome\": \"João Silva\", \"status\": \"ativo\", \"email\": \"joao.silva@exemplo.com\"}";

HttpPut(vaHTTP, "https://api.exemplo.com/usuarios/123", vaDados, vaResposta);
```

**Observações:**

- PUT é usado para atualização completa de recursos
- Só suporta formato texto, não arquivos binários
- Sempre inclua todos os campos necessários do recurso

### HttpDelete

Executa uma requisição HTTP DELETE para remover recursos. Usado para exclusão de dados específicos.

**Sintaxe:** `HttpDelete(Alfa Objeto, Alfa URL, Alfa end HTML);`

**Parâmetros:**

- `Objeto`: Objeto HTTP criado com HttpObjeto
- `URL`: URL do recurso a ser removido
- `HTML`: Variável que receberá a resposta

**Exemplo Básico:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;

HttpObjeto(vaHTTP);

HttpDelete(vaHTTP, "https://www.senior.com.br/registro/1", vaResposta);
Mensagem(Retorna, vaResposta);
```

**Exemplo com Autenticação:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;
Definir Numero vnStatus;

HttpObjeto(vaHTTP);
HttpDesabilitaErroResposta(vaHTTP);

@ Configurar autenticação @
HttpAlteraCabecalhoRequisicao(vaHTTP, "Authorization", "Bearer token123");

HttpDelete(vaHTTP, "https://api.exemplo.com/usuarios/123", vaResposta);

@ Verificar resultado @
HttpLeCodigoResposta(vaHTTP, vnStatus);
Se (vnStatus = 204) {
  Mensagem(Retorna, "Usuário excluído com sucesso!");
} Senao {
  Mensagem(Erro, "Erro ao excluir usuário. Status: " + vnStatus);
}
```

### HttpDeleteBody

Executa uma requisição HTTP DELETE com dados no corpo da mensagem. Útil para exclusões em lote ou com parâmetros específicos.

**Sintaxe:** `HttpDeleteBody(Alfa Objeto, Alfa URL, Alfa Dados, Alfa end HTML);`

**Parâmetros:**

- `Objeto`: Objeto HTTP criado com HttpObjeto
- `URL`: URL do endpoint
- `Dados`: Dados a serem enviados no corpo
- `HTML`: Variável que receberá a resposta

**Exemplo Básico:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;
Definir Alfa vaDados;

HttpObjeto(vaHTTP);

vaDados = "[{\"id\": \"123\"}]";
HttpDeleteBody(vaHTTP, "https://www.senior.com.br/registro", vaDados, vaResposta);
Mensagem(Retorna, vaResposta);
```

**Exemplo com Múltiplos IDs:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;
Definir Alfa vaDados;

HttpObjeto(vaHTTP);

@ Configurar cabeçalhos @
HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json");
HttpAlteraCabecalhoRequisicao(vaHTTP, "Authorization", "Bearer token123");

@ Lista de IDs para exclusão em lote @
vaDados = "[{\"id\": \"123\"}, {\"id\": \"456\"}, {\"id\": \"789\"}]";

HttpDeleteBody(vaHTTP, "https://api.exemplo.com/usuarios/lote", vaDados, vaResposta);
```

### HttpDownload

Faz download de arquivos diretamente para o disco, sem carregar na memória. Ideal para arquivos grandes.

**Sintaxe:** `HttpDownload(Alfa Objeto, Alfa URL, Alfa Arquivo);`

**Parâmetros:**
- `Objeto`: Objeto HTTP criado com HttpObjeto
- `URL`: URL do arquivo para download
- `Arquivo`: Caminho completo onde salvar o arquivo

**Exemplo Básico:**

```lsp
Definir Alfa vaHTTP;

HttpObjeto(vaHTTP);
HttpDownload(vaHTTP, "https://www.senior.com.br/product.zip", "C:\\Senior\\product.zip");
```

**Exemplo com Verificação:**

```lsp
Definir Alfa vaHTTP;
Definir Numero vnStatus;
Definir Alfa vaCaminho;

HttpObjeto(vaHTTP);
HttpDesabilitaErroResposta(vaHTTP);

vaCaminho = "C:\\Downloads\\relatorio.pdf";
HttpDownload(vaHTTP, "https://exemplo.com/relatorio.pdf", vaCaminho);

HttpLeCodigoResposta(vaHTTP, vnStatus);
Se (vnStatus = 200) {
  Mensagem(Retorna, "Download concluído: " + vaCaminho);
} Senao {
  Mensagem(Erro, "Erro no download. Status: " + vnStatus);
}
```

**Observações:**

- Funciona como HttpGet, mas salva diretamente em arquivo
- Recomendado para arquivos grandes para evitar consumo excessivo de memória
- O diretório de destino deve existir

### HttpSetaTimeout

Define um timeout (tempo limite) para requisições HTTP. Evita travamentos em requisições lentas.

**Sintaxe:** `HttpSetaTimeout(Alfa Objeto, Numero Timeout);`

**Parâmetros:**

- `Objeto`: Objeto HTTP criado com HttpObjeto
- `Timeout`: Tempo limite em segundos

**Exemplo Básico:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;

HttpObjeto(vaHTTP);

@ Definir timeout de 5 segundos @
HttpSetaTimeout(vaHTTP, 5);

HttpGet(vaHTTP, "https://httpstat.us/200?sleep=4000", vaResposta);
Mensagem(Retorna, vaResposta);
```

**Exemplo com Diferentes Timeouts:**

```lsp
Definir Alfa vaHTTP;
Definir Alfa vaResposta;

HttpObjeto(vaHTTP);

@ Para APIs rápidas - timeout baixo @
HttpSetaTimeout(vaHTTP, 10);
HttpGet(vaHTTP, "https://api-rapida.exemplo.com/dados", vaResposta);

@ Para APIs lentas - timeout maior @
HttpSetaTimeout(vaHTTP, 120);
HttpGet(vaHTTP, "https://api-lenta.exemplo.com/relatorio", vaResposta);
```
