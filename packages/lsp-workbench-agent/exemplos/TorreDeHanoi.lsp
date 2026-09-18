@ Torre de Hanói @
Definir Funcao hanoi(Numero vnDiscos, Numero vnOrigem, Numero vnAuxiliar, Numero vnDestino);

@ Função principal @
Definir Numero vnDiscos;
Definir Alfa vaDiscos;
Definir Alfa vaResultado;
Definir Alfa vaEnter; @ Adicionar variável para quebra de linha @

CaracterParaAlfa(13, vaEnter); @ Inicializar vaEnter com o caracter 13 da tabela ASCII @

vnDiscos = 5; @ Número de discos @

@ Converter número para alfa @
IntParaAlfa(vnDiscos, vaDiscos);

@ Montar mensagem inicial @
vaResultado = "Solução da Torre de Hanói com " + vaDiscos + " discos:";

hanoi(vnDiscos, 1, 2, 3); @ 1 = Torre A, 2 = Torre B, 3 = Torre C @

@ Exibir resultado completo @
Mensagem(Retorna, vaResultado);

@ ---FUNÇÕES----@

Funcao hanoi(Numero vnDiscos, Numero vnOrigem, Numero vnAuxiliar, Numero vnDestino); {
  Definir Alfa vaDiscos;
  Definir Alfa vaOrigem;
  Definir Alfa vaDestino;
  
  Se (vnDiscos = 1) {
    IntParaAlfa(vnOrigem, vaOrigem);
    IntParaAlfa(vnDestino, vaDestino);
    
    @ Montar mensagem @
    vaResultado = vaResultado + "Mover disco 1 da torre " + vaOrigem + " para a torre " + vaDestino + vaEnter; 
  } Senao {
    hanoi(vnDiscos - 1, vnOrigem, vnDestino, vnAuxiliar);
    
    IntParaAlfa(vnDiscos, vaDiscos);
    IntParaAlfa(vnOrigem, vaOrigem);
    IntParaAlfa(vnDestino, vaDestino);
    vaResultado = vaResultado + "Mover disco " + vaDiscos + " da torre " + vaOrigem + " para a torre " + vaDestino + vaEnter; 
    
    hanoi(vnDiscos - 1, vnAuxiliar, vnOrigem, vnDestino);
  }
};
