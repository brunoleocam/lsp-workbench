@ Contador Progressivo (versão recursiva) @
Definir Funcao contadorProgressivo(Numero vnNumero, Numero vnAtual);

@ Função principal @
Definir Numero vnNumero;
Definir Numero vnAtual;
Definir Alfa vaMensagem;
Definir Alfa vaNumero;

vnNumero = 5; @ Número final para a contagem progressiva @
vnAtual = 0; @ Número inicial da contagem @
vaMensagem = "Contagem Progressiva: ";

@ Iniciar contagem progressiva @
contadorProgressivo(vnNumero, vnAtual);

@ Exibir resultado @
Mensagem(Retorna, vaMensagem);

@ ---FUNÇÕES----@

Funcao contadorProgressivo(Numero vnNumero, Numero vnAtual); {
  Definir Alfa vaNumero;
  
  @ Converter número para alfa @
  IntParaAlfa(vnAtual, vaNumero);
  
  @ Caso base: quando chegar ao número final @
  Se (vnAtual = vnNumero) {
    vaMensagem = vaMensagem + vaNumero;
  } 
  @ Caso recursivo: continuar contagem @
  Senao {
    vaMensagem = vaMensagem + vaNumero + ", ";
    contadorProgressivo(vnNumero, vnAtual + 1);
  }
}; 
