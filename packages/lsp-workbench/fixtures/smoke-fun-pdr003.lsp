@ smoke-fun-pdr003 — FUN007 / FUN008 / FUN009 (PDR-003) @
Definir Numero vnA;
Definir Numero vnB;
Definir Numero vnR;

@ FUN007 — Definir Funcao sem implementação @
Definir Funcao soDecl(Numero vnX, Numero End vnOut);

@ FUN008 — Funcao sem Definir Funcao @
Funcao soImpl(Numero vnX, Numero End vnOut); {
  vnOut = vnX;
}

@ FUN009 — chamada a função elegível só em outro arquivo (scopedExternal no MANIFEST) @
somar(vnA, vnB, vnR);
