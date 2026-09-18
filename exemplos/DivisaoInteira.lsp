@ Cálculo do quociente e resto da divisão @
Definir Funcao divisaoInteira(Numero vnA, Numero vnB, Numero End vnQuociente, Numero End vnResto);

@ Função principal @
Definir Numero vnA;
Definir Numero vnB;
Definir Numero vnQuociente;
Definir Numero vnResto;
Definir Alfa vaA;
Definir Alfa vaB;
Definir Alfa vaQuociente;
Definir Alfa vaResto;
Definir Alfa vaEnter;
Definir Alfa vaResultado;

CaracterParaAlfa(13, vaEnter);

@ Exemplo de valores @
vnA = 10;
vnB = 3;

divisaoInteira(vnA, vnB, vnQuociente, vnResto);

@ Converter números para alfa @
IntParaAlfa(vnA, vaA);
IntParaAlfa(vnB, vaB);
IntParaAlfa(vnQuociente, vaQuociente);
IntParaAlfa(vnResto, vaResto);

@ Montar mensagem @
vaResultado = "Divisão de " + vaA + " por " + vaB + vaEnter + "Quociente: " + vaQuociente + vaEnter + "Resto: " + vaResto;

Mensagem(Retorna, vaResultado);

@ ---FUNÇÕES----@

Funcao divisaoInteira(Numero vnA, Numero vnB, Numero End vnQuociente, Numero End vnResto); {
  vnQuociente = vnA / vnB;
  RestoDivisao(vnA, vnB, vnResto);
} 
