@ smoke-rul — RUL001..RUL019 (exceto RUL008, coberto em smoke-syn) @
Definir Numero vnX;
Definir Numero vnTamanho;
Definir Numero vnNulo;
Definir Numero vnDataHora;
Definir Numero vnRetSql;
Definir Data vdData;
Definir Alfa vaTexto;
Definir Alfa vaJSON;
Definir Alfa vaSaida;

@ RUL001 — QF → Funcao Foo(); + Definir Alfa vaP; (nunca Foo(vaP) / Alfa na assinatura) @
Funcao Foo(Alfa vaP);
{
  vaTexto = "x";
}

@ RUL002 — QF → TamanhoAlfa(vaTexto, vnTamanho); @
vnTamanho = TamanhoAlfa(vaTexto);

@ RUL003 — QF → EstaNulo(...); Se (vnNulo = 0) { @
Se (EstaNulo(vaTexto, vnNulo) = 0) {
  vnX = 1;
}

@ RUL004 — QF → DataHora(vnDataHora); FormatarData(vnDataHora, …) @
FormatarData(vdData, "dd/MM/yyyy", vaSaida);

@ RUL005 — QF → vnCampo = Grid.Codigo; IntParaAlfa(vnCampo, …) @
IntParaAlfa(Grid.Codigo, vaSaida);

@ RUL006 — QF → vaMsg = …; Mensagem(Retorna, vaMsg); @
Mensagem(Retorna, "x" + vaTexto);

@ RUL007 — QF → Cancel(1); @
Retorna;

@ RUL009 — QF → Se (= 0) | ou Ignorar alerta (sem comentário no código) @
ExecSQLEx(vaTexto, vnRetSql);
Se (vnRetSql = 1) {
  vnX = 2;
}

@ RUL010 — sem QF (aviso payload; Ignorar alerta sem comentário) @
Mensagem(Retorna, vaJSON);

@ RUL011 — QF → RestoDivisao(vnX, 2, vnX); @
vnX = vnX % 2;

@ RUL012 — QF → CaracterParaAlfa(13, vaTexto); @
vaTexto = Chr(13);

@ RUL013 — QF → CaracterParaAlfa(13, vaEnter); + concat @
vaTexto = "linha1\nlinha2";

@ RUL014 — QF → Pare; (grifa só Break) @
Break;

@ RUL015 — QF → vdData = CodData(15, 8, 1990); | alt. MontaData(..., vdData) @
vdData = 15/08/1990;

@ RUL016 — QF → Definir Numero vnCancel; @
Definir Numero Cancel;

@ RUL017 — sem QF (Pare fora de loop) @
Pare;

@ RUL018 — alerta se Alfa sem SQL atribuído @
ExecSQL(vaTexto);

@ RUL019 — Cancel só 1|2|3 — QF → Cancel(1)|Cancel(2)|Cancel(3) @
Cancel(4);
