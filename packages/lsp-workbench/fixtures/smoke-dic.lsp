@ smoke-dic — DEM002, DEM003, SQL012..SQL015, SEM007 (dicionário e cursores, PDR-012 etapa 6b) — sem QF @
Definir Alfa vaDescricao;
Definir Cursor Cur_E075Pro;
Definir Cursor Cur_Vazio;

vaDescricao = E075PRO.XYZ;
Cur_Vazio.AbrirCursor();
Cur_Vazio.FecharCursor();

Cur_E075Pro.SQL "SELECT CODPRO, CODPRO, CAMPOX \
                   FROM E075PRO \
                  WHERE CODEMP = :vnEmpresa";
Cur_E075Pro.AbrirCursor();
Se (Cur_E075Pro.Achou) {
  vaDescricao = Cur_E075Pro.DESPRO;
  Cur_E075Pro.CODPRO = "X";
}
Cur_E075Pro.FecharCursor();
