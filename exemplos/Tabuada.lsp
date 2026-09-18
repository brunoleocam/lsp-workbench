@ Tabuada de um número @
Definir Funcao calcularTabuada();

@ Função principal @
Definir Numero vnNumero;
Definir Alfa vaNumero;
Definir Alfa vaResultado;
Definir Alfa vaEnter;
Definir Numero vnContador;
Definir Numero vnResultado;
Definir Alfa vaContador;
Definir Alfa vaResultadoLinha;

CaracterParaAlfa(13, vaEnter);

vnNumero = 5; @ Exemplo de número @

@ Converter número para alfa @
IntParaAlfa(vnNumero, vaNumero);

@ Montar mensagem inicial @
vaResultado = "Tabuada do " + vaNumero + vaEnter;

calcularTabuada();

@ Exibir tabuada completa @
Mensagem(Retorna, vaResultado);

@ ---FUNÇÕES----@

Funcao calcularTabuada(); {
  Para (vnContador = 1; vnContador <= 10; vnContador++) {
    vnResultado = vnNumero * vnContador;
    
    @ Converter números para alfa @
    IntParaAlfa(vnContador, vaContador);
    IntParaAlfa(vnResultado, vaResultadoLinha);
    
    @ Acumular linha da tabuada @
    vaResultado = vaResultado + vaNumero + " x " + vaContador + " = " + vaResultadoLinha + vaEnter;
  }
}; 
