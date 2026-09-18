@ Arredondar valores para cima @
@ Arredonda um número para o próximo inteiro superior @

Definir Funcao arredondarParaCima(Numero vnValor, Numero End vnResultado);

@ Exemplo de uso @
Definir Numero vnNumero;
Definir Numero vnArredondado;
Definir Alfa vaNumero;
Definir Alfa vaArredondado;
Definir Alfa vaMensagem;

@ Teste com valor decimal positivo @
vnNumero = 15.2;
arredondarParaCima(vnNumero, vnArredondado);

@ Conversão para exibição @
ConverteMascara(2, vnNumero, vaNumero, "999.99");
ConverteMascara(1, vnArredondado, vaArredondado, "999");

@ Exibir resultado @
vaMensagem = "Valor original: " + vaNumero + " -> Arredondado para cima: " + vaArredondado;
Mensagem(Retorna, vaMensagem);

@ Teste com valor decimal negativo @
vnNumero = -12.3;
arredondarParaCima(vnNumero, vnArredondado);

@ Conversão para exibição @
ConverteMascara(2, vnNumero, vaNumero, "-999.99");
ConverteMascara(1, vnArredondado, vaArredondado, "-999");

@ Exibir resultado @
vaMensagem = "Valor original: " + vaNumero + " -> Arredondado para cima: " + vaArredondado;
Mensagem(Retorna, vaMensagem);

@ Teste com valor inteiro @
vnNumero = 8;
arredondarParaCima(vnNumero, vnArredondado);

@ Conversão para exibição @
ConverteMascara(1, vnNumero, vaNumero, "999");
ConverteMascara(1, vnArredondado, vaArredondado, "999");

@ Exibir resultado @
vaMensagem = "Valor original: " + vaNumero + " -> Arredondado para cima: " + vaArredondado;
Mensagem(Retorna, vaMensagem);

@ Teste com valor decimal pequeno @
vnNumero = 0.1;
arredondarParaCima(vnNumero, vnArredondado);

@ Conversão para exibição @
ConverteMascara(2, vnNumero, vaNumero, "999.99");
ConverteMascara(1, vnArredondado, vaArredondado, "999");

@ Exibir resultado @
vaMensagem = "Valor original: " + vaNumero + " -> Arredondado para cima: " + vaArredondado;
Mensagem(Retorna, vaMensagem);

@ ---FUNÇÕES--- @

@ Função que arredonda o valor para cima @
Funcao arredondarParaCima(Numero vnValor, Numero End vnResultado); {
  Definir Numero vnValorInteiro;
  
  @ Obtem a parte inteira @
  vnValorInteiro = Truncar(vnValor);
  
  @ Se o valor original é maior que a parte inteira, adiciona 1 @
  Se (vnValorInteiro < vnValor) {
    vnResultado = vnValorInteiro + 1;
  } Senao {
    vnResultado = vnValorInteiro;
  }
} 
