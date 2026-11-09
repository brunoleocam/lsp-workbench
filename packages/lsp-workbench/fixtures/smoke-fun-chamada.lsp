@ smoke-fun-chamada — FUN010..FUN014 (checagem de chamada, PDR-012 etapa 4) — sem QF @
Definir Numero vnNum;
Definir Alfa vaTexto;
Definir Alfa vaSaida;
Definir Cursor Cur_Pro;

FuncaoQueNaoExiste(vnNum);
Retorna(vnNum, vnNum);
IntParaAlfa(vaTexto, vaSaida);
IntParaAlfa(vnNum, vaTexto + vaSaida);
IntParaAlfa(vnNum, Cur_Pro.CodPro);
