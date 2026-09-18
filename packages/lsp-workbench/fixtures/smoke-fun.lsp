@ smoke-fun — FUN001..FUN006 (anti-padrões para QF / Ctrl+Espaço) @
Definir Numero vnX;
Definir Numero vnY;
Definir Numero vnDh;
Definir Data vdD;
Definir Alfa vaFmt;
Definir Alfa vaSql;

@ FUN001 — QF → vnY = Truncar(vnX);  |  TruncarDecimal / TruncarValor via Ctrl+Espaço @
Truncar(vnX, vnY);

@ FUN002 — QF → FormatarData(vnDh, "dd/mm/yyyy", vaFmt); @
FormatarData(vnDh, "DD/MM/YYYY", vaFmt);

@ FUN003 — QF → EstaNulo(vaD, vnY); + Definir Alfa vaD; (grifa só vdD) @
EstaNulo(vdD, vnY);

@ FUN004 — QF → … vnCodigo; + Definir Numero vnCodigo; (grifa só pCodigo) @
SQL_RetornarInteiro(vaSql, "CODIGO", pCodigo);

@ FUN005 — Ctrl+Espaço / QF: Arredonda(vnX, 2); (literal; sem criar vnCasas) @
Arredondar(vnX, 2, vnY);

@ FUN006 — QF: Arredonda(vnX, <vnDecimais>); (2º param pendente / snippet) @
Arredonda(vnX);
