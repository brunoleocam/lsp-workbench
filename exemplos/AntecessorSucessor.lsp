@ Mostrar antecessor e sucessor de um número @
Definir Funcao antecessorSucessor(Numero vnNumero, Numero End vnAntecessor, Numero End vnSucessor);

@ Função principal @
Definir Numero vnNumero;
Definir Numero vnAntecessor;
Definir Numero vnSucessor;
Definir Alfa vaNumero;
Definir Alfa vaAntecessor;
Definir Alfa vaSucessor;
Definir Alfa vaEnter;
Definir Alfa vaResultado;

CaracterParaAlfa(13, vaEnter);

vnNumero = 10; @ Exemplo de número @

antecessorSucessor(vnNumero, vnAntecessor, vnSucessor);

@ Converter números para alfa @
IntParaAlfa(vnNumero, vaNumero);
IntParaAlfa(vnAntecessor, vaAntecessor);
IntParaAlfa(vnSucessor, vaSucessor);

@ Montar mensagem @
vaResultado = "Número: " + vaNumero + vaEnter + "Antecessor: " + vaAntecessor + vaEnter + "Sucessor: " + vaSucessor;

Mensagem(Retorna, vaResultado);

@ ---FUNÇÕES----@

Funcao antecessorSucessor(Numero vnNumero, Numero End vnAntecessor, Numero End vnSucessor); {
  vnAntecessor = vnNumero - 1;
  vnSucessor = vnNumero + 1;
} 
