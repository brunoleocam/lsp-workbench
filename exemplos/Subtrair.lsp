Definir Funcao subtrair(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado);

@ Execução da função @
Definir Numero vnValor1;
Definir Numero vnValor2;
Definir Numero vnSubtracao;

vnValor1 = 20;
vnValor2 = 10;
subtrair(vnValor1, vnValor2, vnSubtracao);

Mensagem(Retorna, "A subtração é: " + vnSubtracao);

@ ---FUNÇÕES----@

Funcao subtrair(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado); {
  vnResultado = vnNumero1 - vnNumero2;
} 
