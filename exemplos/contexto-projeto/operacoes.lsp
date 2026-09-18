/**
 * Biblioteca de operações aritméticas (exemplo PDR-003).
 * Usar a partir de main.lsp no mesmo escopo de projeto.
 */

/**
 * Soma dois números; resultado no parâmetro de saída.
 * @param vnNumero1 Primeiro operando
 * @param vnNumero2 Segundo operando
 * @param vnResultado [End] Saída
 * @returns void — via parâmetro End
 */
Definir Funcao somar(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado);

/**
 * Subtrai vnNumero2 de vnNumero1.
 * @param vnNumero1 Minuendo
 * @param vnNumero2 Subtraendo
 * @param vnResultado [End] Saída
 * @returns void — via parâmetro End
 */
Definir Funcao subtrair(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado);

/**
 * Multiplica dois números.
 * @param vnNumero1 Fator
 * @param vnNumero2 Fator
 * @param vnResultado [End] Saída
 * @returns void — via parâmetro End
 */
Definir Funcao multiplicar(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado);

/**
 * Divide vnNumero1 por vnNumero2.
 * @param vnNumero1 Dividendo
 * @param vnNumero2 Divisor
 * @param vnResultado [End] Saída
 * @returns void — via parâmetro End
 */
Definir Funcao dividir(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado);

Funcao somar(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado); {
  vnResultado = vnNumero1 + vnNumero2;
}

Funcao subtrair(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado); {
  vnResultado = vnNumero1 - vnNumero2;
}

Funcao multiplicar(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado); {
  vnResultado = vnNumero1 * vnNumero2;
}

Funcao dividir(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado); {
  vnResultado = vnNumero1 / vnNumero2;
}
