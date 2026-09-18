# Mensagens

A função `Mensagem` é utilizada para exibir mensagens ao usuário. Existem diferentes tipos de mensagens, como `Retorna`, `Erro`, e `Refaz`.

**📋 Regras Importantes:**

1. Não é possível fazer concatenação diretamente no parâmetro da função `Mensagem()`
2. É necessário definir uma variável Alfa antes, fazer as concatenações e atribuir nessa variável
3. A variável Alfa deve ser passada como parâmetro para a função `Mensagem()`

- **Sintaxe**

- Mensagem(<tipo da mensagem>,"<mensagem>");

Exibe uma mensagem para o usuário. As mensagens possuem características de acordo com o seu tipo.

- Retorna: Mostra uma mensagem de aviso, com os botões especificados entre colchetes. O símbolo & indica tecla de aceleração (atalho);
- Erro: Gera uma exceção, mostrando uma mensagem de erro e abortando a execução da regra;
- Refaz: Gera uma exceção, mostrando uma mensagem de erro e abortando a execução da regra.

- Exemplo comum, quando a mensagem é uma string literal sem concatenação:

```lsp
Mensagem(Retorna, "Operação concluída com sucesso!");
Mensagem(Erro, "Ocorreu um erro na operação.");
```

- Exemplo quando já temos uma variável Alfa com a mensagem final:

```lsp
Definir Alfa vaResultado;
vaResultado = "Mensagem já formatada";
Mensagem(Retorna, vaResultado);
```

- Exemplo quando precisamos fazer concatenação:

```lsp
Definir Alfa vaMensagem;
vaMensagem = "Aluno: " + vaNome + vaEnter + "Média: " + vaMedia;
Mensagem(Retorna, vaMensagem);
```

**⚠️ FUNDAMENTAL:** A função `Mensagem` **NÃO aceita concatenação ou qualquer manipulação** dentro de seus parâmetros. **Sempre** faça a concatenação em uma variável separada primeiro.

**🚨 CRÍTICO:** **NUNCA** passe variáveis contendo **JSON grandes** para `Mensagem`. Pode causar **travamento do sistema Senior**.

- Exemplo com botões especificados entre colchetes:

- Entre colchetes podem conter 1 ou mais parâmetros, o retorno será de acordo com a sequencia do parâmetro, iniciando com 0

```lsp
Definir Numero vnRetorno;

vnRetorno = Mensagem(retorna,"Processo Concluído [&Ok!!!]"); @ O valor da variável vnRetorno será: 0 @

vnRetorno = Mensagem(retorna,"Deseja Sair ? [&Sim,&Não]"); @ O valor da variável vnRetorno será: 0 para Sim e 1 para Não @

vnRetorno = Mensagem(retorna,"Escolha uma opção ? [&Voltar,&Avançar, $Cancelar]"); @ O valor da variável vnRetorno será: 0 para Voltar, 1 para Avançar e 2 para Cancelar @

```

- Exemplo de uso incorreto:

```lsp
@ ERRO: Concatenação no parâmetro - NÃO FUNCIONA @
Mensagem(Retorna, "Aluno: " + vaNome + vaEnter + "Média: " + vaMedia);
```

**💡 Nota:** Se você precisa que o usuário **insira dados** em vez de apenas visualizar uma mensagem, utilize a função **`EntradaValor`** (veja a seção a seguir).
