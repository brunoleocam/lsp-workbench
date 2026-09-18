Definir Funcao somar(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado);

@ Execução da função @
Definir Numero vnValor1;
Definir Numero vnValor2;
Definir Numero vnSoma;

vnValor1 = 10;
vnValor2 = 20;
somar(vnValor1, vnValor2, vnSoma);

Mensagem(Retorna, "A soma é: " + vnSoma);

@ ---FUNÇÕES----@

Funcao somar(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado); {
  vnResultado = vnNumero1 + vnNumero2;
}
