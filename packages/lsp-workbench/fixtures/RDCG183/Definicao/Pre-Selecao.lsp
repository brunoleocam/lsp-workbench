@ -----------------------------------------------------------------------------@

@----- ATENÇÃO, NÃO ALTERAR O RELATÓRIO SEM CONFIRMAÇÃO COM O TRANSPORTE! -----@

@ -----------------------------------------------------------------------------@






@----BUSCA LOGO ATUAL DA EMPRESA---------Controle Imagem tamanho 80 x 80------@

Definir numero vnParam;   @---0: Imagem em arquivo----- 1: Imagem no banco----@
Definir Alfa vaCaminho;   @----Caminho ou Tabela.Campo onde está a imagem-----@
Definir Alfa vaSqlLogo;   @----SELECT de busca da imagem no banco de dados----@
vnParam = 0;
vaCaminho = "\\\\aplicacaonovo\\Senior\\Sapiens\\Imagens\\Atual.jpg";
vaSqlLogo = "";

CarregaImagemControle ("LogoDemobile", vaParam, vaCaminho, vaSqlLogo);
@-----------------------------------------------------------------------------@


Definir Alfa aSQL;
aSQL = "";

Definir Alfa vSql; @Essa variável acompanhará a variável aSQL, porém, usando outro formato de data@
vSql = "";

se (EMosAst = 'N'){
  aSQL = "E135ANE.NUMANE NOT IN (SELECT PES.NUMANE                             \
                                   FROM E135PES PES, E120PED PED               \
                                  WHERE PES.CODEMP = PED.CODEMP                \
                                    AND PES.FILPED = PED.CODFIL                \
                                    AND PES.NUMPED = PED.NUMPED                \
                                    AND PED.USU_PEDAST = 'S'                   \
                                    AND PES.CODEMP = E135ANE.CODEMP            \
                                    AND PES.CODFIL = E135ANE.CODFIL            \
                                    AND PES.NUMANE = E135ANE.NUMANE) AND "; 
  
  /*InsSQLWhereSimples("Detalhe_Transportadora",aSQL);*/ 
  
  vSql = aSQL;
}

Definir Alfa EExcTra;

se ((EExcTra <> " ") E (EExcTra <> "")){
  aSQL = aSQL + "E073TRA.CODTRA NOT IN ("+EExcTra+") AND "; 
  /*InsClauSQLWhere("Detalhe_Transportadora",aSQL);*/ 
  
  vSql = vSql + "E073TRA.CODTRA NOT IN ("+EExcTra+") AND "; 
}

@=== INÍCIO | Tratamento Geral do Motivos de Reagendamento - Chamado REQ31815 - Caio Lima - 08/01/2026 ===@
Definir Funcao SubstMotivos();

Definir Alfa ECodMot; 
Definir Alfa EExcMot; 

Definir Alfa vaGuardaMotivo;
Definir Alfa vaCodMot;
Definir Alfa vaExcMot;

Definir Alfa EDatAge;
Definir Alfa vaDatAge;
Definir Alfa vaData;
Definir Data vdDatAge;

LimpaEspacos(ECodMot);
LimpaEspacos(EExcMot);

vaGuardaMotivo = "";
vaCodMot = ""; 
vaExcMot = "";

vaData = "";
vaDatAge = "";
vdDatAge = 0;

@Formato de data para filtrar no fim da pré-seleção afim de filtrar se existem cargas no período com essas características@
Definir Alfa vaGuardaDataINICIO;
Definir Alfa vaGuardaDataFIM;
Definir Alfa vaDataFiltro;

vaGuardaDataINICIO = "";
vaGuardaDataFIM = "";
vaDataFiltro = "";

Se (EDatAge <> "")
{
  Definir Alfa vaGuardaDatAge;
  Definir Numero vnPos;
  Definir Numero vnTam;
        
  vaGuardaDatAge = "";
  vnPos = 0; 
  vnTam = 0;
  
  vaDatAge = EDatAge;
  vaGuardaDatAge = vaDatAge;
  
  PosicaoAlfa ("-",vaDatAge,vnPos); 
  
  TamanhoAlfa(vaDatAge,vnTam);
  
  Se (vnPos > 0)
  {
    vnTam = 0;
  
    @Zerando variáveis auxiliares@    
    Definir Numero vnDia;
    Definir Numero vnMes;
    Definir Numero vnAno;
    
    Definir Alfa vaDia;
    Definir Alfa vaMes;
    Definir Alfa vaAno;
    
    vnDia = 0;
    vnMes = 0;
    vnAno = 0;   
    
    vaDia = "";
    vaMes = "";
    vaAno = "";
    @------------------------------------------@
    @Quebrando range de data informada na entrada e guardando em duas variáveis@
    vnPos--;
    CopiarAlfa (vaDatAge, 0, vnPos);
    
    vnPos = vnPos + 2;
    
    TamanhoAlfa (vaGuardaDatAge,vnTam);
    CopiarAlfa (vaGuardaDatAge, vnPos, vnTam);    
    @------------------------------------------@
    @Desmontando data início para incluir na query do relatório@
    AlfaParaData(vaDatAge,vdDatAge);
    
    DesmontaData (vdDatAge,vnDia,vnMes,vnAno);
    
    IntParaAlfa(vnDia,vaDia);
    IntParaAlfa(vnMes,vaMes);
    IntParaAlfa(vnAno,vaAno);  
    
    vaGuardaDataINICIO = vaDatAge;
    
    vaDatAge = vaAno+","+vaMes+","+vaDia;    
    @------------------------------------------@
    @Zerando variáveis novamente@    
    vnDia = 0;
    vnMes = 0;
    vnAno = 0;
    
    vaDia = "";
    vaMes = "";
    vaAno = "";
    @------------------------------------------@
    @Desmontando data final para incluir na query do relatório@
    AlfaParaData(vaGuardaDatAge,vdDatAge);
    
    DesmontaData (vdDatAge,vnDia,vnMes,vnAno);
    
    IntParaAlfa(vnDia,vaDia);
    IntParaAlfa(vnMes,vaMes);
    IntParaAlfa(vnAno,vaAno); 
    
    vaGuardaDataFIM = vaGuardaDatAge;
    
    vaGuardaDatAge = vaAno+","+vaMes+","+vaDia;    
  } 
    Senao Se ((vnPos = 0) e(vnTam = 10)) @Uma data apenas, contém 10 caracteres)@ 
    {
      @Desmontando data para incluir na query do relatório@
      AlfaParaData(vaDatAge,vdDatAge);
      
      DesmontaData (vdDatAge,vnDia,vnMes,vnAno);
      
      IntParaAlfa(vnDia,vaDia);
      IntParaAlfa(vnMes,vaMes);
      IntParaAlfa(vnAno,vaAno);  
      
      vaGuardaDataINICIO = vaDatAge;
      vaGuardaDataFIM = vaDatAge;
      
      vaDatAge = vaAno+","+vaMes+","+vaDia; 
      
      vaGuardaDatAge = vaDatAge;      
    }  
    
    @-- EMosAtr=S: somente cargas com atraso (inicio 200 > agend. 100 + tolerancia) --@
    Se (EMosAtr = 'S') {
      Definir Alfa vaTmpTol;
      IntParaAlfa(ETmpTol, vaTmpTol);
    
      aSQL = aSQL + "E135ANE.NUMANE IN (SELECT AGE.USU_NUMANE                    \
                         FROM USU_T135OAN AGE, USU_T135OAN INI                   \
                        WHERE AGE.USU_CODEMP = USU_T135OAN.USU_CODEMP            \
                          AND AGE.USU_CODFIL = USU_T135OAN.USU_CODFIL            \
                          AND INI.USU_CODEMP = AGE.USU_CODEMP                    \
                          AND INI.USU_CODFIL = AGE.USU_CODFIL                    \
                          AND INI.USU_NUMANE = AGE.USU_NUMANE                    \
                          AND AGE.USU_CODTPO = 100                               \
                          AND INI.USU_CODTPO = 200                               \
                          AND INI.USU_DATGER >= AGE.USU_DATGER                   \
                          AND INI.USU_HORGER > (AGE.USU_HORGER + " + vaTmpTol + ")) AND ";
    
      vSql = vSql + "E135ANE.NUMANE IN (SELECT AGE.USU_NUMANE                    \
                         FROM USU_T135OAN AGE, USU_T135OAN INI                   \
                        WHERE AGE.USU_CODEMP = USU_T135OAN.USU_CODEMP            \
                          AND AGE.USU_CODFIL = USU_T135OAN.USU_CODFIL            \
                          AND INI.USU_CODEMP = AGE.USU_CODEMP                    \
                          AND INI.USU_CODFIL = AGE.USU_CODFIL                    \
                          AND INI.USU_NUMANE = AGE.USU_NUMANE                    \
                          AND AGE.USU_CODTPO = 100                               \
                          AND INI.USU_CODTPO = 200                               \
                          AND INI.USU_DATGER >= AGE.USU_DATGER                   \
                          AND INI.USU_HORGER > (AGE.USU_HORGER + " + vaTmpTol + ")) AND ";
    }                       
                           
    @INÍCIO - CHAMADO INC32217 - CAIO LIMA - 09/01/2026 (ISSO ERA UM PROBLEMA ANTIGO, PORÉM COM O DESENVOLVIMENTO DOS FILTROS DE MOTIVO, FICOU MAIS FÁCIL FAZER ESSA ADAPTAÇÃO)@                         
    Se (ESinAna = 'A')
    {                         
      aSQL = aSQL + "E135ANE.NUMANE IN (SELECT USU_NUMANE FROM USU_T135OAN                                                                         \
  					                            WHERE USU_T135OAN.USU_CODEMP = USU_T135OAN.USU_CODEMP                                                      \
  					                            AND USU_T135OAN.USU_CODFIL = USU_T135OAN.USU_CODFIL                                                        \
                                        AND USU_T135OAN.USU_DATGER >= Day("+vaDatAge+") AND USU_T135OAN.USU_DATGER <= Day("+vaGuardaDatAge+")      \
                                        AND (USU_T135OAN.USU_CODTPO = 20 OR (USU_T135OAN.USU_CODTPO >= 100 AND USU_T135OAN.USU_CODTPO <= 950))) AND ";
                                                                              
      vSql = vSql + "E135ANE.NUMANE IN (SELECT USU_NUMANE FROM USU_T135OAN                                                                         \
  					                            WHERE USU_T135OAN.USU_CODEMP = USU_T135OAN.USU_CODEMP                                                      \
  					                            AND USU_T135OAN.USU_CODFIL = USU_T135OAN.USU_CODFIL                                                        \
                                        AND USU_T135OAN.USU_DATGER >= '"+vaGuardaDataINICIO+"' AND USU_T135OAN.USU_DATGER <= '"+vaGuardaDataFIM+"' \
                                        AND (USU_T135OAN.USU_CODTPO = 20 OR (USU_T135OAN.USU_CODTPO >= 100 AND USU_T135OAN.USU_CODTPO <= 950))) AND ";
    }
    
    Se (ESinAna = 'S')
    {                         
      aSQL = aSQL + "E135ANE.NUMANE IN (SELECT USU_NUMANE FROM USU_T135OAN                                                                         \
  					                            WHERE USU_T135OAN.USU_CODEMP = USU_T135OAN.USU_CODEMP                                                      \
  					                            AND USU_T135OAN.USU_CODFIL = USU_T135OAN.USU_CODFIL                                                        \
                                        AND USU_T135OAN.USU_DATGER >= Day("+vaDatAge+") AND USU_T135OAN.USU_DATGER <= Day("+vaGuardaDatAge+")      \
                                        AND USU_T135OAN.USU_CODTPO IN (100, 200, 320, 900, 950)) AND ";
                                                                              
      vSql = vSql + "E135ANE.NUMANE IN (SELECT USU_NUMANE FROM USU_T135OAN                                                                         \
  					                            WHERE USU_T135OAN.USU_CODEMP = USU_T135OAN.USU_CODEMP                                                      \
  					                            AND USU_T135OAN.USU_CODFIL = USU_T135OAN.USU_CODFIL                                                        \
                                        AND USU_T135OAN.USU_DATGER >= '"+vaGuardaDataINICIO+"' AND USU_T135OAN.USU_DATGER <= '"+vaGuardaDataFIM+"' \
                                        AND USU_T135OAN.USU_CODTPO IN (100, 200, 320, 900, 950)) AND ";
    }
                           
    @FIM - CHAMADO INC32217 - CAIO LIMA - 09/01/2026 ===========================@  
    
}    


Se (ECodMot <> "")
{ 
  vaGuardaMotivo = ECodMot; 
  
  SubstMotivos(); 
  
  vaCodMot = "("+ vaGuardaMotivo + ")";
  
  Se (EDatAge <> "")
  {
    vaData = "AND OAN2.USU_DATGER >= Day("+vaDatAge+") AND OAN2.USU_DATGER <= Day("+vaGuardaDatAge+") ";
    
    vaDataFiltro = "AND OAN2.USU_DATGER >= '"+vaGuardaDataINICIO+"' AND OAN2.USU_DATGER <= '"+vaGuardaDataFIM+"' ";
  }
  
  aSQL = aSQL + " E135ANE.NUMANE IN (SELECT USU_NUMANE FROM USU_T135OAN OAN2 WHERE OAN2.USU_CODEMP = USU_T135OAN.USU_CODEMP \
	AND OAN2.USU_CODFIL = USU_T135OAN.USU_CODFIL "+vaData+" AND (OAN2.USU_OBSANE LIKE " + vaCodMot + ")) AND "; 
  
  vSql = vSql + " E135ANE.NUMANE IN (SELECT USU_NUMANE FROM USU_T135OAN OAN2 WHERE OAN2.USU_CODEMP = USU_T135OAN.USU_CODEMP \
	AND OAN2.USU_CODFIL = USU_T135OAN.USU_CODFIL "+vaDataFiltro+" AND (OAN2.USU_OBSANE LIKE " + vaCodMot + ")) AND ";   
}


Se (EExcMot <> "")
{ 
  vaGuardaMotivo = EExcMot; 
  
  SubstMotivos(); 
  
  vaExcMot = "("+ vaGuardaMotivo + ")";
  
  Se (EDatAge <> "")
  {
    vaData = "AND OAN3.USU_DATGER >= Day("+vaDatAge+") AND OAN3.USU_DATGER <= Day("+vaGuardaDatAge+") ";
    
    vaDataFiltro = "AND OAN3.USU_DATGER >= '"+vaGuardaDataINICIO+"' AND OAN3.USU_DATGER <= '"+vaGuardaDataFIM+"' ";
  }
  
  aSQL = aSQL + " E135ANE.NUMANE NOT IN (SELECT USU_NUMANE FROM USU_T135OAN OAN3 WHERE OAN3.USU_CODEMP = USU_T135OAN.USU_CODEMP \
	AND OAN3.USU_CODFIL = USU_T135OAN.USU_CODFIL "+ vaData +" AND (OAN3.USU_OBSANE LIKE " + vaExcMot + ")) AND "; 
	
  vSql = vSql + " E135ANE.NUMANE NOT IN (SELECT USU_NUMANE FROM USU_T135OAN OAN3 WHERE OAN3.USU_CODEMP = USU_T135OAN.USU_CODEMP \
	AND OAN3.USU_CODFIL = USU_T135OAN.USU_CODFIL "+ vaDataFiltro +" AND (OAN3.USU_OBSANE LIKE " + vaExcMot + ")) AND "; 
}

@=== FIM | Tratamento Geral do Motivos de Reagendamento - Chamado REQ31815 - Caio Lima - 08/01/2026 ===@





se (ESinAna = 'S'){
  aSQL = aSQL + "USU_T135OAN.USU_CODTPO IN (100, 200, 320, 900, 950) AND USU_T135OAN.USU_DATGER >= Day(2022,12,28) AND USU_T135CAE.USU_PRIANE NOT IN ('COL', 'PAL', 'PRV') AND USU_T135CAE.USU_PRIANE IS NOT NULL";  
  
  vSql = vSql + "USU_T135OAN.USU_CODTPO IN (100, 200, 320, 900, 950) AND USU_T135OAN.USU_DATGER >= '28/12/2022' AND USU_T135CAE.USU_PRIANE NOT IN ('COL', 'PAL', 'PRV') AND USU_T135CAE.USU_PRIANE IS NOT NULL"; 
}
se (ESinAna = 'A'){
  aSQL = aSQL + "(USU_T135OAN.USU_CODTPO = 20 OR (USU_T135OAN.USU_CODTPO >= 100 AND USU_T135OAN.USU_CODTPO <= 950) AND USU_T135OAN.USU_DATGER >= Day(2022,12,28))      \
  AND USU_T135CAE.USU_PRIANE NOT IN ('COL', 'PAL', 'PRV') AND USU_T135CAE.USU_PRIANE IS NOT NULL";  
  
  vSql = vSql + "(USU_T135OAN.USU_CODTPO = 20 OR (USU_T135OAN.USU_CODTPO >= 100 AND USU_T135OAN.USU_CODTPO <= 950) AND USU_T135OAN.USU_DATGER >= '28/12/2022')      \
  AND USU_T135CAE.USU_PRIANE NOT IN ('COL', 'PAL', 'PRV') AND USU_T135CAE.USU_PRIANE IS NOT NULL";
} 

InsClauSQLWhere("Detalhe_Transportadora",aSQL);




@Checa se há carga no período com esses filtros@
Definir Alfa xCursor;



Definir Alfa EAbrEmp;
Definir Alfa EAbrFil;
Definir Alfa EAbrAne;

Definir Alfa vaAbrEmp;
Definir Alfa vaAbrFil;
Definir Alfa vaAbrAne;
vaAbrEmp = "";
vaAbrFil = "";
vaAbrAne = "";

vaAbrEmp = EAbrEmp;
vaAbrFil = EAbrFil;
vaAbrAne = EAbrAne;

LimpaEspacos(vaAbrEmp);
LimpaEspacos(vaAbrFil);
LimpaEspacos(vaAbrAne);

Se (vaAbrEmp <> "")
{
  vaAbrEmp = "USU_T135OAN.USU_CODEMP IN ("+vaAbrEmp+") AND ";
}

Se (vaAbrFil <> "")
{
  vaAbrFil = "USU_T135OAN.USU_CODFIL IN ("+vaAbrFil+") AND ";
}
                  
Se (vaAbrAne <> "")
{
  vaAbrAne = "E135ANE.NUMANE IN ("+vaAbrAne+") AND ";
}

vSql = "SELECT * FROM E135ANE, USU_T135OAN, USU_T135CAE, USU_T135TPO, E073TRA   \
                  WHERE E073TRA.CODTRA = E135ANE.USU_CODTRA                     \
                  AND USU_T135TPO.USU_CODEMP = USU_T135OAN.USU_CODEMP           \
                  AND USU_T135TPO.USU_CODFIL = USU_T135OAN.USU_CODFIL           \
                  AND USU_T135TPO.USU_CODTPO = USU_T135OAN.USU_CODTPO           \
                  AND USU_T135OAN.USU_CODEMP = E135ANE.CODEMP                   \
                  AND USU_T135OAN.USU_CODFIL = E135ANE.CODFIL                   \
                  AND USU_T135OAN.USU_NUMANE = E135ANE.NUMANE                   \
                  AND USU_T135CAE.USU_CODEMP = USU_T135OAN.USU_CODEMP           \
                  AND USU_T135CAE.USU_CODFIL = USU_T135OAN.USU_CODFIL           \
                  AND USU_T135CAE.USU_NUMANE = USU_T135OAN.USU_NUMANE AND " + vaAbrEmp + vaAbrFil + vaAbrAne + vSql;
           
SQL_Criar(xCursor);
SQL_UsarSQLSenior2(xCursor, 0);
SQL_UsarAbrangencia(xCursor, 0);
SQL_DefinirComando(xCursor, vSql);
SQL_AbrirCursor(xCursor);
Se (SQL_Eof(xCursor)=0) {
  X=1;
} Senao {
    Mensagem(Erro,"Não existem eventos de cargas com essas características no período.");
  }
SQL_FecharCursor(xCursor);
SQL_Destruir(xCursor);







Funcao SubstMotivos();
{
  Se ((vaGuardaMotivo <> "") e ((ECodMot <> "") ou (EExcMot <> "")))
  {  
    SubstAlfa("\"","§", vaGuardaMotivo);

    SubstAlfa("1","'%Cancelado pelo cliente%'", vaGuardaMotivo); 
    SubstAlfa("2","'%Motorista foi embora%'", vaGuardaMotivo);
    SubstAlfa("3","'%Motorista se recusou a carregar%'", vaGuardaMotivo);
    SubstAlfa("4","'%Não compareceu - sem justificativa%'", vaGuardaMotivo);
    SubstAlfa("5","'%Não conseguiu contratar%'", vaGuardaMotivo);
    SubstAlfa("6","'%Problemas na estrada%'", vaGuardaMotivo);
    SubstAlfa("7","'%Reagendado pela Transportadora%'", vaGuardaMotivo);
    SubstAlfa("8","'%Reagendado pelo cliente%'", vaGuardaMotivo);
    SubstAlfa("9","'%Reagendado pelo comercial%'", vaGuardaMotivo);
    SubstAlfa("10","'%Tipo de veículo(não consegue carregar)%'", vaGuardaMotivo);
    SubstAlfa("11","'%Veículo quebrou%'", vaGuardaMotivo);
    SubstAlfa("12","'%Outros/erros Transporte%'", vaGuardaMotivo);
  
    SubstAlfa("§","", vaGuardaMotivo); 
    SubstAlfa(",",") OR USU_OBSANE LIKE (", vaGuardaMotivo);   
  }        
}
