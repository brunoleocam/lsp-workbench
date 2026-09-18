@ Ordenar três números em ordem decrescente @
Definir Funcao ordenarDecrescente(Numero vnNumero1, Numero vnNumero2, Numero vnNumero3, Numero End vnMaior, Numero End vnMedio, Numero End vnMenor);

@ Função principal @
Definir Numero vnNumero1;
Definir Numero vnNumero2;
Definir Numero vnNumero3;
Definir Numero vnMaior;
Definir Numero vnMedio;
Definir Numero vnMenor;
Definir Alfa vaMaior;
Definir Alfa vaMedio;
Definir Alfa vaMenor;
Definir Alfa vaResultado;

@ Exemplo de números @
vnNumero1 = 5;
vnNumero2 = 2;
vnNumero3 = 8;

ordenarDecrescente(vnNumero1, vnNumero2, vnNumero3, vnMaior, vnMedio, vnMenor);

@ Converter números para alfa @
IntParaAlfa(vnMaior, vaMaior);
IntParaAlfa(vnMedio, vaMedio);
IntParaAlfa(vnMenor, vaMenor);

@ Montar mensagem @
vaResultado = "Números em ordem decrescente: " + vaMaior + ", " + vaMedio + ", " + vaMenor;

Mensagem(Retorna, vaResultado);

@ ---FUNÇÕES----@

Funcao ordenarDecrescente(Numero vnNumero1, Numero vnNumero2, Numero vnNumero3, Numero End vnMaior, Numero End vnMedio, Numero End vnMenor); {
  Definir Numero vnAuxiliar;
  
  vnMaior = vnNumero1;
  vnMedio = vnNumero2;
  vnMenor = vnNumero3;
  
  @ Ordenação em ordem decrescente @
  Se (vnMaior < vnMedio) {
    vnAuxiliar = vnMaior;
    vnMaior = vnMedio;
    vnMedio = vnAuxiliar;
  }
  
  Se (vnMedio < vnMenor) {
    vnAuxiliar = vnMedio;
    vnMedio = vnMenor;
    vnMenor = vnAuxiliar;
  }
  
  Se (vnMaior < vnMedio) {
    vnAuxiliar = vnMaior;
    vnMaior = vnMedio;
    vnMedio = vnAuxiliar;
  }
} 
