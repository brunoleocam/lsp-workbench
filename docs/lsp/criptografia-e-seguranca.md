# Criptografia e Segurança

A LSP oferece um conjunto robusto de funções para operações criptográficas, geração de tokens seguros e proteção de dados sensíveis.

### Funções de Hash

#### GeraHash

Gera um hash criptográfico de um texto usando diferentes algoritmos.

**Sintaxe:**

```lsp
GeraHash(<texto>, <algoritmo>, <hash>);
```

**Algoritmos Suportados:**

- `1`: MD5 (128 bits)
- `2`: SHA-1 (160 bits)
- `3`: SHA-256 (256 bits)
- `4`: SHA-512 (512 bits)

**Exemplo de Verificação de Integridade:**

```lsp
Definir Alfa vaTextoOriginal;
Definir Alfa vaHashMD5;
Definir Alfa vaHashSHA256;
Definir Alfa vaMensagem;

vaTextoOriginal = "dados importantes do sistema";

@ Gera hash MD5 @
GeraHash(vaTextoOriginal, 1, vaHashMD5);

@ Gera hash SHA-256 (recomendado) @
GeraHash(vaTextoOriginal, 3, vaHashSHA256);

vaMensagem = "Hash SHA-256: " + vaHashSHA256;
Mensagem(Retorna, vaMensagem);
```

### Criptografia de Dados

#### Encriptar

Criptografa uma cadeia de caracteres usando algoritmo interno da Senior.

**Sintaxe:**

```lsp
Encriptar(<textoOriginal>, <textoCriptografado>);
```

#### Desencriptar

Descriptografa uma cadeia de caracteres previamente criptografada.

**Sintaxe:**

```lsp
Desencriptar(<textoCriptografado>, <textoOriginal>);
```

**Exemplo de Proteção de Dados:**

```lsp
Definir Funcao protegerDadosSensiveis();

@ Variáveis globais @
Definir Alfa vaDadosSensiveis;
Definir Alfa vaDadosCriptografados;
Definir Alfa vaDadosRecuperados;

vaDadosSensiveis = "CPF:12345678901;SENHA:minhasenha123";

protegerDadosSensiveis();

Funcao protegerDadosSensiveis(); {
  Definir Alfa vaMensagem;
  @ Criptografa dados @
  Encriptar(vaDadosSensiveis, vaDadosCriptografados);
  vaMensagem = "Dados criptografados: " + vaDadosCriptografados;
  Mensagem(Retorna, vaMensagem);

  @ Descriptografa para uso @
  Desencriptar(vaDadosCriptografados, vaDadosRecuperados);
  
  @ Verifica integridade @
  Se (vaDadosRecuperados = vaDadosSensiveis) {
    Mensagem(Retorna, "Dados recuperados com sucesso!");
  } Senao {
    Mensagem(Erro, "Erro na integridade dos dados!");
  }
}
```

### Geração de Tokens e Nonces

#### GerarNonce

Gera um valor Nonce (número aleatório usado uma única vez).

**Sintaxe:**

```lsp
GerarNonce(<nonce>);
```

#### GeraToken

Gera um token criptográfico seguro.

**Sintaxe:**

```lsp
GeraToken(<tamanho>, <token>);
```

#### GeraSenha

Gera uma senha aleatória com caracteres alfanuméricos.

**Sintaxe:**

```lsp
GeraSenha(<tamanho>, <senha>);
```

**Exemplo de Sistema de Autenticação:**

```lsp
Definir Funcao criarSessaoSegura();

@ Variáveis globais @
Definir Alfa vaUsuario;
Definir Alfa vaNonce;
Definir Alfa vaTokenSessao;
Definir Alfa vaSenhaTemporaria;
Definir Alfa vaChaveSeguranca;

vaUsuario = "joao.silva";

criarSessaoSegura();

Funcao criarSessaoSegura(); {
  Definir Alfa vaMensagem;

  @ 1. Gera nonce para a sessão @
  GerarNonce(vaNonce);

  @ 2. Gera token de sessão @
  GeraToken(32, vaTokenSessao);

  @ 3. Gera senha temporária @
  GeraSenha(12, vaSenhaTemporaria);

  @ 4. Cria chave de segurança combinada @
  vaChaveSeguranca = vaUsuario + ":" + vaNonce + ":" + vaTokenSessao;
  
  @ 5. Registra sessão @
  vaMensagem = "Sessão criada para: " + vaUsuario;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Token: " + vaTokenSessao;
  Mensagem(Retorna, vaMensagem);
  vaMensagem = "Senha temporária: " + vaSenhaTemporaria;
  Mensagem(Retorna, vaMensagem);
}
```

### WS-Security e Digest

#### GerarPwdDigest

Gera o Digest da senha para autenticação WS-Security.

**Sintaxe:**

```lsp
GerarPwdDigest(<nonce>, <created>, <senha>, <digest>);
```

**Exemplo de Autenticação WS-Security:**

```lsp
Definir Funcao autenticacaoWSecurity();

@ Variáveis globais @
Definir Alfa vaNonce;
Definir Alfa vaCreated;
Definir Alfa vaSenha;
Definir Alfa vaDigest;
Definir Alfa vaXMLSecurity;

vaSenha = "minhasenhasecreta";

autenticacaoWSecurity();

Funcao autenticacaoWSecurity(); {
  @ 1. Gera nonce @
  GerarNonce(vaNonce);

  @ 2. Data/hora atual formatada para WS-Security @
  Definir Numero vnDataHora;
  DataHora(vnDataHora);
  FormatarData(vnDataHora, "yyyy-MM-ddTHH:mm:ssZ", vaCreated);

  @ 3. Gera digest @
  GerarPwdDigest(vaNonce, vaCreated, vaSenha, vaDigest);

  @ 4. Monta XML de segurança @
  vaXMLSecurity = "<wsse:Security>";
  vaXMLSecurity = vaXMLSecurity + "<wsse:UsernameToken>";
  vaXMLSecurity = vaXMLSecurity + "<wsse:Username>usuario</wsse:Username>";
  vaXMLSecurity = vaXMLSecurity + "<wsse:Password Type=\"PasswordDigest\">";
  vaXMLSecurity = vaXMLSecurity + vaDigest + "</wsse:Password>";
  vaXMLSecurity = vaXMLSecurity + "<wsse:Nonce>" + vaNonce + "</wsse:Nonce>";
  vaXMLSecurity = vaXMLSecurity + "<wsu:Created>" + vaCreated + "</wsu:Created>";
  vaXMLSecurity = vaXMLSecurity + "</wsse:UsernameToken>";
  vaXMLSecurity = vaXMLSecurity + "</wsse:Security>";

  Mensagem(Retorna, "XML WS-Security gerado com sucesso!");
}
```

### Codificação Base64

#### Base64Encode

Codifica uma string em Base64.

**Sintaxe:**

```lsp
Base64Encode(<textoOriginal>, <textoBase64>);
```

#### Base64Decode

Decodifica uma string Base64.

**Sintaxe:**

```lsp
Base64Decode(<textoBase64>, <textoOriginal>);
```

**Exemplo de Transmissão Segura:**

```lsp
Definir Funcao transmitirDadosSeguro();

@ Variáveis globais @
Definir Alfa vaDados;
Definir Alfa vaDadosCriptografados;
Definir Alfa vaDadosBase64;
Definir Alfa vaDadosRecebidos;
Definir Alfa vaDadosOriginais;

vaDados = "Informação confidencial da empresa";

transmitirDadosSeguro();

Funcao transmitirDadosSeguro(); {
  @ 1. Criptografa os dados @
  Encriptar(vaDados, vaDadosCriptografados);

  @ 2. Codifica em Base64 para transmissão @
  Base64Encode(vaDadosCriptografados, vaDadosBase64);
  Mensagem(Retorna, "Dados preparados para transmissão");

  @ Simulação de recebimento @
  @ 3. Decodifica Base64 @
  Base64Decode(vaDadosBase64, vaDadosRecebidos);

  @ 4. Descriptografa @
  Desencriptar(vaDadosRecebidos, vaDadosOriginais);

  @ 5. Verifica integridade @
  Se (vaDadosOriginais = vaDados) {
    Mensagem(Retorna, " Transmissão segura concluída!");
  } Senao {
    Mensagem(Erro, "Falha na integridade dos dados!");
  }
}
```
