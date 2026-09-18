@ Consumidor — funções vêm de operacoes.lsp (mesmo escopo projeto / contexto). @
@ Ctrl+Espaço deve sugerir somar, subtrair, multiplicar, dividir. @
@ Aceitar a chamada gera FUN009 até importar a implementação (Quick Fix). @

Definir Numero vnValor1;
Definir Numero vnValor2;
Definir Numero vnSoma;
Definir Numero vnDiff;
Definir Numero vnProd;
Definir Numero vnQuoc;
Definir Alfa vaMsg;

vnValor1 = 20;
vnValor2 = 5;

somar(vnValor1, vnValor2, vnSoma);
subtrair(vnValor1, vnValor2, vnDiff);
multiplicar(vnValor1, vnValor2, vnProd);
dividir(vnValor1, vnValor2, vnQuoc);

IntParaAlfa(vnSoma, vaMsg);
Mensagem(Retorna, "Soma: " + vaMsg);
