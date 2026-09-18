Definir Funcao dividir(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado);

@ Execução da função @
Definir Numero vnValor1;
Definir Numero vnValor2;
Definir Numero vnDivisao;

vnValor1 = 20;
vnValor2 = 5;
dividir(vnValor1, vnValor2, vnDivisao);

Mensagem(Retorna, "A divisão é: " + vnDivisao);

@ ---FUNÇÕES----@

Funcao dividir(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado); {
  Se (vnNumero2 = 0) {
    Mensagem(Erro, "Não é possível dividir por zero!");
    vnResultado = 0;
  } Senao {
    vnResultado = vnNumero1 / vnNumero2;
  }
} 
