Definir Numero vnCodigo;
Definir Numero vnTamanho;
Definir Alfa vaNome;
Definir Alfa vaMensagem;
Definir Lista vlItens;

vlItens.DefinirCampos();
vlItens.AdicionarCampo("Codigo", numero);
vlItens.AdicionarCampo("Nome", alfa, 80);
vlItens.EfetivarCampos();

vnCodigo = 10;
vaNome = "Demo Marketplace";
TamanhoAlfa(vaNome, vnTamanho);

Se ((vnCodigo > 0) e (vnTamanho > 0)) {
  IntParaAlfa(vnTamanho, vaMensagem);
  vaMensagem = "Tamanho: " + vaMensagem;
  Mensagem(Retorna, vaMensagem);
}

Para (vnCodigo = 1; vnCodigo <= 3; vnCodigo++) {
  vlItens.Adicionar();
  vlItens.Codigo = vnCodigo;
  vlItens.Nome = vaNome;
  vlItens.Gravar();
}
