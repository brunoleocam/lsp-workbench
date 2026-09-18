@ Verificar se um número é par/ímpar e positivo/negativo @
Definir Funcao verificarNumero(Numero vnNumero, Numero End vnParImpar, Numero End vnPositivoNegativo);

@ Função principal @
Definir Numero vnNumero;
Definir Numero vnParImpar;
Definir Numero vnPositivoNegativo;
Definir Alfa vaResultado;

vnNumero = 10; @ Exemplo de número @

verificarNumero(vnNumero, vnParImpar, vnPositivoNegativo);

@ Montar mensagem com base nos resultados numéricos @
Se (vnParImpar = 0) {
  vaResultado = "O número " + vnNumero + " é par";
} Senao {
  vaResultado = "O número " + vnNumero + " é ímpar";
}

Se (vnPositivoNegativo = 1) {
  vaResultado = vaResultado + "\nO número " + vnNumero + " é positivo";
} Senao Se (vnPositivoNegativo = -1) {
  vaResultado = vaResultado + "\nO número " + vnNumero + " é negativo";
} Senao {
  vaResultado = vaResultado + "\nO número é zero";
}

Mensagem(Retorna, vaResultado);

@ ---FUNÇÕES----@

Funcao verificarNumero(Numero vnNumero, Numero End vnParImpar, Numero End vnPositivoNegativo); {
  Definir Numero vnResto;
  
  @ Verificar se é par ou ímpar @
  RestoDivisao(vnNumero, 2, vnResto);
  vnParImpar = vnResto;
  
  @ Verificar se é positivo ou negativo @
  Se (vnNumero > 0) {
    vnPositivoNegativo = 1;
  } Senao Se (vnNumero < 0) {
    vnPositivoNegativo = -1;
  } Senao {
    vnPositivoNegativo = 0;
  }
} 
