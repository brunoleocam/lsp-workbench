@ Sequência de Fibonacci (versão recursiva) @
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

@ ---FUNÇÕES----@

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
