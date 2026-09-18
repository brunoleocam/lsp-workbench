# Exercícios Práticos por Nível

### **Nível 1: Exercícios Básicos**

#### **Exercício 1: Calculadora Simples**

**Objetivo:** Criar uma calculadora que soma dois números
**Conceitos:** Variáveis, operadores, conversões, mensagens

```lsp
@ Calculadora Simples @
Definir Numero vnNumero1;
Definir Numero vnNumero2;
Definir Numero vnResultado;
Definir Alfa vaResultadoStr;
Definir Alfa vaMensagem;

vnNumero1 = 10;
vnNumero2 = 20;
vnResultado = vnNumero1 + vnNumero2;

IntParaAlfa(vnResultado, vaResultadoStr);
vaMensagem = "Resultado: " + vaResultadoStr;
Mensagem(Retorna, vaMensagem);
```

#### **Exercício 2: Validador de Nome**

**Objetivo:** Validar se um nome tem pelo menos 3 caracteres
**Conceitos:** Validação, condicionais, funções de string

```lsp
@ Validador de Nome @
Definir Alfa vaNome;
Definir Numero vnTamanho;
Definir Numero vnEhNulo;

vaNome = "João";
EstaNulo(vaNome, vnEhNulo);

Se (vnEhNulo = 0) {
  TamanhoAlfa(vaNome, vnTamanho);
  Se (vnTamanho >= 3) {
    Mensagem(Retorna, "Nome válido!");
  } Senao {
    Mensagem(Erro, "Nome deve ter pelo menos 3 caracteres");
  }
} Senao {
  Mensagem(Erro, "Nome não pode ser nulo");
}
```

### **Nível 2: Exercícios Intermediários**

#### **Exercício 3: Formatador de CPF**

**Objetivo:** Remover pontos e traços de um CPF
**Conceitos:** Manipulação de strings, loops, funções avançadas

```lsp
@ Formatador de CPF @
Definir Alfa vaCPF;
Definir Numero vnPosicao;

vaCPF = "123.456.789-10";

@ Remove pontos @
DeletarAlfa(vaCPF, 4, 1);
DeletarAlfa(vaCPF, 7, 1);
DeletarAlfa(vaCPF, 10, 1);

Mensagem(Retorna, "CPF limpo: " + vaCPF);
```

#### **Exercício 4: Calculadora de Idade**

**Objetivo:** Calcular idade a partir da data de nascimento
**Conceitos:** Datas, operações aritméticas, validação

```lsp
@ Calculadora de Idade @
Definir Data vdDataNascimento;
Definir Data vdDataAtual;
Definir Numero vnAnoNascimento;
Definir Numero vnAnoAtual;
Definir Numero vnIdade;
Definir Alfa vaIdadeStr;
Definir Alfa vaMensagem;

@ Define data de nascimento (exemplo: 15/08/1990) @
MontaData(15, 8, 1990, vdDataNascimento);
DataHoje(vdDataAtual);

@ Extrai anos @
Definir Numero vnDia;
Definir Numero vnMes;
DecodData(vdDataNascimento, vnDia, vnMes, vnAnoNascimento);
DecodData(vdDataAtual, vnDia, vnMes, vnAnoAtual);

@ Calcula idade @
vnIdade = vnAnoAtual - vnAnoNascimento;

IntParaAlfa(vnIdade, vaIdadeStr);
vaMensagem = "Idade: " + vaIdadeStr + " anos";
Mensagem(Retorna, vaMensagem);
```

### **Nível 3: Exercícios Avançados**

#### **Exercício 5: Validador de Email**

**Objetivo:** Validar formato básico de email
**Conceitos:** Manipulação de strings, validação complexa

```lsp
@ Validador de Email @
Definir Alfa vaEmail;
Definir Numero vnPosArroba;
Definir Numero vnPosPonto;
Definir Numero vnTamanho;
Definir Numero vnEhNulo;

vaEmail = "usuario@empresa.com.br";

@ Verifica se não é nulo @
EstaNulo(vaEmail, vnEhNulo);
Se (vnEhNulo = 1) {
  Mensagem(Erro, "Email não pode ser nulo");
  Cancel(1);
}

@ Verifica se tem @ @
PosicaoAlfa("@", vaEmail, vnPosArroba);
Se (vnPosArroba = 0) {
  Mensagem(Erro, "Email deve conter @");
  Cancel(1);
}

@ Verifica se tem ponto após @ @
TamanhoAlfa(vaEmail, vnTamanho);
CopiarAlfa(vaEmail, vnPosArroba + 1, vnTamanho - vnPosArroba);
PosicaoAlfa(".", vaEmail, vnPosPonto);
Se (vnPosPonto <= vnPosArroba) {
  Mensagem(Erro, "Email deve conter ponto após @");
  Cancel(1);
}

Mensagem(Retorna, "Email válido!");
```

#### **Exercício 6: Processador de Lista CSV**

**Objetivo:** Processar uma lista separada por vírgulas
**Conceitos:** Listas, loops, funções de lista

```lsp
@ Processador de Lista CSV @
Definir Alfa vaLista;
Definir Alfa vaItem;
Definir Numero vnQuantidade;
Definir Numero vnContador;

vaLista = "João,Maria,Pedro,Ana";

@ Conta itens @
ListaQuantidade(vaLista, ",", vnQuantidade);

@ Processa cada item @
Para (vnContador = 1; vnContador <= vnQuantidade; vnContador++) {
  ListaItem(vaLista, ",", vnContador, vaItem);
  Mensagem(Retorna, "Item " + vaItem + " processado");
}
```

---
