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
