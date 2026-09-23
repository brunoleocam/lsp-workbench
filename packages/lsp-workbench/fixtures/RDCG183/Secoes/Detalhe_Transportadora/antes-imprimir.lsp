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