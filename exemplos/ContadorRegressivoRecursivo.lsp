@ Contador Regressivo (versão recursiva) @
Definir Funcao contadorRegressivo(Numero vnNumero);

@ Função principal @
Definir Numero vnNumero;
Definir Alfa vaMensagem;
Definir Alfa vaNumero;

vnNumero = 5; @ Número inicial para a contagem regressiva @
vaMensagem = "Contagem Regressiva: ";

@ Iniciar contagem regressiva @
contadorRegressivo(vnNumero);

@ Exibir resultado @
Mensagem(Retorna, vaMensagem);

@ ---FUNÇÕES----@

Funcao contadorRegressivo(Numero vnNumero); {
  Definir Alfa vaNumero;
  
  @ Converter número para alfa @
  IntParaAlfa(vnNumero, vaNumero);
  
  @ Caso base: quando chegar a 0 @
  Se (vnNumero = 0) {
    vaMensagem = vaMensagem + vaNumero;
  } 
  @ Caso recursivo: continuar contagem @
  Senao {
    vaMensagem = vaMensagem + vaNumero + ", ";
    contadorRegressivo(vnNumero - 1);
  }
}; 
