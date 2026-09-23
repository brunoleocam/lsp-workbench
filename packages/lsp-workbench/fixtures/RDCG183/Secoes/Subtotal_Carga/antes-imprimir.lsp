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