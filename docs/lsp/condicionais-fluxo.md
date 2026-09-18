# Controle de Fluxo

### **Resumo das Estruturas de Controle**

| **Estrutura** | **Uso** | **Sintaxe** |
|---|---|---|
| **🔀 Se/Senao** | Decisões | `Se (condição) { } Senao { }` |
| **🔄 Para** | Loop contado | `Para (i=1; i<=10; i++) { }` |
| **🔁 Enquanto** | Loop condicional | `Enquanto (condição) { }` |
| **⏹️ Pare** | Interromper loop | `Pare;` |
| **↩️ VaPara** | Pular para rótulo | `VaPara etiqueta;` |

### **IMPORTANTE: Uso Correto do Comando Pare**

O comando `Pare;` **só pode ser usado dentro de loops** (`Para` ou `Enquanto`). Se usado fora destes contextos, causará erro de compilação.

#### **Uso CORRETO:**

```lsp
@ Dentro de loop Para @
Para (vnI = 1; vnI <= 10; vnI++) {
  Se (vnI = 5) {
    Pare;  @ ✅ CORRETO: dentro do loop Para @
  }
}

@ Dentro de loop Enquanto @
Enquanto (vnContador > 0) {
  Se (vnContador = 3) {
    Pare;  @ ✅ CORRETO: dentro do loop Enquanto @
  }
  vnContador--;
}
```

#### **Uso INCORRETO:**

```lsp
@ ❌ INCORRETO: dentro de função, fora de loops @
Funcao validarDados(); {
  Se (vnTamanho < 5) {
    Mensagem(Erro, "Tamanho inválido");
    Pare;  @ ❌ ERRO: Pare só funciona em loops! @
  }
}

@ ✅ CORRETO: usar Cancel(1) para interromper função @
Funcao validarDados(); {
  Se (vnTamanho < 5) {
    Mensagem(Erro, "Tamanho inválido");
    Cancel(1);  @ ✅ CORRETO: para interromper função @
  }
}
```

**Resumo:**

- **Para interromper loops:** Use `Pare;`
- **Para interromper funções:** Use `Cancel(1);`
- **Para interromper toda a execução:** Use `Cancel(1);`

### **Quadro de Boas Práticas: Cancel(1) vs Pare**

| **Situação** | **Comando** | **Exemplo** | **Observação** |
|---|---|---|---|
| **Sair de função** | `Cancel(1);` | `Funcao nomeDaFuncao() { @corpo da função@ @caso precise interromper o fluxo, use: @ Cancel(1);}` | Use sempre que precisar interromper execução |
| **Sair de loop** | `Pare;` | `Se (condição) { Pare; }` | **Apenas** dentro de `Para` ou `Enquanto` |
| **Fora de loop** | `Cancel(1);` | `Se (erro) { Cancel(1); }` | **Nunca** use `Pare;` fora de loops |
| **Tratamento de erro** | `Cancel(1);` | `Se (dadoNulo) { Cancel(1); }` | Padrão para validações |

#### **Exemplo Prático de Uso Correto:**

```lsp
Definir Funcao exemploControleFluxo();

@ Variáveis globais @
Definir Numero vnContador;
Definir Alfa vaDados;
Definir Numero vnTamanho;

exemploControleFluxo();

Funcao exemploControleFluxo(); { 
  @ Loop com Pare - usar Pare @
  vnContador = 1;
  Para (vnContador = 1; vnContador <= 10; vnContador++) {
    Se (vnContador = 5) {
      Pare;  @ ✅ CORRETO: saindo de loop @
    }
  }
  
  @ Validação final - usar Cancel(1) @
  TamanhoAlfa(vaDados, vnTamanho);
  Se (vnTamanho < 3) {
    Cancel(1);  @ ✅ CORRETO: saindo de função @
  }
  
  Mensagem(Retorna, "Processamento concluído!");
}
```

**⚠️ REGRAS FUNDAMENTAIS:**

1. **`Pare;`** = **APENAS** dentro de loops (`Para` ou `Enquanto`)
2. **`Cancel(1);`** = Para sair de funções, tratamento de erros, validações
3. **Nunca** use `Pare;` fora de loops
4. **Sempre** use `Cancel(1);` após mensagens de erro

### **Condicionais Progressivos**

#### **Nível 1: Condicional Simples**

```lsp
Definir Numero vnIdade;
vnIdade = 20;

Se (vnIdade >= 18) {
  Mensagem(Retorna, "Maior de idade");
} Senao {
  Mensagem(Retorna, "Menor de idade");
}
```

#### **Nível 2: Múltiplas Condições**

```lsp
Definir Numero vnNota;
Definir Alfa vaConceito;
Definir Alfa vaMensagem;

vnNota = 85;

Se (vnNota >= 90) {
  vaConceito = "Excelente";
} Senao Se (vnNota >= 80) {
  vaConceito = "Bom";
} Senao Se (vnNota >= 70) {
  vaConceito = "Regular";
} Senao Se (vnNota >= 60) {
  vaConceito = "Suficiente";
} Senao {
  vaConceito = "Insuficiente";
}

vaMensagem = "Conceito: " + vaConceito;
Mensagem(Retorna, vaMensagem);
```

#### **Nível 3: Condições Complexas**

```lsp
Definir Numero vnIdade;
Definir Alfa vaCategoria;
Definir Numero vnRenda;
Definir Numero vnPontuacao;

vnIdade = 25;
vaCategoria = "PREMIUM";
vnRenda = 5000;

Se ((vnIdade >= 18) e (vnIdade <= 65) e (vaCategoria = "PREMIUM") e (vnRenda > 3000)) {
  vnPontuacao = 100;
  Mensagem(Retorna, " Cliente aprovado com pontuação máxima!");
} Senao Se ((vnIdade >= 18) e (vnRenda > 1500)) {
  vnPontuacao = 70;
  Mensagem(Retorna, "Cliente aprovado com restrições");
} Senao {
  vnPontuacao = 0;
  Mensagem(Retorna, "Cliente não aprovado");
}
```

### Estrutura de Repetição

As estruturas de repetição são utilizadas para executar blocos de código repetidamente.

Exemplo de uso do `Enquanto`:

```lsp
Definir Numero vnContador;
Definir Alfa vaContadorStr;
vnContador = 0;

Enquanto (vnContador < 10) {
  IntParaAlfa(vnContador, vaContadorStr);
  Mensagem(Retorna, vaContadorStr);
  vnContador++;
}
```

Exemplo de uso do `Para`:

```lsp
Definir Alfa vaIStr;
Para (i = 0; i < 10; i++) {
  IntParaAlfa(i, vaIStr);
  Mensagem(Retorna, vaIStr);
}
```

### Pare

O comando `Pare` é utilizado para interromper a execução de um bloco de repetição.

Exemplo de uso do `Pare`:

```lsp
Definir Alfa vaContadorStr;
Para (vnContador = 0; vnContador < 10; vnContador++) {
  Se (vnContador = 5) {
    Pare;
  }
  IntParaAlfa(vnContador, vaContadorStr);
  Mensagem(Retorna, vaContadorStr);
}
```

### VaPara

O comando `VaPara` é utilizado para desviar a execução do programa para um ponto específico da regra.

Exemplo de uso do `VaPara`:

```lsp
Definir Numero vnIdade;
vnIdade = 20;

Se (vnIdade < 18) {
  VaPara menorDeIdade;
}

Mensagem(Retorna, "Maior de idade");
VaPara fim;

menorDeIdade:
Mensagem(Retorna, "Menor de idade");

fim:
```

### Recursividade

A recursividade é uma técnica de programação onde uma função chama a si mesma para resolver um problema. Em LSP, a recursividade pode ser implementada seguindo alguns padrões específicos.

#### Estrutura Básica de uma Função Recursiva

Uma função recursiva em LSP geralmente possui:

1. Um ou mais casos base (condições de parada)
2. Um ou mais casos recursivos (chamadas à própria função)

Exemplo de implementação recursiva da sequência de Fibonacci:

```lsp
@ Função recursiva para calcular o n-ésimo termo da sequência de Fibonacci @
Funcao fibonacciRecursivo(Numero vnTermo, Numero vnAnterior, Numero vnAtual, Numero End vnResultado); {
  @ Caso base 1: primeiro termo @
  Se (vnTermo = 0) {
    vnResultado = vnAnterior;
  } 
  @ Caso base 2: segundo termo @
  Senao Se (vnTermo = 1) {
    vnResultado = vnAtual;
  } 
  @ Caso recursivo: termos subsequentes @
  Senao {
    fibonacciRecursivo(vnTermo - 1, vnAtual, vnAnterior + vnAtual, vnResultado);
  }
};
```

#### Características Importantes da Recursividade em LSP

1. **Parâmetros de Entrada e Saída**:
   - Use o parâmetro `End` para retornar valores
   - Passe os valores necessários para a próxima chamada recursiva

2. **Condições de Parada**:
   - Sempre defina casos base claros
   - Evite recursão infinita

3. **Chamada Recursiva**:
   - Modifique os parâmetros para se aproximar do caso base
   - Passe os valores atualizados para a próxima chamada

#### Boas Práticas

1. **Eficiência**:
   - Evite recálculos desnecessários
   - Considere usar parâmetros auxiliares para armazenar resultados intermediários

2. **Legibilidade**:
   - Comente claramente os casos base e recursivos
   - Use nomes descritivos para variáveis e parâmetros

3. **Limitações**:
   - Esteja ciente do limite da pilha de chamadas
   - Considere usar abordagens iterativas para problemas muito grandes

#### Exemplo Completo: Sequência de Fibonacci

```lsp
@ Exercício - Sequência de Fibonacci (versão recursiva) @
Definir Funcao fibonacciRecursivo(Numero vnTermo, Numero vnAnterior, Numero vnAtual, Numero End vnResultado);
Definir Funcao calcularFibonacci();

@ Função principal @
Definir Numero vnTermos;
Definir Alfa vaTermos;
Definir Alfa vaResultado;
Definir Numero vnContador;
Definir Alfa vaTermo;
Definir Numero vnTermoAtual;

vnTermos = 10; @ Número de termos da sequência @

@ Converter número para alfa @
IntParaAlfa(vnTermos, vaTermos);

@ Montar mensagem inicial @
vaResultado = "Sequência de Fibonacci com " + vaTermos + " termos: ";

calcularFibonacci();

@ Exibir sequência completa @
Mensagem(Retorna, vaResultado);

Funcao calcularFibonacci(); {
  @ Calcular e acumular todos os termos @
  Para (vnContador = 0; vnContador < vnTermos; vnContador++) {
    fibonacciRecursivo(vnContador, 0, 1, vnTermoAtual);
    IntParaAlfa(vnTermoAtual, vaTermo);
    Se (vnContador = 0) {
      vaResultado = vaResultado + vaTermo;
    } Senao {
      vaResultado = vaResultado + ", " + vaTermo;
    }
  }
};

Funcao fibonacciRecursivo(Numero vnTermo, Numero vnAnterior, Numero vnAtual, Numero End vnResultado); {
  Se (vnTermo = 0) {
    vnResultado = vnAnterior;
  } Senao Se (vnTermo = 1) {
    vnResultado = vnAtual;
  } Senao {
    fibonacciRecursivo(vnTermo - 1, vnAtual, vnAnterior + vnAtual, vnResultado);
  }
};
```

Este exemplo demonstra:

- Definição clara de casos base
- Passagem de parâmetros para a próxima chamada recursiva
- Uso do parâmetro `End` para retorno de valores
- Acumulação de resultados em uma string
- Formatação adequada da saída
