# Avisos Importantes para Iniciantes

### **Limitação #1: Parâmetros de Funções**

```lsp
@ NUNCA FAÇA - NÃO FUNCIONA @
Mensagem(Retorna, "Resultado: " + vaValor);

@  SEMPRE FAÇA - FUNCIONA @
Definir Alfa vaMensagem;
vaMensagem = "Resultado: " + vaValor;
Mensagem(Retorna, vaMensagem);
```

### **Limitação #2: Funções Usam Parâmetros de Retorno**

```lsp
@ INCORRETO @
vnTamanho = TamanhoAlfa(vaTexto);

@  CORRETO @
TamanhoAlfa(vaTexto, vnTamanho);
```

### **Regra #3: Padrão de Nomenclatura**

```lsp
Definir Alfa vaNome;     @ va = variável alfa @
Definir Numero vnIdade;  @ vn = variável numero @
Definir Data vdData;     @ vd = variável data @
```

### **Regra #4: Grids Precisam de Variáveis Intermediárias** 🔧

```lsp
@ INCORRETO @
AlfaParaDecimal(vaTexto, MinhaGrid.CampoDecimal);

@  CORRETO @
Definir Numero vnValor;
AlfaParaDecimal(vaTexto, vnValor);
MinhaGrid.CampoDecimal = vnValor;
```

### **Regra #5: Interrupção de Fluxo com Cancel**

```lsp
@ ❌ NUNCA USE - NÃO EXISTE NA LSP @
Mensagem(Erro, "Dado inválido");
Retorna;  @ ERRO: Comando não existe @

@ ❌ TAMBÉM NÃO EXISTE - VARIAÇÃO INCORRETA @
Mensagem(Erro, "Dado inválido");
Retorne;  @ ERRO: Comando não existe @

@ ✅ SEMPRE USE - PADRÃO CORRETO @
Mensagem(Erro, "Dado inválido");
Cancel(1);
```

**Explicação:** Em LSP, os comandos `Retorna;` e `Retorne;` **NÃO EXISTEM**. Para interromper a execução de uma função após uma mensagem de erro, use `Cancel(1);`. O parâmetro `1` indica que a execução deve ser cancelada.

**Alternativa:** Se você apenas quer sair de um loop, use `Pare;`. Se quer sair da função completamente, use `Cancel(1);`.

**Exemplo de uso correto:**

```lsp
EstaNulo(vaDado, vnEhNulo);
Se (vnEhNulo = 1) {
  Mensagem(Erro, "Dado não pode ser nulo");
  Cancel(1);
}

TamanhoAlfa(vaDado, vnTamanho);
Se (vnTamanho < 3) {
  Mensagem(Erro, "Dado deve ter pelo menos 3 caracteres");
  Cancel(1);
}

@ Se chegou até aqui, o dado é válido @
Mensagem(Retorna, "Dado validado com sucesso!");
```

### **Regra #6: Campos de Objetos/Grids Não Podem Ser Passados Diretamente para Funções** 🚨

**⚠️ REGRA CRÍTICA:** **NUNCA passe campos de objetos/grids com notação de ponto (ex: `Objeto.Campo.Valor`) diretamente como parâmetros de funções no Senior. Sempre atribua a uma variável intermediária primeiro.**

```lsp
@ ❌ INCORRETO - NÃO FUNCIONA @
DecimalParaAlfa(COT_API_Solistica.Produtos.PesBru, vaPesBruLog);
IntParaAlfa(vlPedidos.NumPed, vaNumPedLog);
TamanhoAlfa(vlPedidos.CepCli, vnTamanho);

@ ✅ CORRETO - SEMPRE FUNCIONA @
@ Atribuir a variáveis intermediárias primeiro @
Definir Numero vnPesBruLog;
Definir Numero vnNumPedLog;
Definir Alfa vaCepCliTemp;
Definir Numero vnTamanho;

vnPesBruLog = COT_API_Solistica.Produtos.PesBru;
DecimalParaAlfa(vnPesBruLog, vaPesBruLog);

vnNumPedLog = vlPedidos.NumPed;
IntParaAlfa(vnNumPedLog, vaNumPedLog);

vaCepCliTemp = vlPedidos.CepCli;
TamanhoAlfa(vaCepCliTemp, vnTamanho);
```

**Explicação:** Em LSP, campos de objetos/grids (com notação de ponto) **NÃO PODEM** ser passados diretamente como parâmetros de funções. O Senior não suporta essa sintaxe. Sempre é necessário atribuir o valor a uma variável intermediária primeiro, e então passar essa variável para a função.

**Regra geral:** 
- ❌ **NUNCA:** `Funcao(Objeto.Campo.Valor, ...)`
- ✅ **SEMPRE:** `vnValor = Objeto.Campo.Valor; Funcao(vnValor, ...)`

**Aplica-se a:**
- Campos de grids (`wsCOT_API_Solistica.Produtos.PesBru`)
- Campos de listas dinâmicas (`vlPedidos.NumPed`)
- Campos de objetos (`COT_API_Solistica.Produtos.CepDes`)
- Qualquer campo acessado com notação de ponto (`.`)
