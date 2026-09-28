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

### **Regra #6: Campo com ponto segue a descrição do parâmetro**

Passe `Tabela.Campo` ou `Objeto.Campo` quando a descrição **daquele parâmetro** diz **Campo/Variável** (também “Campo ou Variável” ou “Campo, Valor ou Variável”). A mesma regra vale para qualquer função padrão, não só `IntParaAlfa`. Alfa, Numero e Data entram nesse caso.

```lsp
@ CORRETO — doc Senior: Campo/Variável @
IntParaAlfa(E900COP.NUMORP, vaNumOrpPai);
TamanhoAlfa(E085Cli.NomCli, vnTam);
```

Use variável intermediária só quando a descrição não é Campo/Variável (em geral o retorno, “variável que receberá”).

```lsp
@ INCORRETO — destino não é Campo/Variável @
AlfaParaDecimal(vaTexto, MinhaGrid.CampoDecimal);

@ CORRETO @
Definir Numero vnValor;
AlfaParaDecimal(vaTexto, vnValor);
MinhaGrid.CampoDecimal = vnValor;
```

Atribuição e comparação diretas continuam válidas: `vlPedidos.NumPed = vnValor;` e `Se (vlPedidos.NumPed = 10)`.

`UltimoDia` grava o resultado na própria variável e não aceita campo de tabela. Use `vnData = E120Ped.DatEmi; UltimoDia(vnData);`.
