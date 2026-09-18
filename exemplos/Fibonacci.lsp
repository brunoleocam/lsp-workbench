@ Sequência de Fibonacci @
Definir Funcao fibonacci();

@ Função principal @
Definir Numero vnTermos;
Definir Alfa vaTermos;
Definir Alfa vaResultado;
Definir Numero vnAnterior;
Definir Numero vnAtual;
Definir Numero vnProximo;
Definir Numero vnContador;
Definir Alfa vaAnterior;
Definir Alfa vaAtual;
Definir Alfa vaProximo;

vnTermos = 10; @ Número de termos da sequência @

@ Converter número para alfa @
IntParaAlfa(vnTermos, vaTermos);

@ Montar mensagem inicial @
vaResultado = "Sequência de Fibonacci com " + vaTermos + " termos: ";

fibonacci();

@ Exibir sequência completa @
Mensagem(Retorna, vaResultado);

@ ---FUNÇÕES----@

Funcao fibonacci(); {
  vnAnterior = 0;
  vnAtual = 1;
  
  @ Converter e acumular os dois primeiros termos @
  IntParaAlfa(vnAnterior, vaAnterior);
  IntParaAlfa(vnAtual, vaAtual);
  vaResultado = vaResultado + vaAnterior + ", " + vaAtual;
  
  Para (vnContador = 3; vnContador <= vnTermos; vnContador++) {
    vnProximo = vnAnterior + vnAtual;
    IntParaAlfa(vnProximo, vaProximo);
    vaResultado = vaResultado + ", " + vaProximo;
    vnAnterior = vnAtual;
    vnAtual = vnProximo;
  }
}; 
