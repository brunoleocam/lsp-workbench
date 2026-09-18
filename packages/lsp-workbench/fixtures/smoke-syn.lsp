@ smoke-syn — SYN001..SYN010 (+ RUL008 via SYN006) — todos com QF (Ctrl+. / Ctrl+Espaço) @
@ SYN001: falta ponto-e-virgula — QF → acrescentar ; @
Definir Numero vnA
Definir Numero vnB;
@ SYN010: tipo/identificador solto — Senior: falta valor, expressao ou comando — QF → remover ou Definir @
numero;
@ SYN006/RUL008: prefixo desalinhado — QF → vnErrado→vaErrado OU Definir Numero vnErrado @
Definir Alfa vnErrado;
vnB = 1;
@ SYN005: Definir depois de stmt — QF → mover Definir ao topo @
Definir Numero vnTarde;
@ SYN002: Se sem () — QF → Se (cond) @
Se vnB > 0 {
  vnB = 2;
}
@ SYN003: e/ou sem partes parentizadas — QF → ((a) e (b)) @
Se (vnA > 0 e vnB < 10) {
  vnB = 3;
}
@ SYN004: Inicio/Fim legado — QF → chaves @
Inicio
  vnB = 4;
Fim;
@ SYN009: literal longo sem barra invertida — QF → quebrar linha @
vaLonga = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
@ SYN008: chave extra — QF → remover chave extra (alerta nesta linha) @
Se ((vnB = 1)) {
  vnB = 5;
}}
@ SYN007: comentario bloco aberto — QF → fechar bloco (deixe por ultimo) @
/* comentario sem fechar
