@ Exercício 5 - Cálculo da média de três notas @
Definir Funcao calcularMediaTresNotas(Numero vnNota1, Numero vnNota2, Numero vnNota3, Numero End vnMedia);

@ Função principal @
Definir Numero vnNota1;
Definir Numero vnNota2;
Definir Numero vnNota3;
Definir Numero vnMedia;
Definir Alfa vaMedia;
Definir Alfa vaResultado;

@ Exemplo de notas @
vnNota1 = 7.5;
vnNota2 = 8.0;
vnNota3 = 6.5;

calcularMediaTresNotas(vnNota1, vnNota2, vnNota3, vnMedia);

@ Converter média para alfa @
IntParaAlfa(vnMedia, vaMedia);

@ Montar mensagem @
vaResultado = "Média das notas: " + vaMedia;

Mensagem(Retorna, vaResultado);

@ ---FUNÇÕES----@

Funcao calcularMediaTresNotas(Numero vnNota1, Numero vnNota2, Numero vnNota3, Numero End vnMedia); {
  vnMedia = (vnNota1 + vnNota2 + vnNota3) / 3;
} 
