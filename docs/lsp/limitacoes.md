# LIMITAÇÕES CRÍTICAS DA LSP

> **ATENÇÃO:** Esta seção é **OBRIGATÓRIA** para todos os desenvolvedores LSP!

### **Resumo Executivo das Limitações**

| **Limitação** | **Problema** | **Solução** |
|---|---|---|
| **Parâmetros** | Não aceita operações dentro de parâmetros | Faça operações antes, passe resultado |
| **Retorno** | Funções usam parâmetros de retorno | Use variável de retorno, não `=` |
| **Grids** | Conversões diretas falham | Use variável intermediária |
| **Campos com Ponto** | Não pode passar `Objeto.Campo.Valor` diretamente para funções | Atribua a variável intermediária primeiro |
| **Nomenclatura** | Nomes devem seguir padrão | Use prefixos: va, vn, vd |

---

### **Limitação #1: Manipulação em Parâmetros**

- **A LSP NÃO suporta manipulações/operações dentro dos parâmetros de funções**

#### **Operações NÃO Permitidas nos Parâmetros:**

- **Concatenação** com operador `+`
- **Chamadas de função** dentro de parâmetros
- **Operações matemáticas** (`*`, `/`, `-`, etc.)
- **Conversões de tipo** (`IntParaAlfa`, `AlfaParaInt`, etc.)

### **Exemplos INCORRETOS:**

```lsp
@ ERRO: Concatenação no parâmetro @
Mensagem(Retorna, "Resultado: " + vaValor + " pontos");

@ ERRO: Função dentro de parâmetro @
Mensagem(Retorna, "Idade: " + IntParaAlfa(vnIdade));

@ ERRO: Operação matemática no parâmetro @
SubstAlfa("]}", vaObjeto + "]}", vaTexto);

@ ERRO: Múltiplas concatenações @
Mensagem(Retorna, vaNome + " - " + vaEmail + " (" + IntParaAlfa(vnId) + ")");
```

### **Forma CORRETA:**

```lsp
@ CORRETO: Fazer manipulações antes @
Definir Alfa vaMensagem;
Definir Alfa vaIdade;

IntParaAlfa(vnIdade, vaIdade);
vaMensagem = "Resultado: " + vaValor + " pontos";
Mensagem(Retorna, vaMensagem);

@ CORRETO: Para SubstAlfa @
vaObjeto = vaObjeto + "]}";
SubstAlfa("]}", vaObjeto, vaTexto);

@ CORRETO: Para múltiplas concatenações @
vaMensagem = vaNome + " - " + vaEmail + " (" + vaIdade + ")";
Mensagem(Retorna, vaMensagem);
```

### **Regra de Ouro:**

**Sempre faça as manipulações ANTES de passar para a função!**

### **ATENÇÃO ESPECIAL: Função Mensagem**

A função `Mensagem` é **extremamente sensível** a esta limitação. É muito fácil cometer erro:

```lsp
@ MUITO COMUM mas INCORRETO @
Mensagem(Retorna, "Total: " + vaTexto + " itens");
Mensagem(Erro, "Erro no produto: " + vaProduto);
Mensagem(Retorna, "Valor: " + IntParaAlfa(vnValor));

@  CORRETO @
Definir Alfa vaMensagem;
vaMensagem = "Total: " + vaTexto + " itens";
Mensagem(Retorna, vaMensagem);

vaMensagem = "Erro no produto: " + vaProduto;
Mensagem(Erro, vaMensagem);

Definir Alfa vaValorStr;
IntParaAlfa(vnValor, vaValorStr);
vaMensagem = "Valor: " + vaValorStr;
Mensagem(Retorna, vaMensagem);
```

### **LIMITAÇÃO CRÍTICA: JSON e Dados Grandes**

**NUNCA** passe dados JSON grandes ou strings muito extensas para `Mensagem`:

```lsp
@ PERIGOSO - Pode travar o sistema @
Mensagem(Retorna, vaJSONResposta);  @ JSON grande @
Mensagem(Retorna, vaXMLCompleto);   @ XML grande @
Mensagem(Retorna, vaLogCompleto);   @ Log extenso @
```

### **LIMITAÇÃO CRÍTICA: Campos de Objetos/Grids em Parâmetros de Funções** 🚨

**⚠️ REGRA ABSOLUTA:** **NUNCA passe campos de objetos/grids com notação de ponto (ex: `Objeto.Campo.Valor`) diretamente como parâmetros de funções no Senior. Isso NÃO FUNCIONA e causará erros.**

#### **Exemplos INCORRETOS:**

```lsp
@ ❌ ERRO: Campo de grid passado diretamente @
DecimalParaAlfa(COT_API_Solistica.Produtos.PesBru, vaPesBruLog);
IntParaAlfa(vlPedidos.NumPed, vaNumPedLog);
TamanhoAlfa(vlPedidos.CepCli, vnTamanho);
AlfaParaDecimal(vaTexto, MinhaGrid.CampoDecimal);

@ ❌ ERRO: Campo de objeto passado diretamente @
DecimalParaAlfa(wsCOT_API_Correios.Produtos.PreCot, vaPrecoLog);
IntParaAlfa(vlMedPed.AltPro, vaAlturaLog);
```

#### **Forma CORRETA:**

```lsp
@ ✅ CORRETO: Atribuir a variável intermediária primeiro @
Definir Numero vnPesBruLog;
Definir Numero vnNumPedLog;
Definir Alfa vaCepCliTemp;
Definir Numero vnTamanho;
Definir Numero vnPrecoLog;
Definir Numero vnAlturaLog;

@ Atribuir valores dos campos a variáveis @
vnPesBruLog = COT_API_Solistica.Produtos.PesBru;
DecimalParaAlfa(vnPesBruLog, vaPesBruLog);

vnNumPedLog = vlPedidos.NumPed;
IntParaAlfa(vnNumPedLog, vaNumPedLog);

vaCepCliTemp = vlPedidos.CepCli;
TamanhoAlfa(vaCepCliTemp, vnTamanho);

@ Para atribuir a grid, também use variável intermediária @
Definir Numero vnValor;
AlfaParaDecimal(vaTexto, vnValor);
MinhaGrid.CampoDecimal = vnValor;
```

#### **Regra de Ouro:**

**SEMPRE atribua campos de objetos/grids a variáveis intermediárias ANTES de usar em funções ou atribuições!**

**Aplica-se a:**
- ✅ Campos de grids: `wsCOT_API_Solistica.Produtos.PesBru`
- ✅ Campos de listas dinâmicas: `vlPedidos.NumPed`
- ✅ Campos de objetos: `COT_API_Solistica.Produtos.CepDes`
- ✅ Qualquer campo acessado com notação de ponto (`.`)

**NÃO se aplica a:**
- ❌ Atribuições diretas: `vlPedidos.NumPed = vnValor;` (isso funciona)
- ❌ Comparações diretas: `Se (vlPedidos.NumPed = 10)` (isso funciona)
- ❌ Leitura direta: `vaValor = vlPedidos.NumPed;` (isso funciona)

### **LIMITAÇÃO CRÍTICA: Variáveis de Parâmetro em SQL_Retornar**

**NUNCA** use variáveis de parâmetro diretamente nas funções SQL_Retornar:

```lsp
@ ❌ INCORRETO - NÃO FUNCIONA @
Funcao minhaFuncao(Numero pCodigo, Numero End pResultado); {
  SQL_RetornarInteiro(xCursor, "CODIGO", pCodigo);      @ ERRO: não retorna valor @
  SQL_RetornarInteiro(xCursor, "RESULTADO", pResultado); @ ERRO: não retorna valor @
}
```

**Solução:** Use variáveis locais e depois atribua aos parâmetros:

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

**⚠️ REGRA CRÍTICA:** **O Senior não retorna valores para variáveis de parâmetro nas funções SQL_Retornar. Sempre use variáveis locais e depois atribua aos parâmetros.**

```lsp
@  SEGURO - Mostrar apenas informações resumidas @
Definir Alfa vaMensagem;
Definir Numero vnTamanho;
Definir Alfa vaTamanhoStr;
TamanhoAlfa(vaJSONResposta, vnTamanho);
IntParaAlfa(vnTamanho, vaTamanhoStr);
vaMensagem = "JSON recebido com " + vaTamanhoStr + " caracteres";
Mensagem(Retorna, vaMensagem);

@  SEGURO - Mostrar apenas parte do conteúdo @
Definir Alfa vaJSONTrecho;
vaJSONTrecho = vaJSONResposta;
CopiarAlfa(vaJSONTrecho, 1, 50);
vaMensagem = "JSON início: " + vaJSONTrecho + "...";
Mensagem(Retorna, vaMensagem);

```

### **Retorno Direto de Funções**

- **A maioria das funções LSP NÃO retorna valores diretamente - elas usam parâmetros de retorno**

#### **Sintaxe INCORRETA:**

```lsp
@ ERRO: Tentativa de retorno direto @
vnTamanho = TamanhoAlfa(vaTexto);
vnPosicao = PosicaoAlfa("@", vaEmail);
vnLinhas = LinhasArquivo(vaCaminho);
vnExiste = ArqExiste(vaCaminho);
vnQuantidade = ListaQuantidade(vaLista, ",");
vnResultado = HoraParaMinuto(1, 30);
vnValido = VrfAbrA(vaCodigo, "A..Z");
vnAtiva = VerificaAbaAtiva(vaDescricao);

@ ERRO MUITO COMUM: Usar em condicionais @
Se (TamanhoAlfa(vaCNPJ) <> 14) {
  Mensagem(Erro, "CNPJ deve ter 14 dígitos");
}

Se (ArqExiste(vaCaminho)) {
  Mensagem(Retorna, "Arquivo encontrado");
}
```

#### **Sintaxe CORRETA:**

```lsp
@ CORRETO: Usar parâmetro de retorno @
TamanhoAlfa(vaTexto, vnTamanho);
PosicaoAlfa("@", vaEmail, vnPosicao);
LinhasArquivo(vaCaminho, vnLinhas);
ListaQuantidade(vaLista, ",", vnQuantidade);
HoraParaMinuto(1, 30, vnResultado);
VrfAbrA(vaCodigo, "A..Z", vnValido);
VerificaAbaAtiva(vaDescricao, vnAtiva);

@ CORRETO: ArqExiste retorna diretamente @
vnExiste = ArqExiste(vaCaminho);
Se (vnExiste = 1) {
  Mensagem(Retorna, "Arquivo encontrado");
}

@ CORRETO: Usar em condicionais @
Definir Numero vnTamanhoCNPJ;
TamanhoAlfa(vaCNPJ, vnTamanhoCNPJ);
Se (vnTamanhoCNPJ <> 14) {
  Mensagem(Erro, "CNPJ deve ter 14 dígitos");
}

Definir Numero vnArquivoExiste;
vnArquivoExiste = ArqExiste(vaCaminho);
Se (vnArquivoExiste = 1) {
  Mensagem(Retorna, "Arquivo encontrado");
}
```

#### **Exceções - Funções que RETORNAM diretamente:**

```lsp
@ Estas funções SIM retornam valores diretamente @
vnExiste = ArqExiste(vaCaminho);  @ Retorna 1 se existe, 0 se não existe @
vnRetorno = ConverteCodificacaoString(vaTexto, "UTF-8", vaDestino);
vnArquivo = Abrir("arquivo.txt", Ler);
vdData = CodData(vnDia, vnMes, vnAno);
vnRetorno = Mensagem(Retorna, "Mensagem [&Ok,&Cancelar]");
vnNulo = SQL_RetornarSeNulo(xCursor, "CAMPO");
vnTem = Lst.Primeiro();
vnTem = Lst.Proximo();
```

#### **Resumo - Funções que usam PARÂMETRO DE RETORNO:**

| **Categoria** | **Funções** |
|---|---|
| **Strings** | `TamanhoAlfa`, `TamanhoStr`, `PosicaoAlfa`, `PosicaoStr`, `ListaQuantidade` |
| **Validação** | `VrfAbrA`, `VrfAbrN`, `ArqExiste`, `VerificaAbaAtiva`, `EstaNulo` |
| **Sistema** | `LinhasArquivo`, `HoraParaMinuto`, `ObtemIdiomaAtivo`, `RetornaValorCFG` |
| **Conversão** | `AlfaParaDecimal`, `AlfaParaInt`, `AlfaParaData`, `IntParaAlfa` |
| **Manipulação Dinâmica** | `PegarTipoVar`, `PegarValorVarAlf`, `PegarValorVarNum` |

### **Atribuição Direta em Grids/Tabelas**

- **Funções de conversão NÃO podem atribuir diretamente para campos de grids ou tabelas**

#### **Operações NÃO Permitidas:**

- **Atribuição direta** em campos de grid/tabela
- **Conversões diretas** para propriedades de objetos
- **Funções de cast** diretamente em campos estruturados

#### **Exemplos INCORRETOS:**

```lsp
@ ERRO: Atribuição direta em grid @
AlfaParaDecimal(vaTexto, MinhaGrid.CampoDecimal);
AlfaParaInt(vaTexto, MinhaTabela.CampoInteiro);
AlfaParaData(vaTexto, MinhaGrid.CampoData);
```

#### **Forma CORRETA:**

```lsp
@ CORRETO: Usar variável intermediária @
Definir Numero vnValorDecimal;
Definir Numero vnValorInteiro;
Definir Data vdDataConvertida;

AlfaParaDecimal(vaTexto, vnValorDecimal);
MinhaGrid.CampoDecimal = vnValorDecimal;

AlfaParaInt(vaTexto, vnValorInteiro);
MinhaTabela.CampoInteiro = vnValorInteiro;

AlfaParaData(vaTexto, vdDataConvertida);
MinhaGrid.CampoData = vdDataConvertida;
```

#### **Regra de Ouro para Grids:**

**Sempre use variável intermediária para conversões em grids/tabelas!**
