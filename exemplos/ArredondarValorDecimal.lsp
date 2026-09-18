@ Arredondar valor decimal @
@ Arredonda um número baseado em um limite decimal específico @

Definir Funcao arredondaValor(Numero vnValor, Numero vnLimiteDecimal, Numero End vnResultado);

@ Exemplo de uso @
Definir Numero vnNumero;
Definir Numero vnLimite;
Definir Numero vnArredondado;
Definir Alfa vaNumero;
Definir Alfa vaLimite;
Definir Alfa vaArredondado;
Definir Alfa vaMensagem;

@ Teste 1: Valor 15.7 com limite 0.5 (deve arredondar para cima) @
vnNumero = 15.7;
vnLimite = 0.5;
arredondaValor(vnNumero, vnLimite, vnArredondado);

@ Conversão para exibição @
ConverteMascara(2, vnNumero, vaNumero, "999.99");
ConverteMascara(2, vnLimite, vaLimite, "999.99");
ConverteMascara(1, vnArredondado, vaArredondado, "999");

@ Exibir resultado @
vaMensagem = "Valor: " + vaNumero + " | Limite: " + vaLimite + " | Resultado: " + vaArredondado;
Mensagem(Retorna, vaMensagem);

@ Teste 2: Valor 15.3 com limite 0.5 (deve arredondar para baixo) @
vnNumero = 15.3;
vnLimite = 0.5;
arredondaValor(vnNumero, vnLimite, vnArredondado);

@ Conversão para exibição @
ConverteMascara(2, vnNumero, vaNumero, "999.99");
ConverteMascara(2, vnLimite, vaLimite, "999.99");
ConverteMascara(1, vnArredondado, vaArredondado, "999");

@ Exibir resultado @
vaMensagem = "Valor: " + vaNumero + " | Limite: " + vaLimite + " | Resultado: " + vaArredondado;
Mensagem(Retorna, vaMensagem);

@ Teste 3: Valor 15.8 com limite 0.7 (deve arredondar para cima) @
vnNumero = 15.8;
vnLimite = 0.7;
arredondaValor(vnNumero, vnLimite, vnArredondado);

@ Conversão para exibição @
ConverteMascara(2, vnNumero, vaNumero, "999.99");
ConverteMascara(2, vnLimite, vaLimite, "999.99");
ConverteMascara(1, vnArredondado, vaArredondado, "999");

@ Exibir resultado @
vaMensagem = "Valor: " + vaNumero + " | Limite: " + vaLimite + " | Resultado: " + vaArredondado;
Mensagem(Retorna, vaMensagem);

@ Teste 4: Valor 15.6 com limite 0.7 (deve arredondar para baixo) @
vnNumero = 15.6;
vnLimite = 0.7;
arredondaValor(vnNumero, vnLimite, vnArredondado);

@ Conversão para exibição @
ConverteMascara(2, vnNumero, vaNumero, "999.99");
ConverteMascara(2, vnLimite, vaLimite, "999.99");
ConverteMascara(1, vnArredondado, vaArredondado, "999");

@ Exibir resultado @
vaMensagem = "Valor: " + vaNumero + " | Limite: " + vaLimite + " | Resultado: " + vaArredondado;
Mensagem(Retorna, vaMensagem);

@ Teste 5: Valor inteiro (não deve alterar) @
vnNumero = 15;
vnLimite = 0.5;
arredondaValor(vnNumero, vnLimite, vnArredondado);

@ Conversão para exibição @
ConverteMascara(1, vnNumero, vaNumero, "999");
ConverteMascara(2, vnLimite, vaLimite, "999.99");
ConverteMascara(1, vnArredondado, vaArredondado, "999");

@ Exibir resultado @
vaMensagem = "Valor: " + vaNumero + " | Limite: " + vaLimite + " | Resultado: " + vaArredondado;
Mensagem(Retorna, vaMensagem);

@ ---FUNÇÕES--- @

@ Função que arredonda o valor respeitando um limite decimal @
@ Se a parte decimal for maior que o limite, arredonda para cima @
@ Se a parte decimal for menor ou igual ao limite, arredonda para baixo @
Funcao arredondaValor(Numero vnValor, Numero vnLimiteDecimal, Numero End vnResultado); {
  Definir Numero vnValorInteiro;
  Definir Numero vnValorDecimal;

  @ Obtem a parte inteira @
  vnValorInteiro = Truncar(vnValor);
  
  @ Calcula a parte decimal @
  vnValorDecimal = vnValor - vnValorInteiro;
  
  @ Se a parte decimal for maior que o limite, arredonda para cima @
  Se (vnValorDecimal > vnLimiteDecimal) {
    vnResultado = vnValorInteiro + 1;  
  } Senao {
    vnResultado = vnValorInteiro;
  }
} 
