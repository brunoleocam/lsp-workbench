# Funções Adicionais de Manipulação de Strings

### RetornaAscII

Retorna o caracter ASCII correspondente a um número.

**Sintaxe:**

```lsp
RetornaAscII(<xNumero>, <xCarAscII>);
```

**Parâmetros:**

- `xNumero`: Variável tipo Numero da qual se quer o retorno em ASCII
- `xCarAscII`: Variável Alfa que retorna o caracter ASCII correspondente ao número

**Exemplo:**

```lsp
Definir Funcao exemploRetornaAscII();

@ Variáveis globais @
Definir Numero vnCodigo;
Definir Alfa vaCaracter;
Definir Alfa vaMensagem;

exemploRetornaAscII();

Funcao exemploRetornaAscII(); {
  @ === EXEMPLO 1: LETRAS MAIÚSCULAS === @
  vnCodigo = 65;  @ Código ASCII da letra 'A' @
  RetornaAscII(vnCodigo, vaCaracter);
  vaMensagem = "Código 65 = " + vaCaracter;
  Mensagem(Retorna, vaMensagem);  @ Resultado: "Código 65 = A" @
  
  @ === EXEMPLO 2: NÚMEROS === @
  vnCodigo = 48;  @ Código ASCII do número '0' @
  RetornaAscII(vnCodigo, vaCaracter);
  vaMensagem = "Código 48 = " + vaCaracter;
  Mensagem(Retorna, vaMensagem);  @ Resultado: "Código 48 = 0" @
  
  @ === EXEMPLO 3: CARACTERES ESPECIAIS === @
  vnCodigo = 64;  @ Código ASCII do símbolo '@' @
  RetornaAscII(vnCodigo, vaCaracter);
  vaMensagem = "Código 64 = " + vaCaracter;
  Mensagem(Retorna, vaMensagem);  @ Resultado: "Código 64 = @" @
  
  @ === EXEMPLO PRÁTICO: GERAR SENHA SIMPLES === @
  Definir Alfa vaSenha;
  Definir Numero vnContador;
  
  vaSenha = "";
  Para (vnContador = 1; vnContador <= 4; vnContador++) {
    vnCodigo = 65 + vnContador - 1;  @ A, B, C, D @
    RetornaAscII(vnCodigo, vaCaracter);
    vaSenha = vaSenha + vaCaracter;
  }
  vaMensagem = "Senha gerada: " + vaSenha;
  Mensagem(Retorna, vaMensagem);  @ Resultado: "Senha gerada: ABCD" @
}
```

### RetiraCaracteresEspeciais

Remove caracteres especiais deixando somente letras e números, removendo todos os outros caracteres.

**Sintaxe:**

```lsp
RetiraCaracteresEspeciais(<Retorno>);
```

**Parâmetros:**

- `Retorno`: Variável Alfa que recebe o campo a ser limpo e retorna o campo sem caracteres especiais

**Exemplo:**

```lsp
Definir Funcao exemploRetiraCaracteresEspeciais();

@ Variáveis globais @
Definir Alfa vaTextoOriginal;
Definir Alfa vaTextoLimpo;
Definir Alfa vaMensagem;

exemploRetiraCaracteresEspeciais();

Funcao exemploRetiraCaracteresEspeciais(); {
  @ === EXEMPLO 1: RAZÃO SOCIAL === @
  vaTextoOriginal = "João & Pessoa Ltda.";
  vaTextoLimpo = vaTextoOriginal;
  RetiraCaracteresEspeciais(vaTextoLimpo);
  vaMensagem = "Original: " + vaTextoOriginal + " | Limpo: " + vaTextoLimpo;
  Mensagem(Retorna, vaMensagem);  @ Resultado: "JoaoPessoaLtda" @
  
  @ === EXEMPLO 2: TELEFONE === @
  vaTextoOriginal = "(47) 99999-8888";
  vaTextoLimpo = vaTextoOriginal;
  RetiraCaracteresEspeciais(vaTextoLimpo);
  vaMensagem = "Telefone original: " + vaTextoOriginal + " | Apenas números: " + vaTextoLimpo;
  Mensagem(Retorna, vaMensagem);  @ Resultado: "4799998888" @
  
  @ === EXEMPLO 3: EMAIL PARA ID === @
  vaTextoOriginal = "usuario@empresa.com.br";
  vaTextoLimpo = vaTextoOriginal;
  RetiraCaracteresEspeciais(vaTextoLimpo);
  vaMensagem = "Email: " + vaTextoOriginal + " | ID limpo: " + vaTextoLimpo;
  Mensagem(Retorna, vaMensagem);  @ Resultado: "usuarioempresacombr" @
  
  @ === EXEMPLO PRÁTICO: VALIDAÇÃO DE DOCUMENTO === @
  validarDocumentoLimpo();
}

/* ========================================================================
   FUNCAO: validarDocumentoLimpo
   DESCRICAO: Valida documento removendo caracteres especiais
   PARAMETROS: Nenhum (usa variáveis globais)
   RETORNO: Void
   OBSERVACOES: Exemplo prático de uso da função
   ======================================================================== */
Funcao validarDocumentoLimpo(); {
  @ Simular entrada de CPF com formatação @
  Definir Alfa vaCPF;
  Definir Numero vnTamanho;
  
  vaCPF = "123.456.789-10";
  vaMensagem = "CPF formatado: " + vaCPF;
  Mensagem(Retorna, vaMensagem);
  
  @ Remover formatação @
  RetiraCaracteresEspeciais(vaCPF);
  vaMensagem = "CPF apenas números: " + vaCPF;
  Mensagem(Retorna, vaMensagem);
  
  @ Validar tamanho @
  TamanhoAlfa(vaCPF, vnTamanho);
  Se (vnTamanho = 11) {
    Mensagem(Retorna, "CPF válido para processamento");
  } Senao {
    Mensagem(Erro, "CPF inválido após limpeza");
  }
}
```

### RetiraAcentuacao

Recebe uma string com acentuação e retorna a mesma string sem acentuação e em maiúsculo.

**Sintaxe:**

```lsp
RetiraAcentuacao(<pString>);
```

**Parâmetros:**

- `pString`: Variável Alfa que recebe uma string e retorna a variável em maiúsculo e sem acentuação

**Exemplo:**

```lsp
Definir Funcao exemploRetiraAcentuacao();

@ Variáveis globais @
Definir Alfa vaTextoOriginal;
Definir Alfa vaTextoSemAcento;
Definir Alfa vaMensagem;

exemploRetiraAcentuacao();

Funcao exemploRetiraAcentuacao(); {
  @ === EXEMPLO 1: NOME COM ACENTOS === @
  vaTextoOriginal = "José António da Silva";
  vaTextoSemAcento = vaTextoOriginal;
  RetiraAcentuacao(vaTextoSemAcento);
  vaMensagem = "Original: " + vaTextoOriginal + " | Sem acento: " + vaTextoSemAcento;
  Mensagem(Retorna, vaMensagem);  @ Resultado: "JOSE ANTONIO DA SILVA" @
  
  @ === EXEMPLO 2: CARACTERES ESPECIAIS === @
  vaTextoOriginal = "ÇçÁáàÉéÚúÍí";
  vaTextoSemAcento = vaTextoOriginal;
  RetiraAcentuacao(vaTextoSemAcento);
  vaMensagem = "Acentos: " + vaTextoOriginal + " | Convertido: " + vaTextoSemAcento;
  Mensagem(Retorna, vaMensagem);  @ Resultado: "CcAaaEeUuIi" @
  
  @ === EXEMPLO 3: ENDEREÇO === @
  vaTextoOriginal = "Rua das Açucenas, 123 - São José";
  vaTextoSemAcento = vaTextoOriginal;
  RetiraAcentuacao(vaTextoSemAcento);
  vaMensagem = "Endereço: " + vaTextoOriginal + " | Normalizado: " + vaTextoSemAcento;
  Mensagem(Retorna, vaMensagem);  @ Resultado: "RUA DAS ACUCENAS, 123 - SAO JOSE" @
  
  @ === EXEMPLO PRÁTICO: PADRONIZAÇÃO PARA BUSCA === @
  padronizarParaBusca();
}

/* ========================================================================
   FUNCAO: padronizarParaBusca
   DESCRICAO: Padroniza strings para pesquisa sem acentos
   PARAMETROS: Nenhum (usa variáveis globais)
   RETORNO: Void
   OBSERVACOES: Exemplo prático de normalização para busca
   ======================================================================== */
Funcao padronizarParaBusca(); {
  @ Simular lista de nomes para padronização @
  Definir Numero vnContador;
  Definir Alfa vaNomes;
  Definir Alfa vaNomeAtual;
  Definir Alfa vaNomePadronizado;
  
  @ Lista simulada separada por ponto-e-vírgula @
  vaNomes = "João da Silva;Maria José;Antônio Pereira;Françoise Dubois";
  
  Mensagem(Retorna, "=== PADRONIZAÇÃO DE NOMES PARA BUSCA ===");
  
  @ Processar cada nome da lista @
  Para (vnContador = 1; vnContador <= 4; vnContador++) {
    @ Obter nome atual (simulado) @
    Se (vnContador = 1) {
      vaNomeAtual = "João da Silva";
    } Senao Se (vnContador = 2) {
      vaNomeAtual = "Maria José";
    } Senao Se (vnContador = 3) {
      vaNomeAtual = "Antônio Pereira";
    } Senao {
      vaNomeAtual = "Françoise Dubois";
    }
    
    @ Padronizar para busca @
    vaNomePadronizado = vaNomeAtual;
    RetiraAcentuacao(vaNomePadronizado);
    
    @ Exibir resultado @
    Definir Alfa vaIndice;
    IntParaAlfa(vnContador, vaIndice);
    vaMensagem = vaIndice + ". " + vaNomeAtual + " -> " + vaNomePadronizado;
    Mensagem(Retorna, vaMensagem);
  }
  
  Mensagem(Retorna, "Nomes padronizados para indexação/busca");
}
```
