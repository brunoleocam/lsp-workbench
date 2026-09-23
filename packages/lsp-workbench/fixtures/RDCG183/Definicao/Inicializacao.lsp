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
