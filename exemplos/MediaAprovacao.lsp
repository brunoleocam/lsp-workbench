@ Cálculo da média de quatro notas e verificação de aprovação @
Definir Funcao verificarAprovacao(Numero vnNota1, Numero vnNota2, Numero vnNota3, Numero vnNota4, Numero End vnMedia, Numero End vnAprovado);

@ Função principal @
Definir Alfa vaNome;
Definir Numero vnNota1;
Definir Numero vnNota2;
Definir Numero vnNota3;
Definir Numero vnNota4;
Definir Numero vnMedia;
Definir Numero vnAprovado;
Definir Alfa vaSituacao;
Definir Alfa vaEnter;
Definir Alfa vaMedia;
Definir Alfa vaMensagem;

CaracterParaAlfa(13, vaEnter);

@ Exemplo de dados @
vaNome = "João Silva";
vnNota1 = 7.0;
vnNota2 = 8.5;
vnNota3 = 6.0;
vnNota4 = 7.5;

verificarAprovacao(vnNota1, vnNota2, vnNota3, vnNota4, vnMedia, vnAprovado);

@ Montar mensagem com base no resultado numérico @
Se (vnAprovado = 1) {
  vaSituacao = "Aprovado";
} Senao {
  vaSituacao = "Reprovado";
}

IntParaAlfa(vnMedia, vaMedia);

@ Montar mensagem final @
vaMensagem = "Aluno: " + vaNome + vaEnter + "Média: " + vaMedia + vaEnter + "Situação: " + vaSituacao;

Mensagem(Retorna, vaMensagem);

@ ---FUNÇÕES----@

Funcao verificarAprovacao(Numero vnNota1, Numero vnNota2, Numero vnNota3, Numero vnNota4, Numero End vnMedia, Numero End vnAprovado); {
  @ Cálculo da média @
  vnMedia = (vnNota1 + vnNota2 + vnNota3 + vnNota4) / 4;
  
  @ Verificação de aprovação @
  Se (vnMedia >= 7) {
    vnAprovado = 1;
  } Senao {
    vnAprovado = 0;
  }
} 
