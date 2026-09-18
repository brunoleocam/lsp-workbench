# Debugging e Troubleshooting

### **Problemas Comuns e Soluções**

#### **Problema: "Variável não definida"**

**Causa:** Variável declarada dentro de bloco condicional ou não declarada
**Solução:** Declare todas as variáveis no início da regra

```lsp
@ ❌ INCORRETO @
Se (vnCondicao = 1) {
  Definir Alfa vaVariavel;  @ Declaração no meio @
  vaVariavel = "valor";
}

@ ✅ CORRETO @
Definir Alfa vaVariavel;  @ Declaração no início @
Se (vnCondicao = 1) {
  vaVariavel = "valor";
}
```

#### **Problema: "Função não funciona"**

**Causa:** Parâmetros incorretos ou ordem errada
**Solução:** Verifique a documentação da função

```lsp
@ ❌ INCORRETO @
TamanhoAlfa(vnTamanho, vaTexto);  @ Ordem errada @

@ ✅ CORRETO @
TamanhoAlfa(vaTexto, vnTamanho);  @ Ordem correta @
```

#### **Problema: "Comparação com função sem retorno"**

**Causa:** Tentar comparar função que usa parâmetro de retorno
**Solução:** Execute a função primeiro, depois compare a variável

```lsp
@ ❌ INCORRETO @
Se (EstaNulo(vaDado, vnEhNulo) = 0) {  @ Função não retorna valor @

@ ✅ CORRETO @
EstaNulo(vaDado, vnEhNulo);  @ Executa função primeiro @
Se (vnEhNulo = 0) {          @ Compara variável preenchida @
```

#### **Problema: "Erro de tipo"**

**Causa:** Tentativa de atribuir tipo incorreto
**Solução:** Use funções de conversão apropriadas

```lsp
@ ❌ INCORRETO @
Definir Numero vnValor;
vnValor = "123";  @ String em número @

@ ✅ CORRETO @
Definir Numero vnValor;
Definir Alfa vaTexto;
vaTexto = "123";
AlfaParaInt(vaTexto, vnValor);
```

#### **Problema: "Loop infinito"**

**Causa:** Condição de parada nunca atingida
**Solução:** Verifique a lógica da condição e atualize variáveis de controle

```lsp
@ ❌ INCORRETO @
vnContador = 1;
Enquanto (vnContador > 0) {
  @ Processamento sem incrementar @
}

@ ✅ CORRETO @
vnContador = 1;
Enquanto (vnContador <= 10) {
  @ Processamento @
  vnContador++;  @ Incrementa controle @
}
```

#### **Problema: "Função não funciona"**

**Causa:** Parâmetros incorretos ou ordem errada
**Solução:** Verifique a documentação da função

```lsp
@ ❌ INCORRETO @
TamanhoAlfa(vnTamanho, vaTexto);  @ Ordem errada @

@ ✅ CORRETO @
TamanhoAlfa(vaTexto, vnTamanho);  @ Ordem correta @
```

### **Técnicas de Debugging**

#### **Técnica 1: Mensagens de Debug**

```lsp
@ Adicione mensagens para rastrear execução @
Definir Alfa vaDebug;
vaDebug = "Passo 1: Iniciando processamento";
Mensagem(Retorna, vaDebug);

@ ... código ... @

vaDebug = "Passo 2: Dados processados";
Mensagem(Retorna, vaDebug);
```

#### **Técnica 2: Validação de Dados**

```lsp
@ Sempre valide dados antes de processar @
EstaNulo(vaDado, vnEhNulo);
Se (vnEhNulo = 0) {
  TamanhoAlfa(vaDado, vnTamanho);
  Se (vnTamanho > 0) {
    @ Processa apenas se válido @
    Mensagem(Retorna, "Dado válido: " + vaDado);
  } Senao {
    Mensagem(Erro, "Dado vazio");
  }
} Senao {
  Mensagem(Erro, "Dado nulo");
}
```

#### **Técnica 3: Tratamento de Erros**

```lsp
@ Use estruturas try-catch equivalentes @
Se (operacaoCritica() = 1) {
  @ Sucesso @
  processarResultado();
} Senao {
  @ Falha @
  Mensagem(Erro, "Operação falhou");
  @ Log do erro @
  registrarErro();
}
```
