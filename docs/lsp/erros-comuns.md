# Erros Comuns e Soluções

### **AVISO IMPORTANTE: Problemas de Sintaxe Corrigidos**

#### **Problema #1: Função `Chr()` Inexistente**

**Problema:** A função `Chr()` não existe na LSP

```lsp
@ ❌ INCORRETO @
vaStrProcura = "Primeira linha" + Chr(13) + Chr(10) + "Segunda linha";
```

**Solução:** Use `CaracterParaAlfa()` para caracteres especiais

```lsp
@ ✅ CORRETO @
Definir Alfa vaEnter;
CaracterParaAlfa(13, vaEnter);
vaStrProcura = "Primeira linha" + vaEnter + "Segunda linha";
```

#### **Problema #2: `FormatarData` com Tipo Data**

**Problema:** `FormatarData` aceita apenas tipo `Numero`, não `Data`

```lsp
@ ❌ INCORRETO @
Definir Data vdData;
DataHoje(vdData);
FormatarData(vdData, "dd/MM/yyyy", vaFormatada);  @ ERRO: FormatarData só aceita Numero @
```

**Solução:** Use `DataHora()` que retorna `Numero`

```lsp
@ ✅ CORRETO @
Definir Numero vnDataHora;
DataHora(vnDataHora);
FormatarData(vnDataHora, "dd/MM/yyyy", vaFormatada);
```

#### **Problema #3: Atribuição Direta de Data**

**Problema:** Não é possível atribuir data diretamente

```lsp
@ ❌ INCORRETO @
vdData = 15/08/1990;
```

**Solução:** Use `MontaData()` ou `CodData()`

```lsp
@ ✅ CORRETO @
MontaData(15, 8, 1990, vdData);
```

#### **Problema #4: Variáveis Não Declaradas**

**Problema:** Variáveis usadas sem declaração

```lsp
@ ❌ INCORRETO @
DecodData(vdData, vnDia, vnMes, vnAno);
```

**Solução:** Declare todas as variáveis

```lsp
@ ✅ CORRETO @
Definir Numero vnDia;
Definir Numero vnMes;
Definir Numero vnAno;
DecodData(vdData, vnDia, vnMes, vnAno);
```

#### **Problema #5: Uso Incorreto da Função `Truncar`**

**Problema:** A função `Truncar` existe, mas geralmente é usada com sintaxe incorreta

```lsp
@ ❌ INCORRETO @
Truncar(vnDataHora, vnParteInteira);
```

**Solução:** Use a sintaxe correta da função Truncar

```lsp
@ ✅ CORRETO @
vnParteInteira = Truncar(vnDataHora);  @ Sintaxe correta: Truncar(valor) retorna o valor truncado @
```

### **Erro #1: Concatenação em Parâmetros de Funções**

**Problema:** Tentar concatenar strings diretamente nos parâmetros

```lsp
@ ❌ INCORRETO - NÃO FUNCIONA @
Mensagem(Retorna, "Resultado: " + vaValor);
TamanhoAlfa("Texto: " + vaNome, vnTamanho);
```

**Solução:** Sempre use variáveis intermediárias

```lsp
@ ✅ CORRETO - FUNCIONA @
Definir Alfa vaMensagem;
vaMensagem = "Resultado: " + vaValor;
Mensagem(Retorna, vaMensagem);

Definir Alfa vaTextoCompleto;
vaTextoCompleto = "Texto: " + vaNome;
TamanhoAlfa(vaTextoCompleto, vnTamanho);
```

### **Erro #2: Confundir Tipos de Retorno**

**Problema:** Tentar usar funções LSP como se retornassem valores

```lsp
@ ❌ INCORRETO - NÃO FUNCIONA @
vnTamanho = TamanhoAlfa(vaTexto);
vaResultado = IntParaAlfa(vnNumero);
Se (EstaNulo(vaDado, vnEhNulo) = 0) {  @ Função não retorna valor @
```

**Solução:** LSP usa parâmetros de retorno

```lsp
@ ✅ CORRETO - FUNCIONA @
TamanhoAlfa(vaTexto, vnTamanho);
IntParaAlfa(vnNumero, vaResultado);
EstaNulo(vaDado, vnEhNulo);  @ Executa função primeiro @
Se (vnEhNulo = 0) {          @ Depois compara variável @
```

### **Erro #3: Declaração de Variáveis no Meio do Código**

**Problema:** Declarar variáveis dentro de blocos condicionais

```lsp
@ ❌ INCORRETO - PODE CAUSAR ERROS @
Se (vnCondicao = 1) {
  Definir Alfa vaVariavel;  @ Declaração no meio do código @
  vaVariavel = "valor";
}
```

**Solução:** Declare todas as variáveis no início da regra

```lsp
@ ✅ CORRETO - SEMPRE FUNCIONA @
Definir Alfa vaVariavel;  @ Declaração no início @

Se (vnCondicao = 1) {
  vaVariavel = "valor";
}
```

### **Erro #4: Concatenação Incorreta de Tipos**

**Problema:** Tentar concatenar variáveis numéricas diretamente

```lsp
@ ❌ INCORRETO - ERRO DE CONCATENAÇÃO @
Definir Numero vnIdade;
Definir Alfa vaMensagem;
vnIdade = 25;
vaMensagem = "Idade: " + vnIdade;  @ ERRO: Numero não concatena @
```

**Solução:** Converta para Alfa primeiro

```lsp
@ ✅ CORRETO - CONVERSÃO ANTES DA CONCATENAÇÃO @
Definir Numero vnIdade;
Definir Alfa vaIdadeStr;
Definir Alfa vaMensagem;
vnIdade = 25;
IntParaAlfa(vnIdade, vaIdadeStr);  @ Converte para Alfa @
vaMensagem = "Idade: " + vaIdadeStr;  @ Concatena apenas Alfas @
```

**⚠️ REGRA CRÍTICA:** **Apenas variáveis do tipo `Alfa` podem ser concatenadas em LSP!**

### **Erro #5: Confundir Tipos de Dados**

**Problema:** Tentar atribuir tipos incompatíveis

```lsp
@ ❌ INCORRETO - ERRO DE TIPO @
Definir Numero vnValor;
vnValor = "123";  @ Tentando atribuir string a número @
```

**Solução:** Use conversões apropriadas

```lsp
@ ✅ CORRETO - CONVERSÃO ADEQUADA @
Definir Numero vnValor;
Definir Alfa vaTexto;
vaTexto = "123";
AlfaParaInt(vaTexto, vnValor);
```

### **Erro #5: Loop Infinito**

**Problema:** Condição de parada nunca é atingida

```lsp
@ ❌ INCORRETO - LOOP INFINITO @
vnContador = 1;
Enquanto (vnContador > 0) {
  @ Processamento sem incrementar vnContador @
}
```

**Solução:** Sempre atualize a variável de controle

```lsp
@ ✅ CORRETO - LOOP CONTROLADO @
vnContador = 1;
Enquanto (vnContador <= 10) {
  @ Processamento @
  vnContador++;  @ Incrementa a variável de controle @
}
```

### **Erro #6: Variáveis de Parâmetro em SQL_Retornar**

**Problema:** Usar variáveis de parâmetro (que começam com "p") diretamente nas funções SQL_Retornar

```lsp
@ ❌ INCORRETO - NÃO FUNCIONA @
Funcao minhaFuncao(Numero pCodigo, Numero End pResultado); {
  SQL_RetornarInteiro(xCursor, "CODIGO", pCodigo);      @ ERRO: não retorna valor @
  SQL_RetornarInteiro(xCursor, "RESULTADO", pResultado); @ ERRO: não retorna valor @
}
```

**Solução:** Use variáveis locais e depois atribua aos parâmetros

```lsp
@ ✅ CORRETO - FUNCIONA @
Funcao minhaFuncao(Numero pCodigo, Numero End pResultado); {
  Definir Numero vnCodigoTemp;
  Definir Numero vnResultadoTemp;
  
  SQL_RetornarInteiro(xCursor, "CODIGO", vnCodigoTemp);
  SQL_RetornarInteiro(xCursor, "RESULTADO", vnResultadoTemp);
  
  @ Atribuir valores às variáveis de parâmetro @
  pCodigo = vnCodigoTemp;
  pResultado = vnResultadoTemp;
}
```

**⚠️ REGRA CRÍTICA:** **NUNCA use variáveis de parâmetro (que começam com "p") diretamente nas funções SQL_Retornar. O Senior não retorna valores para essas variáveis. Sempre use variáveis locais e depois atribua aos parâmetros.**
