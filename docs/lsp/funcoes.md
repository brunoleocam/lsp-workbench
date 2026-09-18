# Definição de Funções

É um conjunto de comandos que tem como objetivo calcular um ou mais valores e retorná-los para uso na regra. Havendo uma operação que se repita, pode-se criar a função e chamá-la em cada regra, sem precisar reimplementá-la.

Nota:
Como boa prática, é recomendável que se reserve a regra 001 apenas para implementar funções.

Uma função pode receber parâmetros e retornar valores.

**⚠️ Importante:**

- Valores alterados dentro da função também serão alterados fora dela.
- **Os parâmetros definidos para as funções devem obrigatoriamente ser Numéricos**
- **Parâmetros do tipo Alfanuméricos (Alfa) NÃO são suportados por funções definidas nas regras**

**Incorreto - NÃO funciona:**

```lsp
Funcao alterarNome(Alfa vaNome); {
   vaNome = "Nome Alterado"; @ ERRO: Parâmetro Alfa não suportado @
}
```

**Correto - Usar variáveis globais:**

```lsp
Definir Alfa vaNome;

vaNome = "João Silva";

Funcao alterarNome(); {
  vaNome = "João da Silva"; @ Correto: variável global @
}
```

**Exemplo Oficial da Senior:**

```lsp
@ Definição/declaração da função criada pelo usuário @
Definir Funcao Somar(Numero pNum1, Numero pNum2, Numero End pResultado);

Definir Numero vNum1;
Definir Numero vNum2;
Definir Numero vResultado;
Definir Alfa vResultadoMensagem;

vNum1 = 50;
vNum2 = 100;
Somar(vNum1, vNum2, vResultado);

IntParaAlfa(vResultado, vResultadoMensagem);
vResultadoMensagem = "O resultado da soma é " + vResultadoMensagem;
Mensagem(Retorna, vResultadoMensagem);

@ Função criada pelo usuário para realizar a soma de dois números @
Funcao Somar(Numero pNum1, Numero pNum2, Numero End pResultado); {
  pResultado = pNum1 + pNum2;
}
```

### Exemplos de Funções

#### Função Simples

```lsp
Definir Funcao funcaoSimples();

funcaoSimples();

Funcao funcaoSimples(); {  
  @ Corpo da Função @
}
```

#### Função com Parâmetro Numérico

```lsp
Definir Funcao adicionarHoras(Numero vnParametro);
Definir Numero vnHoras;

vnHoras = 2;
adicionarHoras(10);
@ o valor de vnHoras será 12 @

Funcao adicionarHoras(Numero vnParametro) {
  vnHoras = vnHoras + vnParametro;
}
```

#### Função com Parâmetro Numérico e Retorno no Mesmo Parâmetro

```lsp
Definir Funcao incrementar(Numero End vnParametro);
Definir Numero vnValor;

vnValor = 1;
incrementar(vnValor);
@ o valor de vnValor será 2 @

incrementar(vnValor);
@ o valor de vnValor será 3 @

incrementar(vnValor);
@ o valor de vnValor será 4 @

Funcao incrementar(Numero End vnParametro); {
  vnParametro = vnParametro + 1;
}
```

#### Função com Dois Parâmetros Numéricos e Retorno em uma Variável Específica

```lsp
Definir Funcao adicionarQuantidadeHoras(Numero vnHoraAtual, Numero vnQuantidade, Numero End vnRetorno);
Definir Numero vnHorario;
Definir Numero vnNovoHorario;

vnHorario = 2;
adicionarQuantidadeHoras(vnHorario, 2, vnNovoHorario);
@ o valor de vnNovoHorario será 4 @

Funcao adicionarQuantidadeHoras(Numero vnHoraAtual, Numero vnQuantidade, Numero End vnRetorno); {
  vnRetorno = vnHoraAtual + vnQuantidade;
}
```

### Organização das Funções

**⚠️ REGRA OBRIGATÓRIA:** Em LSP, as funções devem ser declaradas **SEMPRE APÓS** o código principal que as chama. A chamada da função deve aparecer ANTES da declaração da função no código.

**Incorreto - NÃO funciona:**

```lsp
Funcao minhaFuncao(); {
  @ Corpo da função @
}

minhaFuncao(); @ ERRO: Chamada após declaração @
```

**Correto - Ordem obrigatória:**

```lsp
@ 1. Variáveis globais @
@ 2. Código principal (chamadas) @
@ 3. Declaração das funções @
```

Para evitar problemas de execução, as funções devem sempre ficar no final do código. Aqui está um exemplo de como organizar o código corretamente:

```lsp
Definir Funcao funcaoSimples();
Definir Funcao adicionarHoras(Numero vnParametro);
Definir Funcao incrementar(Numero End vnParametro);
Definir Funcao adicionarQuantidadeHoras(Numero vnHoraAtual, Numero vnQuantidade, Numero End vnRetorno);

@ Execução da Função Simples @
funcaoSimples();

@ Execução da Função com Parâmetro Numérico @
Definir Numero vnHoras;
vnHoras = 2;
adicionarHoras(10); @ o valor de vnHoras será 12 @

@ Execução da Função com Parâmetro Numérico e Retorno no Mesmo Parâmetro @
Definir Numero vnValor;
vnValor = 1;
incrementar(vnValor);
@ o valor de vnValor será 2 @

incrementar(vnValor);
@ o valor de vnValor será 3 @

incrementar(vnValor);
@ o valor de vnValor será 4 @

@ Execução da Função com Dois Parâmetros Numéricos e Retorno em uma Variável Específica @
Definir Numero vnHorario;
Definir Numero vnNovoHorario;
vnHorario = 2;
adicionarQuantidadeHoras(vnHorario, 2, vnNovoHorario); @ o valor de vnNovoHorario será 4 @

@ ------------------------------------FUNÇÕES----------------------------------@

@ Função Simples @
Funcao funcaoSimples(); {  
  @ Corpo da Função @
}

@ Função com Parâmetro Numérico @
Funcao adicionarHoras(Numero vnParametro); { 
  vnHoras = vnHoras + vnParametro; 
}

@ Função com Parâmetro Numérico e Retorno no Mesmo Parâmetro @
Funcao incrementar(Numero End vnParametro); {  
  vnParametro = vnParametro + 1;
}

@ Função com Dois Parâmetros Numéricos e Retorno em uma Variável Específica @
Funcao adicionarQuantidadeHoras(Numero vnHoraAtual, Numero vnQuantidade, Numero End vnRetorno); {
  vnRetorno = vnHoraAtual + vnQuantidade;
}
```
