@ smoke-sem — SEM001..SEM003 @
Definir Numero vnA;
Definir Cursor Cur_Ped;
Definir Numero vnArq;

@ SEM001: vaB sem Definir (vn* implícito NÃO alerta — Numero = 0) @
vaB = "x";

@ SEM002: Abrir sem Fechar — QF → Fechar(vnArq); | Completar @
vnArq = Abrir("tmp.txt", Gravar);

@ SEM003: AbrirCursor sem FecharCursor — QF → .FecharCursor(); | Completar (Enquanto+) @
Cur_Ped.SQL = "SELECT 1 FROM DUAL";
Cur_Ped.AbrirCursor();
