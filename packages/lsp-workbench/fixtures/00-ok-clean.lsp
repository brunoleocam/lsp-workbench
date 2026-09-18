@ Smoke negativo: código limpo — Problems deve ficar vazio @
Definir Numero vnX;
Definir Alfa vaMsg;
Definir Lista vlOk;

vlOk.DefinirCampos();
vlOk.AdicionarCampo("Codigo", numero);
vlOk.EfetivarCampos();

vnX = 1;
vaMsg = "ok";
Se ((vnX > 0) e (vnX < 10)) {
  Mensagem(Retorna, vaMsg);
}
vlOk.Adicionar();
vlOk.Codigo = vnX;
vlOk.Gravar();
