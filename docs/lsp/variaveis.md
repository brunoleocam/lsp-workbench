# Tipo de Dados e Variáveis

### **Tipos de Dados**

Os tipos de dados suportados pela LSP são:

- **Alfa**: Cadeia de caracteres.
- **Numero**: Números inteiros ou decimais.
- **Data**: Datas.
- **Lista**: Lista dinâmica nas regras.
- **Tabela**: Estrutura semelhante a um objeto em JavaScript.
- **Grid**: Estrutura de grade.
- **Cursor**: Estrutura para manipulação de consultas SQL.
- **Funcao**: Funções definidas pelo programador.

### **Declaração ou Definição de Variáveis**

As variáveis na LSP são declaradas utilizando o comando `Definir`. O nome das variáveis deve ter no máximo 100 caracteres e pode conter `_` (sublinhado). Não é permitido usar acentuação no nome das variáveis. Caso a variável não seja definida, esta será considerada como tipo **Numero**. O valor inicial de uma variável numérica não declarada é **0**.

Exemplo (válido sem `Definir`):

```lsp
vnTotal = 1;          @ implícito Numero, inicia em 0 antes desta atribuição @
vnTotal = vnTotal + 2;
```

Alfa, Data, Lista e Cursor **precisam** de `Definir`. Boa prática: declarar também os `vn*` usados, para leitura e para o plugin (SEM001 só alerta `va*`/`vd*`/`vl*`/`Cur_` sem Definir).

**Instrução inválida (SYN010):** um identificador ou nome de tipo sozinho na linha (`Numero;`, `xyz;`, `Numero`) **não compila**. O Senior reporta: *Erro na variável, "falta valor, expressão ou comando"*. Em outras linguagens isso costuma ser *unexpected identifier* / *statement expected*. O plugin alerta SYN010 (não basta acrescentar `;`).

```lsp
Definir Alfa vaNome;
Definir Numero vnIdade;
Definir Data vdNascimento;
```

### Ordem das declarações (boas práticas)

No **início do arquivo**, agrupar primeiro as variáveis e depois as funções. Dentro do bloco `Definir`, preferir esta ordem de tipos:

1. Numero  
2. Alfa  
3. Data  
4. Lista  
5. Tabela  
6. Grid  
7. Cursor  
8. Funcao  

```lsp
Definir Numero vnCodigo;
Definir Alfa vaNome;
Definir Data vdEmissao;
Definir Lista aItens;
Definir Cursor Cur_Ped;
Definir Funcao calcularTotal(Numero vnA, Numero End vnR);

@ implementações e restante do código abaixo @
Funcao calcularTotal(Numero vnA, Numero End vnR); {
  vnR = vnA;
}
```

O plugin (SEM001 / QF FUN007–008 / import) insere novos `Definir` respeitando essa ordem.

Exemplo de declaração de variáveis (sintaxe):

Sintaxe

Definir <Tipo> <Nome_da_Variável>;

```lsp
Definir Numero vnIdade;
Definir Alfa vaNome;
Definir Data vdNascimento;
```

### **Declaração ou Definição de Variáveis com Tamanho**

Para variáveis do tipo `Alfa`, é possível definir o tamanho máximo da cadeia de caracteres.

Exemplo:

```lsp
Definir Alfa vaNome[30];
```

### **Forma de Acesso**

As variáveis são acessadas diretamente pelo seu nome.

Exemplo:

```lsp
vaNome = "João";
vnIdade = 25;
```

As variáveis com tamanhos(Arrays) são acessadas diretamente pelo seu índice.

- O Índice pode conter um valor fixo, uma variável ou uma formula

<Nome_da_Variável>[<índice>] = <valor_atribuído>;

Exemplo:

```lsp
Definir Alfa vaNome[30];
Definir Numero vnIndice;

vnIndice = 1;

@ Valor Fixo @
vaNome[1] = "Nome";

@ Valor Variável @
vaNome[vnIndice] = "Nome";

@ Valor Formula @
vaNome[vnIndice + 1 * 2 ] = "Nome";
```

### **Regras**

- Variáveis do tipo Data deve-se usar a função MontaData(dd,mm,yyyy,vdData); para atribuir uma data ou atribuir a variável de sistema DatSis
- O nome das variáveis não pode ser igual ao nome dos parâmetros de funções
- O nome das variáveis não pode ser igual ao nome dos campos de listas
- Variáveis devem seguir o padrão de nomenclatura: prefixo + nome descritivo em CamelCase

### **Padrão de Nomenclatura de Variáveis**

A LSP utiliza um padrão específico de nomenclatura que facilita a identificação do tipo de variável:

**Prefixos por Tipo:**

- `va`: Variáveis do tipo **Alfa** (string/texto)
- `vn`: Variáveis do tipo **Numero** (inteiro/decimal)
- `vd`: Variáveis do tipo **Data** (data/hora)

**Regras de Nomenclatura:**

- Use CamelCase após o prefixo
- Nomes descritivos e significativos
- Máximo de 100 caracteres
- Pode conter `_` (underscore)
- Não use acentuação
- Não use palavras reservadas

**Exemplos Corretos:**

```lsp
@ Variáveis Alfa @
Definir Alfa vaNomeCompleto;
Definir Alfa vaEmailUsuario;
Definir Alfa vaCaminhoArquivo;

@ Variáveis Número @
Definir Numero vnIdadeUsuario;
Definir Numero vnValorTotal;
Definir Numero vnContadorRegistros;

@ Variáveis Data @
Definir Data vdDataNascimento;
Definir Data vdDataCadastro;
Definir Data vdDataVencimento;
```

**Exemplos Incorretos:**

```lsp
@ Sem prefixo @
Definir Alfa nome; @ Incorreto @

@ Prefixo errado @
Definir Numero vaIdade; @ Incorreto: va é para Alfa @

@ Nomes não descritivos @
Definir Alfa va1; @ Incorreto: não é descritivo @
Definir Numero vnX; @ Incorreto: muito genérico @
```
