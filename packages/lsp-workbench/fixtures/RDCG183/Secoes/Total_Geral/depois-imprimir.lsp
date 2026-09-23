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