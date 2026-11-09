@ smoke-sem-loops — SEM005 (Achou sem Proximo) e SEM006 (Continue antes do Proximo) — sem QF @
Definir Numero vnTotal;
Definir Cursor Cur_Itens;
Definir Cursor Cur_Notas;

Cur_Itens.SQL "SELECT CODPRO FROM E075PRO";
Cur_Itens.AbrirCursor();
Enquanto (Cur_Itens.Achou) {
  vnTotal = vnTotal + 1;
}
Cur_Itens.FecharCursor();

Cur_Notas.SQL "SELECT NUMNFV FROM E140NFV";
Cur_Notas.AbrirCursor();
Enquanto (Cur_Notas.Achou) {
  Se (vnTotal > 10) {
    Continue;
  }
  vnTotal = vnTotal + 1;
  Cur_Notas.Proximo();
}
Cur_Notas.FecharCursor();
