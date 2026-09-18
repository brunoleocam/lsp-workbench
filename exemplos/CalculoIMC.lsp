@ Cálculo do IMC @
Definir Numero vnPeso;
Definir Numero vnAltura;
Definir Numero vnIMC;
Definir Alfa vaIMC;
Definir Alfa vaResultado;

@ Exemplo de valores @
vnPeso = 101;    @ em kg @
vnAltura = 1.83; @ em metros @

@ Cálculo do IMC @
vnIMC = vnPeso / (vnAltura * vnAltura);

@ Converter IMC para alfa @
IntParaAlfa(vnIMC, vaIMC);

@ Classificação do IMC @
Se (vnIMC < 18.5) {
  vaResultado = "IMC: " + vaIMC + " - Abaixo do peso";
} Senao Se (vnIMC <= 24.9) {
  vaResultado = "IMC: " + vaIMC + " - Peso ideal (parabéns)";
} Senao Se (vnIMC <= 29.9) {
  vaResultado = "IMC: " + vaIMC + " - Levemente acima do peso";
} Senao Se (vnIMC <= 34.9) {
  vaResultado = "IMC: " + vaIMC + " - Obesidade grau I";
} Senao Se (vnIMC <= 39.9) {
  vaResultado = "IMC: " + vaIMC + " - Obesidade grau II (severa)";
} Senao {
  vaResultado = "IMC: " + vaIMC + " - Obesidade grau III (mórbida)";
}

Mensagem(Retorna, vaResultado); 
