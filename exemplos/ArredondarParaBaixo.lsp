@ Arredondar valores para baixo @
@ Remove as casas decimais de um número, mantendo apenas a parte inteira @

Definir Funcao arredondarParaBaixo(Numero vnValor, Numero End vnResultado);

@ Exemplo de uso @
Definir Numero vnNumero;
Definir Numero vnArredondado;
Definir Alfa vaNumero;
Definir Alfa vaArredondado;
Definir Alfa vaMensagem;

@ Teste com valor decimal positivo @
vnNumero = 15.7;
arredondarParaBaixo(vnNumero, vnArredondado);

@ Conversão para exibição @
ConverteMascara(2, vnNumero, vaNumero, "999.99");
ConverteMascara(1, vnArredondado, vaArredondado, "999");

@ Exibir resultado @
vaMensagem = "Valor original: " + vaNumero + " -> Arredondado para baixo: " + vaArredondado;
Mensagem(Retorna, vaMensagem);

@ Teste com valor decimal negativo @
vnNumero = -12.9;
arredondarParaBaixo(vnNumero, vnArredondado);

@ Conversão para exibição @
ConverteMascara(2, vnNumero, vaNumero, "-999.99");
ConverteMascara(1, vnArredondado, vaArredondado, "-999");

@ Exibir resultado @
vaMensagem = "Valor original: " + vaNumero + " -> Arredondado para baixo: " + vaArredondado;
Mensagem(Retorna, vaMensagem);

@ Teste com valor inteiro @
vnNumero = 8;
arredondarParaBaixo(vnNumero, vnArredondado);

@ Conversão para exibição @
ConverteMascara(1, vnNumero, vaNumero, "999");
ConverteMascara(1, vnArredondado, vaArredondado, "999");

@ Exibir resultado @
vaMensagem = "Valor original: " + vaNumero + " -> Arredondado para baixo: " + vaArredondado;
Mensagem(Retorna, vaMensagem);

@ ---FUNÇÕES--- @

@ Função que arredonda o valor para baixo removendo as casas decimais @
Funcao arredondarParaBaixo(Numero vnValor, Numero End vnResultado); {
  vnResultado = Truncar(vnValor); @ Remove as casas decimais @
} 
