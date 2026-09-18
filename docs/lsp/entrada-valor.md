# EntradaValor

A função `EntradaValor` é utilizada para entrada de valores interativa nas regras, permitindo que o usuário insira dados através de uma interface de entrada. É ideal quando você precisa coletar informações do usuário durante a execução da regra.

**Diferença para Mensagem:**

- `Mensagem`: Apenas **exibe** informações (com opção de botões)
- `EntradaValor`: Permite ao usuário **inserir/editar** dados em um campo de entrada

**Sintaxe:**

```lsp
EntradaValor(alfa PCaption, alfa pDesTit, Numero pTipDad, Alfa pMasc, alfa pIniAlfa, Numero pIniNum, Alfa end pRetAlfa, Numero end pRetNum, Numero end pTipSai);
```

**Parâmetros:**

| Nome     | Tipo   | Descrição                                                                                                                                                                                    |
|----------|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| PCaption | Alfa   | Título da janela/tela de entrada                                                                                                                                                             |
| pDesTit  | Alfa   | Descrição/label do campo de entrada                                                                                                                                                          |
| pTipDad  | Numero | Tipo do dado: **1**=Números inteiros, **2**=Números com casas decimais, **3**=Data, **4**=Hora, **5**=Alfa/Texto, **6**=Senha                                                                |
| pMasc    | Alfa   | Máscara de formatação do campo (ex: "99.999.999/9999-99" para CNPJ)                                                                                                                          |
| pIniAlfa | Alfa   | Valor inicial alfanumérico para o campo                                                                                                                                                       |
| pIniNum  | Numero | Valor inicial numérico para o campo. **Limite máximo:** 2.147.483.647                                                                                                                         |
| pRetAlfa | Alfa   | **[END]** Variável que receberá o retorno alfanumérico informado                                                                                                                             |
| pRetNum  | Numero | **[END]** Variável que receberá o retorno numérico informado                                                                                                                                 |
| pTipSai  | Numero | **[END]** Variável que indica como o usuário saiu: **1**=Clicou OK, **0**=Apenas fechou a janela                                                                                             |

**Tipo de Retorno:**

- `pRetAlfa`: Valor digitado como texto
- `pRetNum`: Valor digitado como número
- `pTipSai`: Indica se usuário confirmou (1) ou cancelou (0)

**Características Especiais:**

- A tela **salva a posição** onde foi exibida pela última vez
- **Sempre reaparece na mesma posição** (exceto se chamada antes da tela principal do sistema)
- Validação automática baseada no tipo de dado e máscara

**Exemplos Práticos:**

**1. Números Inteiros:**

```lsp
Definir Alfa vaRetAlfa;
Definir Numero vnRetNumero;
Definir Numero vnTipSai;

@ Número simples @
EntradaValor("Número", "Informe um número:", 1, "9", "", 9, vaRetAlfa, vnRetNumero, vnTipSai);

@ Número com máscara formatada @
EntradaValor("Número", "Informe um número:", 1, "ZZZ.ZZZ.ZZ9", "", 999999999, vaRetAlfa, vnRetNumero, vnTipSai);
```

**2. Números Decimais:**

```lsp
@ Número decimal @
EntradaValor("Dinheiro", "Informe o valor monetário:", 2, "ZZZ.ZZZ.ZZ9,99", "", 111222333.88, vaRetAlfa, vnRetNumero, vnTipSai);

@ Número negativo @
EntradaValor("Número", "Informe um número negativo:", 2, "#-2#ZZZ.ZZ9,99999", "", 10, vaRetAlfa, vnRetNumero, vnTipSai);
```

**3. Data:**

```lsp
Definir Numero vnDataHoje;
DataHoje(vnDataHoje);
EntradaValor("Data", "Informe uma Data:", 3, "DD/MM/YYYY", "", vnDataHoje, vaRetAlfa, vnRetNumero, vnTipSai);
```

**4. Hora:**

```lsp
Definir Numero vnHora;
vnHora = 720;  @ equivalente a 12:00 (meio dia) @
EntradaValor("Hora", "Informe uma Hora:", 4, "HH:MM", "", vnHora, vaRetAlfa, vnRetNumero, vnTipSai);
```

**5. Texto Simples:**

```lsp
EntradaValor("Texto", "Informe o texto:", 5, "A[150]", "Valor inicial de texto", 0, vaRetAlfa, vnRetNumero, vnTipSai);
```

**6. Texto com Múltiplas Linhas (Memorando):**

```lsp
@ Máscara #(50,4)# significa 50 colunas e 4 linhas @
EntradaValor("Memorando de texto", "Informe o valor do memorando:", 5, "#(50,4)#", "", 0, vaRetAlfa, vnRetNumero, vnTipSai);

@ Outro exemplo com 3 linhas @
Definir Alfa vaRetAlfa;
Definir Numero vnRetNum;
Definir Numero vnTipSai;
EntradaValor("Cabeçalho", "Texto", 5, "#(40,3)#", "", 0, vaRetAlfa, vnRetNum, vnTipSai);
```

**7. Senha:**

```lsp
EntradaValor("Senha", "Informe a senha:", 6, "********************", "", 0, vaRetAlfa, vnRetNumero, vnTipSai);
```

**8. Exemplo Completo com Validação:**

```lsp
Definir Alfa vaRetAlfa;
Definir Numero vnRetNumero;
Definir Numero vnTipSai;

EntradaValor("Entre com algo", "Informe Qualquer Coisa!", 2, "ZZZ.ZZZ.ZZ9,99", "", 1456.98, vaRetAlfa, vnRetNumero, vnTipSai);

@ Verifica se usuário confirmou @
Se (vnTipSai = 1) {
  @ Usuário clicou em OK - processar valor @
  Mensagem(Retorna, "Valor informado: " + vaRetAlfa);
} Senao {
  @ Usuário cancelou @
  Mensagem(Retorna, "Operação cancelada pelo usuário");
}
```

**Máscaras Especiais "@" e "<":**

Para campos de texto que devem ter comportamento de edição numérica (da direita para esquerda):

```lsp
Definir Alfa vaMensagem;
Definir Alfa vaRetAlfa;
Definir Numero vnRetorno;
Definir Numero vnTipSai;

vaMensagem = "Informe o CNPJ";

@ Máscara com @ e < para edição da direita para esquerda @
EntradaValor("CNPJ do Cliente", vaMensagem, 5, "#@<#99.999.999/9999-99", "", 0, vaRetAlfa, vnRetorno, vnTipSai);
```

**Comportamento das máscaras especiais:**

- `@` + `<`: Edição da **direita para esquerda** (como campo numérico)
- Somente `@`: Edição da **esquerda para direita** (campo texto normal)
- O valor salvo **não inclui a máscara**, apenas o que foi digitado

**⚠️ Importante:** Para utilizar máscaras especiais, é necessário incluir um `#` antes e depois da máscara especial (ex: `"#@<#99.999.999/9999-99"`).

**Exemplo de Uso Prático - Coletar Nome do Usuário:**

```lsp
Definir Funcao coletarNomeUsuario();
Definir Alfa vaNome;
Definir Numero vnDummy;
Definir Numero vnTipSai;
Definir Numero vnTamanho;

coletarNomeUsuario();

Funcao coletarNomeUsuario(); {
  @ Solicita nome ao usuário @
  EntradaValor("Cadastro", "Digite seu nome completo:", 5, "A[100]", "", 0, vaNome, vnDummy, vnTipSai);
  
  @ Verifica se usuário confirmou @
  Se (vnTipSai = 0) {
    Mensagem(Erro, "Operação cancelada!");
    Cancel(1);
  }
  
  @ Valida se nome foi preenchido @
  LimpaEspacos(vaNome);
  TamanhoAlfa(vaNome, vnTamanho);
  
  Se (vnTamanho < 3) {
    Mensagem(Erro, "Nome deve ter pelo menos 3 caracteres!");
    Cancel(1);
  }
  
  Mensagem(Retorna, "Bem-vindo, " + vaNome + "!");
};
```
