# LIMITAÇÕES CRÍTICAS DA LSP

> **ATENÇÃO:** Esta seção é **OBRIGATÓRIA** para todos os desenvolvedores LSP!

### **Resumo Executivo das Limitações**

| **Limitação** | **Problema** | **Solução** |
|---|---|---|
| **Parâmetros** | Não aceita operações dentro de parâmetros | Faça operações antes, passe resultado |
| **Retorno** | Funções usam parâmetros de retorno | Use variável de retorno, não `=` |
| **Grids** | Conversões diretas falham | Use variável intermediária |
| **Campos com Ponto** | Parâmetro que não é Campo/Variável não aceita `Objeto.Campo` | Se a doc diz Campo/Variável, passe o campo; senão use variável intermediária |
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

### **Campos com ponto em parâmetros**

Função padrão da Senior aceita `Tabela.Campo` ou `Objeto.Campo` quando a descrição **daquele parâmetro** diz **Campo/Variável** (também “Campo ou Variável” ou “Campo, Valor ou Variável”). Vale para Alfa, Numero ou Data. A regra é a do parâmetro, não o nome da função: `IntParaAlfa`, `TamanhoAlfa`, `Concatena`, `DataExtenso`, `DesMontaData`, `QuebraTexto` e as demais do catálogo seguem o mesmo critério.

Na [IntParaAlfa](https://documentacao.senior.com.br/tecnologia/5.10.4/lsp/funcoes/gerais/intparaalfa.htm), origem e destino são Campo/Variável.

```lsp
@ CORRETO — a doc do parâmetro diz Campo/Variável @
IntParaAlfa(E900COP.NUMORP, vaNumOrpPai);
TamanhoAlfa(E085Cli.NomCli, vnTam);
Concatena(E085Cli.NomCli, " - ", E085Cli.ApeCli, vaResultado);
```

Quando a descrição fala só em variável de retorno (não é Campo/Variável), não passe o campo. Converta para uma variável e grave no grid em seguida.

```lsp
@ INCORRETO — destino de AlfaParaDecimal é variável de retorno @
AlfaParaDecimal(vaTexto, MinhaGrid.CampoDecimal);

@ CORRETO @
Definir Numero vnValor;
AlfaParaDecimal(vaTexto, vnValor);
MinhaGrid.CampoDecimal = vnValor;
```

Atribuição, comparação e leitura diretas continuam válidas: `vlPedidos.NumPed = vnValor;`, `Se (vlPedidos.NumPed = 10)` e `vaValor = vlPedidos.NumPed;`.

`UltimoDia` devolve o resultado na própria variável. A documentação diz que não pode ser campo de tabela: copie para uma variável e chame `UltimoDia(vnData);`.

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

### **Destino de conversão que não é Campo/Variável**

Se a descrição do parâmetro de destino é só “variável que receberá” (não Campo/Variável), não grave o resultado direto no grid. Converta para uma variável e atribua depois.

```lsp
@ INCORRETO @
AlfaParaDecimal(vaTexto, MinhaGrid.CampoDecimal);

@ CORRETO @
Definir Numero vnValorDecimal;
AlfaParaDecimal(vaTexto, vnValorDecimal);
MinhaGrid.CampoDecimal = vnValorDecimal;
```

`IntParaAlfa` e `AlfaParaInt`, na documentação Senior, descrevem o destino como Campo/Variável: o campo pode receber o resultado.
