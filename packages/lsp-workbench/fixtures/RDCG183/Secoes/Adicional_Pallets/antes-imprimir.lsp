@ -----------------------------------------------------------------------------@

@----- ATENÇÃO, NÃO ALTERAR O RELATÓRIO SEM CONFIRMAÇÃO COM O TRANSPORTE! -----@

@ -----------------------------------------------------------------------------@




@------------------------------------------------------------------------------@


Definir Alfa vaSql;
Definir Alfa xCursor;
Definir Alfa vaTemp;
Definir Alfa vaPos; 

vaSql = "SELECT USU_OBSANE FROM USU_T135OAN \
          WHERE USU_CODEMP = :vnCodEmp      \
          AND USU_CODFIL = :vnCodFil        \
          AND USU_NUMANE = :vnNumAne        \
          AND USU_CODTPO = 3";
            
SQL_Criar(xCursor);
SQL_UsarSQLSenior2(xCursor, 0);
SQL_UsarAbrangencia(xCursor, 0);
SQL_DefinirComando(xCursor, vaSql);
SQL_DefinirInteiro(xCursor, "vnCodEmp", E135ANE.CODEMP);
SQL_DefinirInteiro(xCursor, "vnCodFil", E135ANE.CODFIL);
SQL_DefinirInteiro(xCursor, "vnNumAne", E135ANE.NUMANE); 
SQL_AbrirCursor(xCursor);
Se (SQL_Eof(xCursor)=0) {
  SQL_RetornarAlfa(xCursor, "USU_OBSANE", vaTemp);  
  ListaItem(vaTemp,"|", 3, vaPos);
  LimpaEspacos(vaPos);
  AlfaParaInt(vaPos,vnPalMadEnv);
    
  ListaItem(vaTemp,"|", 4, vaPos);
  LimpaEspacos(vaPos);
  AlfaParaInt(vaPos,vnPalFerEnv);
       
  ListaItem(vaTemp,"|", 5, vaPos);
  LimpaEspacos(vaPos);
  AlfaParaInt(vaPos,vnPalMadRec);
  

  ListaItem(vaTemp,"|", 6, vaPos);
  LimpaEspacos(vaPos);
  AlfaParaInt(vaPos,vnPalFerRec);
  
  
  vnPalMadSaldoTra = vnPalMadSaldoTra + vnPalMadEnv;  
  vnPalMadSaldoTra = vnPalMadSaldoTra - vnPalMadRec;
  vnPalFerSaldoTra = vnPalFerSaldoTra + vnPalFerEnv;  
  vnPalFerSaldoTra = vnPalFerSaldoTra - vnPalFerRec;
  vnPalMadSaldoEmp = vnPalMadSaldoEmp + vnPalMadEnv;  
  vnPalMadSaldoEmp = vnPalMadSaldoEmp - vnPalMadRec;
  vnPalFerSaldoEmp = vnPalFerSaldoEmp + vnPalFerEnv;  
  vnPalFerSaldoEmp = vnPalFerSaldoEmp - vnPalFerRec;        
}
Senao {
  vnPalMadEnv = 0;
  vnPalFerEnv = 0;
  vnPalMadRec = 0;
  vnPalFerRec = 0;
}  



SQL_FecharCursor(xCursor);
SQL_Destruir(xCursor);