
--------------------------------------------------------------------------------
Código: 1 - Descrição: ModeloGerador_Funções Globais
--------------------------------------------------------------------------------

Definir Lista Lst;
Lst.DefinirCampos();
Lst.AdicionarCampo("CODTRA", numero);
Lst.AdicionarCampo("NOMTRA", alfa);
Lst.AdicionarCampo("TOTANE", numero);
Lst.AdicionarCampo("TOTATR", numero);
Lst.AdicionarCampo("TOTCPR", numero);
Lst.AdicionarCampo("POREFIATR", numero);
Lst.AdicionarCampo("POREFICPR", numero);
Lst.AdicionarCampo("POREFIGRL", numero);
Lst.EfetivarCampos();

Lst.Chave("CODTRA");

--------------------------------------------------------------------------------
Código: 2 - Descrição: ModeloGerador_Inicialização
--------------------------------------------------------------------------------







@ -----------------------------------------------------------------------------@

@----- ATENÇÃO, NÃO ALTERAR O RELATÓRIO SEM CONFIRMAÇÃO COM O TRANSPORTE! -----@

@ -----------------------------------------------------------------------------@



Definir numero vImpZeb;
Se (EImpZeb = 'S') vImpZeb = 1;

Definir alfa vaObs;
Definir alfa vaObsReag;
Definir alfa vaMotivo;


Definir numero vnHorAge;
Definir numero vnHorIni;
Definir numero vnHorFim;

Definir numero vnAtraso;
Definir numero vnComp;
Definir numero vnTemObs;
Definir numero vnTemObsReag;
Definir numero vnTemObsReagSemJus;
Definir numero vnTemMotivo;

Definir numero vnContAne;
Definir numero vnContAtraso;
Definir numero vnContNaoComp;


Definir data vdDatAge;
Definir data vdDatIni;
Definir data vdDatFim;



vnTemObs = 0;
vnTemObsReag = 0;
vnTemObsReagSemJus = 0;
vnTemMotivo = 0;
vnContAne = 0;
vnContAtraso = 0;
vnContNaoComp = 0;
vnTransp = 0;

Definir Lista Lst;

Lst.DefinirCampos();
Lst.AdicionarCampo("CODTRA", numero);
Lst.AdicionarCampo("NOMTRA", alfa);
Lst.AdicionarCampo("TOTANE", numero);
Lst.AdicionarCampo("TOTATR", numero);
Lst.AdicionarCampo("TOTCPR", numero);
Lst.AdicionarCampo("POREFIATR", numero);
Lst.AdicionarCampo("POREFICPR", numero);
Lst.AdicionarCampo("POREFIGRL", numero);
Lst.EfetivarCampos();

--------------------------------------------------------------------------------
Código: 3 - Descrição: ModeloGerador_Pré-Seleção
--------------------------------------------------------------------------------







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

--------------------------------------------------------------------------------
Código: 4 - Descrição: ModeloGerador_Seleção
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 5 - Descrição: ModeloGerador_Finalização
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 6 - Descrição: ModeloGerador_Imprimir Página
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 7 - Descrição: Cabecalho_Depois Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 8 - Descrição: Cabecalho_Antes Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 9 - Descrição: DFundo_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 10 - Descrição: Tit_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 11 - Descrição: SNumPag_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 12 - Descrição: LogoDemobile_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 13 - Descrição: Rodape_Cabecalho_Depois Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 14 - Descrição: Rodape_Cabecalho_Antes Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 15 - Descrição: Sistema001_Na Impressão
--------------------------------------------------------------------------------

Se (EMosUsu='N')
   Cancel(1);



--------------------------------------------------------------------------------
Código: 16 - Descrição: DUsuario_Na Impressão
--------------------------------------------------------------------------------

Se (EMosUsu='N')
   Cancel(1);



--------------------------------------------------------------------------------
Código: 17 - Descrição: Sistema002_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 18 - Descrição: Total_Geral_Depois Imprimir
--------------------------------------------------------------------------------







@ -----------------------------------------------------------------------------@

@----- ATENÇÃO, NÃO ALTERAR O RELATÓRIO SEM CONFIRMAÇÃO COM O TRANSPORTE! -----@

@ -----------------------------------------------------------------------------@





SaltarPagina ();
ListaSecao ("Adicional_Vazio");
ListaSecao ("Adicional_Titulo_Transp");

Definir Lista Lst;
Lst.Chave("POREFIGRL;CODTRA");
Lst.Primeiro();

Enquanto (Lst.FDA = 0) { 
 FCodTra = Lst.CODTRA;
 Dtra    = Lst.NOMTRA;
 FTotAne = Lst.TOTANE;
 FTotAtr = Lst.TOTATR;
 FTotComp = Lst.TOTCPR;
 FPorEfiAtr = Lst.POREFIATR;
 FPorEfiCpr = Lst.POREFICPR;
 FPorEfiGrl = Lst.POREFIGRL;
 Lst.Proximo();
 ListaSecao ("Adicional_Transp");
}
ListaSecao ("Adicional_Subtotal_Transp");



ListaSecao("Adicional_Empresa");


--------------------------------------------------------------------------------
Código: 19 - Descrição: Total_Geral_Antes Imprimir
--------------------------------------------------------------------------------

ListaSecao ("Adicional_Vazio");



--------------------------------------------------------------------------------
Código: 20 - Descrição: TAtraso_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 21 - Descrição: Descricao011_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 22 - Descrição: Descricao012_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 23 - Descrição: TCarregamento_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 24 - Descrição: Desenho003_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 25 - Descrição: Descricao013_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 26 - Descrição: FPorGrl_Na Impressão
--------------------------------------------------------------------------------

se (TCarregamento = 0){
  TCarregamento = 1;
}
FPorGrl =  ((TCarregamento - (TAtraso + TComp)) * 100) / TCarregamento;

--------------------------------------------------------------------------------
Código: 27 - Descrição: Descricao001_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 28 - Descrição: Descricao028_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 29 - Descrição: TComp_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 30 - Descrição: Descricao027_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 31 - Descrição: Descricao029_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 32 - Descrição: Descricao031_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 33 - Descrição: FPorNComp_Na Impressão
--------------------------------------------------------------------------------

se (TCarregamento = 0){
  TCarregamento = 1;
}

FPorNComp =  ((TCarregamento - TComp) * 100) / TCarregamento;

--------------------------------------------------------------------------------
Código: 34 - Descrição: Descricao032_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 35 - Descrição: FPorAtr_Na Impressão
--------------------------------------------------------------------------------

se (TCarregamento = 0){
  TCarregamento = 1;
}
FPorAtr =  ((TCarregamento - TAtraso) * 100) / TCarregamento;

--------------------------------------------------------------------------------
Código: 36 - Descrição: Descricao033_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 37 - Descrição: Detalhe_Transportadora_Depois Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 38 - Descrição: Detalhe_Transportadora_Antes Imprimir
--------------------------------------------------------------------------------







@ -----------------------------------------------------------------------------@

@----- ATENÇÃO, NÃO ALTERAR O RELATÓRIO SEM CONFIRMAÇÃO COM O TRANSPORTE! -----@

@ -----------------------------------------------------------------------------@




@------------------------------------------------------------------------------@
@-- Imprimir Zebrado --@
Se (vImpZeb > 0)
{
  AlteraControle("Detalhe_Transportadora", "Cor", "#ebebeb");
  vImpZeb = vImpZeb * -1;  
}
Senao
{                                                                 
  AlteraControle("Detalhe_Transportadora", "Cor", "#ffffff");
  vImpZeb = vImpZeb * -1;                                               
}                         
@------------------------------------------------------------------------------@

Definir Alfa vaListaObs;
Definir Alfa vaValor;
Definir Alfa vaDesTpo;
Definir Alfa vaReagendamento;
Definir Alfa vaPriAne;
                               
Definir numero vnQtde;

vaListaObs = USU_T135OAN.USU_OBSANE;

vaPriAne = USU_T135CAE.USU_PRIANE;
LimpaEspacos(vaPriAne);
@-- Verifica se tem observação na carga --@
Se (USU_T135OAN.USU_CodTpo = 20){
  ListaItem(vaListaObs, "|", 4, vaObs);
  ListaItem(vaListaObs, "|", 5, vaMotivo);
  
  vnTemObs = 1;
  vnTemMotivo = 1;
  
  Se ((vaObs = "") ou (vaObs = " ")) {
    vnTemObs = 0;
  } 
  
  Se ((vaMotivo = "") ou (vaMotivo = " ")) {
    vnTemMotivo = 0;
  }
  
  DMotivo = vaMotivo;
  DObs = vaObs;

  Cancel(3);
}


@-- Verifica se tem Reagendamento --@
Se ((USU_T135OAN.USU_CodTpo = 950) e (vaPriAne <> "COL")){
  vaDesTpo = USU_T135TPO.USU_DESTPO;
  
  @ListaItem(vaDesTpo, "|", 2, vaReagendamento);@
  ListaItem(vaListaObs, "|", 3, vaObsReag);
  
  @Se (vaReagendamento = "Reagendamento") {@

  vnTemObsReag = 1;
  Se (vaObsReag = "Não compareceu - sem justificativa"){
    vnTemObsReagSemJus = 1;
  }
  Se (vaObsReag = "Tipo de veículo (não consegue carregar)"){
    vnTemObsReagSemJus = 1;
  }
  Se (vaObsReag = "Não conseguiu contratar"){
    vnTemObsReagSemJus = 1;
  }
  Se (vaObsReag = "Reagendado pela Transportadora"){
    vnTemObsReagSemJus = 1;
  }
  Se (vaObsReag = "Veículo quebrou"){
    vnTemObsReagSemJus = 1;
  }
  Se (vaObsReag = "Motorista se recusou a carregar"){
    vnTemObsReagSemJus = 1;
  }
  Se (vaObsReag = "Cancelado pelo cliente"){
    vnTemObsReagSemJus = 1;
  }
  Se (vaObsReag = "Reagendado pelo cliente"){
    vnTemObsReagSemJus = 1;
  }
  Se (vaObsReag = "Reagendado pelo comercial"){
    vnTemObsReagSemJus = 1;
  }
  Se (vaObsReag = "Motorista foi embora"){
    vnTemObsReagSemJus = 1;
  }
  Se (vaObsReag = "Problemas na estrada"){
    vnTemObsReagSemJus = 1;
  }
  Se (vaObsReag = "Outros/erros Transporte"){
    vnTemObsReagSemJus = 1;
  }       
  @}@
  
  
  Se ((vaObsReag = "") ou (vaObsReag = " ")) {
    vnTemObsReag = 0;
    vnTemObsReagSemJus = 0;
  }
     
}

@-- Coleta a data e Hora de Agendamento da Carga --@
Se (USU_T135OAN.USU_CodTpo = 100){
  vdDatAge = USU_T135OAN.USU_DATGER;
  vnHorAge = USU_T135OAN.USU_HORGER;  
}

@-- Coleta a data e Hora de Início --@
Se (USU_T135OAN.USU_CodTpo = 200){
  vdDatIni = USU_T135OAN.USU_DATGER;
  vnHorIni = USU_T135OAN.USU_HORGER;
}


FAtraso = 0;
FMarcaAtraso = 0;
FMarcaNaoComparecimento = 0;






--------------------------------------------------------------------------------
Código: 39 - Descrição: Cadastro002_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 40 - Descrição: Cadastro004_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 41 - Descrição: Cadastro005_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 42 - Descrição: Cadastro006_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 43 - Descrição: Cadastro007_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 44 - Descrição: Cadastro008_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 45 - Descrição: Cadastro009_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 46 - Descrição: Cadastro010_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 47 - Descrição: Cadastro011_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 48 - Descrição: Cadastro012_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 49 - Descrição: Cadastro013_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 50 - Descrição: Cadastro014_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 51 - Descrição: Cadastro015_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 52 - Descrição: Cadastro016_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 53 - Descrição: Cadastro017_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 54 - Descrição: Descricao009_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 55 - Descrição: DDesTpo_Na Impressão
--------------------------------------------------------------------------------

DDesTpo = "";
Definir alfa vaDesTpoModAux;
Definir alfa vaObsAneAux;
Se (USU_T135OAN.USU_CodTpo = 950){
  ListaItem(USU_T135TPO.USU_DesTpo, "|", 2, vaDesTpoModAux);
  ListaItem(USU_T135OAN.USU_OBSANE, "|", 3, vaObsAneAux);
  DDesTpo =  vaDesTpoModAux + " | " + vaObsAneAux;
} senao {
  DDesTpo = USU_T135TPO.USU_DesTpo;
}

--------------------------------------------------------------------------------
Código: 56 - Descrição: Cadastro001_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 57 - Descrição: Subtotal_Carga_Depois Imprimir
--------------------------------------------------------------------------------







@ -----------------------------------------------------------------------------@

@----- ATENÇÃO, NÃO ALTERAR O RELATÓRIO SEM CONFIRMAÇÃO COM O TRANSPORTE! -----@

@ -----------------------------------------------------------------------------@




@------------------------------------------------------------------------------@

Se (EMosPal = 'S') {
  ListaSecao("Adicional_Pallets");
}

--------------------------------------------------------------------------------
Código: 58 - Descrição: Subtotal_Carga_Antes Imprimir
--------------------------------------------------------------------------------







@ -----------------------------------------------------------------------------@

@----- ATENÇÃO, NÃO ALTERAR O RELATÓRIO SEM CONFIRMAÇÃO COM O TRANSPORTE! -----@

@ -----------------------------------------------------------------------------@




@------------------------------------------------------------------------------@

Definir alfa vaLista;
Definir alfa vaNumAne;
Definir alfa vaPriAne;
Definir alfa vaCodTra;
Definir alfa vaNomTra;
Definir alfa vaContAne;
Definir alfa vaContAtraso;
Definir alfa vaContNaoComp;
Definir alfa vaPOREFIATR;
Definir alfa vaPOREFICPR;
Definir alfa vaPOREFIGRL;
                                        
Definir Funcao MontarLista();                   

vnCaeCodEmp = USU_T135CAE.USU_CODEMP;                              
vnCaeCodFil = USU_T135CAE.USU_CODFIL;

vnOanCodEmp = USU_T135OAN.USU_CODEMP;
vnOanCodFil = USU_T135OAN.USU_CODFIL;

vaPriAne = USU_T135CAE.USU_PRIANE;                                                              
vaLista = "";                                                         
vnAtraso = 0;

     
Se (E073TRA.CODTRA <> vnTransp){
  vnContAtraso = 0; 
  vnContNaoComp = 0;
  vnContAne = 1;
}

vnTransp = E073TRA.CODTRA;

@-- Verifica se a carga chegou atrasada --@
Se (vdDatIni >= vdDatAge){
  Se (vnHorIni > (vnHorAge + ETmpTol)){
    vnAtraso = vnHorIni - (vnHorAge + ETmpTol);
    vnContAtraso = vnContAtraso + 1;
  }
}
 
Se ((vaPriAne <> "COL") e (vaPriAne <> "PAL")){
  @-- Marca a carga como atrasada --@
  Se (vnAtraso > 0){
    FAtraso =  vnAtraso + ETmpTol;
    FMarcaAtraso = 1;
  }
}


@-- Marca a carga como não comparecida --@
Se (vnTemObsReagSemJus = 1){
  vnContNaoComp = vnContNaoComp + 1;
  FMarcaNaoComparecimento = 1;
}

@-- Insere o adicional de Motivo --@
Se ((vnTemObs = 1) ou (vnTemMotivo = 1)){
  ListaSecao("Adicional_Motivo");
}


vnPorEfiAtr = ((vnContAne - vnContAtraso) * 100) / vnContAne;
vnPorEfiCpr = ((vnContAne - vnContNaoComp) * 100) / vnContAne;
vnPorEfiGrl = ((vnContAne - (vnContAtraso + vnContNaoComp)) * 100) / vnContAne;
MontarLista();


Lst.Chave("CODTRA");
Lst.SetarChave();

Lst.CODTRA = E073TRA.CODTRA; 

@-- Se Existir a chave, edita senão, adiciona a transportadora --@
Se (Lst.VaiParaChave()){
  Lst.Editar();
  Lst.TOTANE = vnContAne;
  Lst.TOTATR = vnContAtraso;
  Lst.TOTCPR = vnContNaoComp;  
  Lst.POREFIATR = vnPorEfiAtr;
  Lst.POREFICPR = vnPorEfiCpr;  
  Lst.POREFIGRL = vnPorEfiGrl;
  Lst.Gravar();  
} senao {
  Lst.Adicionar();
  Lst.CODTRA = E073TRA.CODTRA;
  Lst.NOMTRA = E073TRA.NOMTRA;
  Lst.TOTANE = vnContAne;
  Lst.TOTATR = vnContAtraso;
  Lst.TOTCPR = vnContNaoComp;
  Lst.POREFIATR = vnPorEfiAtr;
  Lst.POREFICPR = vnPorEfiCpr;  
  Lst.POREFIGRL = vnPorEfiGrl; 
  Lst.Gravar(); 
                                        
}

vnTemObs = 0;
vnTemObsReag = 0;
vnTemObsReagSemJus = 0;
vnTemMotivo = 0;
vnContAne = vnContAne + 1;

vdDatAge = 0;
vnHorAge = 0;
vdDatIni = 0;
vnHorIni = 0;


Funcao MontarLista();{
  vnNumAne = USU_T135OAN.USU_NUMANE;
  vnCodTra = E073TRA.CODTRA;
  vaNomTra = E073TRA.NOMTRA;
  IntParaAlfa(vnNumAne,vaNumAne);
  IntParaAlfa(vnCodTra, vaCodTra);
  IntParaAlfa(vnContAne,vaContAne);
  IntParaAlfa(vnContAtraso,vaContAtraso);
  IntParaAlfa(vnContNaoComp,vaContNaoComp);
  IntParaAlfa(vnPorEfiAtr,vaPOREFIATR); 
  IntParaAlfa(vnPorEfiCpr,vaPOREFICPR); 
  IntParaAlfa(vnPorEfiGrl,vaPOREFIGRL); 
  
  vaLista = vaLista + 
        " | Carga:" + vaNumAne + 
        " - CodTra:" + vaCodTra + "-" + vaNomTra + 
        " - QtdAne:" + vaContAne + 
        " - ContAtraso:" + vaContAtraso + 
        " - ContNComp:" + vaContNaoComp + 
        " - EAtr:" + vaPOREFIATR + 
        " - ECpr:" + vaPOREFICPR + 
        " - EGrl:" + vaPOREFIGRL;
}
    

--------------------------------------------------------------------------------
Código: 59 - Descrição: FMarcaAtraso_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 60 - Descrição: Desenho002_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 61 - Descrição: FAtraso_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 62 - Descrição: Descricao010_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 63 - Descrição: FMarcaNaoComparecimento_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 64 - Descrição: Subtitulo_CodTra_Depois Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 65 - Descrição: Subtitulo_CodTra_Antes Imprimir
--------------------------------------------------------------------------------

ListaSecao ("Adicional_Vazio");

--------------------------------------------------------------------------------
Código: 66 - Descrição: DNomTra_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 67 - Descrição: DNomTra_Subtitulo_Na Impressão
--------------------------------------------------------------------------------

Definir alfa vaCodTra;

Definir numero vnCodTra;

vnCodTra = E073TRA.CODTRA; 

IntParaAlfa(vnCodTra,vaCodTra);

DNomTra_Subtitulo = vaCodTra + " - " + E073TRA.NOMTRA;

--------------------------------------------------------------------------------
Código: 68 - Descrição: Subtitulo_NumAne_Depois Imprimir
--------------------------------------------------------------------------------

ListaSecao ("Adicional_Titulo");

--------------------------------------------------------------------------------
Código: 69 - Descrição: Subtitulo_NumAne_Antes Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 70 - Descrição: Descricao014_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 71 - Descrição: Cadastro018_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 72 - Descrição: Adicional_Titulo_Depois Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 73 - Descrição: Adicional_Titulo_Antes Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 74 - Descrição: Descricao016_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 75 - Descrição: Descricao017_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 76 - Descrição: Descricao018_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 77 - Descrição: Descricao019_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 78 - Descrição: Descricao020_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 79 - Descrição: Descricao021_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 80 - Descrição: Descricao022_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 81 - Descrição: Adicional_Motivo_Depois Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 82 - Descrição: Adicional_Motivo_Antes Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 83 - Descrição: Descricao002_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 84 - Descrição: DObs_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 85 - Descrição: Descricao003_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 86 - Descrição: DMotivo_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 87 - Descrição: Adicional_Titulo_Transp_Depois Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 88 - Descrição: Adicional_Titulo_Transp_Antes Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 89 - Descrição: Descricao004_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 90 - Descrição: Descricao005_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 91 - Descrição: Descricao007_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 92 - Descrição: Descricao008_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 93 - Descrição: Descricao023_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 94 - Descrição: Descricao030_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 95 - Descrição: Descricao015_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 96 - Descrição: Descricao024_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 97 - Descrição: Adicional_Transp_Depois Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 98 - Descrição: Adicional_Transp_Antes Imprimir
--------------------------------------------------------------------------------

@-- Imprimir Zebrado --@
Se (vImpZeb > 0)
{
  AlteraControle("Adicional_Transp", "Cor", "#ebebeb");
  vImpZeb = vImpZeb * -1;  
}
Senao
{
  AlteraControle("Adicional_Transp", "Cor", "#ffffff");
  vImpZeb = vImpZeb * -1;  
}
@------------------------------------------------------------------------------@

--------------------------------------------------------------------------------
Código: 99 - Descrição: DTra_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 100 - Descrição: FTotAne_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 101 - Descrição: FTotAtr_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 102 - Descrição: FPorEfiAtr_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 103 - Descrição: FCodTra_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 104 - Descrição: Descricao006_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 105 - Descrição: FTotComp_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 106 - Descrição: FPorEfiCpr_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 107 - Descrição: Descricao025_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 108 - Descrição: FPorEfiGrl_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 109 - Descrição: Descricao026_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 110 - Descrição: Adicional_Subtotal_Transp_Depois Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 111 - Descrição: Adicional_Subtotal_Transp_Antes Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 112 - Descrição: Adicional_Pallets_Depois Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 113 - Descrição: Adicional_Pallets_Antes Imprimir
--------------------------------------------------------------------------------







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

--------------------------------------------------------------------------------
Código: 114 - Descrição: vnPalFerEnv_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 115 - Descrição: Descricao040_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 116 - Descrição: vnPalMadEnv_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 117 - Descrição: Descricao039_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 118 - Descrição: Descricao038_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 119 - Descrição: Descricao034_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 120 - Descrição: vnPalMadRec_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 121 - Descrição: Descricao035_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 122 - Descrição: vnPalFerRec_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 123 - Descrição: Adicional_Vazio_Depois Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 124 - Descrição: Adicional_Vazio_Antes Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 125 - Descrição: Subtotal_Transportadora_Depois Imprimir
--------------------------------------------------------------------------------

Se (EMosPal = 'S') {
  ListaSecao("Adicional_PalletsTra");
}
vnPalMadSaldoTra = 0;
vnPalFerSaldoTra = 0;

--------------------------------------------------------------------------------
Código: 126 - Descrição: Subtotal_Transportadora_Antes Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 127 - Descrição: Adicional_PalletsTra_Depois Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 128 - Descrição: Adicional_PalletsTra_Antes Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 129 - Descrição: vnPalFerSaldoTra_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 130 - Descrição: Descricao036_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 131 - Descrição: vnPalMadSaldoTra_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 132 - Descrição: Descricao037_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 133 - Descrição: Descricao041_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 134 - Descrição: Adicional_Empresa_Depois Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 135 - Descrição: Adicional_Empresa_Antes Imprimir
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 136 - Descrição: Descricao042_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 137 - Descrição: vnPalMadSaldoEmp_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 138 - Descrição: Descricao043_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 139 - Descrição: Descricao044_Na Impressão
--------------------------------------------------------------------------------


--------------------------------------------------------------------------------
Código: 140 - Descrição: vnPalFerSaldoEmp_Na Impressão
--------------------------------------------------------------------------------

