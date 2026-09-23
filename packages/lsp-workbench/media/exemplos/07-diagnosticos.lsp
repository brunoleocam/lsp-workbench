Definir Numero vnA;
Definir Numero vnB;
vnB = 1;

@ SYN002 — Se sem parênteses @
Se (vnB > 0) {
  vnB = 2;
}

@ SYN003 — e/ou sem partes parentizadas @
Se ((vnA > 0) e (vnB < 10)) {
  vnB = 3;
}

@ Uso típico errado de retorno por atribuição (diagnóstico FUN/SEM) @
TamanhoAlfa("texto", vnA);
