Definir Funcao multiplicar(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado);

@ Execução da função @
Definir Numero vnValor1;
Definir Numero vnValor2;
Definir Numero vnMultiplicacao;

vnValor1 = 5;
vnValor2 = 4;
multiplicar(vnValor1, vnValor2, vnMultiplicacao);

Mensagem(Retorna, "A multiplicação é: " + vnMultiplicacao);

@ ---FUNÇÕES----@

Funcao multiplicar(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado); {
  vnResultado = vnNumero1 * vnNumero2;
} 
