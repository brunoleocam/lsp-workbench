# Cheat Sheet LSP (Cola Rápida)

### **Essenciais para Todo Projeto**

```lsp
@ === ESTRUTURA BÁSICA === @
Definir Alfa vaMensagem;
Definir Numero vnContador;
Definir Data vdDataAtual;

@ === MENSAGENS === @
vaMensagem = "Processamento concluído!";
Mensagem(Retorna, vaMensagem);
Mensagem(Erro, "Erro crítico!");

@ === LOOPS COMUNS === @
Para (vnContador = 1; vnContador <= 10; vnContador++) {
  @ código repetido @
}

Enquanto (vnContador > 0) {
  vnContador--;
}

@ === CONDICIONAIS === @
Se (vnContador > 0) {
  @ código @
} Senao Se (vnContador = 0) {
  @ código alternativo @
} Senao {
  @ código padrão @
}
```

### **Manipulação de Dados Comuns**

```lsp
@ === STRINGS === @
TamanhoAlfa(vaTexto, vnTamanho);
PosicaoAlfa("busca", vaTexto, vnPosicao);
SubstAlfa("antigo", "novo", vaTexto);
SubstAlfaUmaVez("antigo", "novo", vaTexto);  @ Apenas primeira ocorrência @
ConverteParaMaiusculo(vaTexto);
CopiarAlfa(vaTexto, 1, 5);                   @ Extrai 5 chars da posição 1 @
DeletarAlfa(vaTexto, 1, 3);                  @ Remove 3 chars da posição 1 @
InserirAlfa("texto", vaTexto, 5);            @ Insere na posição 5 @
LimpaEspacos(vaTexto);                       @ Remove espaços laterais @
DeixaNumeros(vaTexto);                       @ Remove não-números @

@ === CONVERSÕES === @
IntParaAlfa(vnNumero, vaTexto);
IntParaStr(vnNumero, vaTexto);      @ Equivalente a IntParaAlfa @
AlfaParaInt(vaTexto, vnNumero);
StrParaInt(vaTexto, vnNumero);      @ Equivalente a AlfaParaInt @
AlfaParaDecimal(vaTexto, vnDecimal);

@ === DATAS === @
DataHoje(vdDataAtual);
DataHora(vnDataHoraAtual);         
@ Para formatação, converta para número @
Definir Numero vnData;
vnData = vdData;
FormatarData(vnData, "dd/MM/yyyy", vaDataFormatada);
MontaData(1, 1, 2024, vdData);      @ Monta data a partir de componentes @
DesMontaData(vdData, vnDia, vnMes, vnAno); @ Desmonta data em componentes @
AnoBissexto(vdData, vnBissexto);    @ Verifica se ano é bissexto @

@ === VALIDAÇÕES === @
EstaNulo(vaVariavel, vnEhNulo);
vnExiste = ArqExiste(vaCaminho);
VrfAbrA(vaCodigo, "A..Z", vnValido);

@ === MATEMÁTICA === @
Arredonda(vnValor, 2);              @ Arredonda para 2 casas decimais @
ArredondaABNT(vnValor, 2);          @ Arredonda seguindo regra ABNT @
MultiplicaValor(vaNumero, vnFator, vaResultado); @ Multiplica string numérica @

@ === EXTENSO === @
Extenso(vnValor, 30, 30, 30, vaLin1, vaLin2, vaLin3); @ Gera extenso do valor @
ExtensoMes(vdData, vaMesExt);       @ Gera extenso do mês @
ExtensoSemana(vdData, vaSemExt);    @ Gera extenso do dia da semana @
```

### **HTTP e APIs**

```lsp
@ === HTTP BÁSICO === @
HttpObjeto(vaHTTP);
HttpDesabilitaErroResposta(vaHTTP);
HttpAlteraCabecalhoRequisicao(vaHTTP, "Content-Type", "application/json");
HttpGet(vaHTTP, vaURL, vaResposta);
HttpLeCodigoResposta(vaHTTP, vnStatus);

@ === JSON === @
ValorElementoJson(vaJSON, "", "campo", vaValor);
ValorElementoJson(vaJSON, "grupo", "campo", vaValor);

@ === AUTENTICAÇÃO === @
vaCredenciais = vaUsuario + ":" + vaSenha;
Base64Encode(vaCredenciais, vaBase64);
vaAuth = "Basic " + vaBase64;
```

### **Banco de Dados**

```lsp
@ === CURSOR SIMPLES === @
Definir Cursor curDados;
curDados.SQL "SELECT * FROM TABELA WHERE ID = 1";
curDados.AbrirCursor();
Enquanto (curDados.Achou) {
  @ processar curDados.CAMPO @
  curDados.Proximo();
}
curDados.FecharCursor();

@ === CURSOR COMPLETO === @
SQL_Criar(xCursor);
SQL_DefinirComando(xCursor, "SELECT * FROM TABELA");
SQL_AbrirCursor(xCursor);
Enquanto (SQL_EOF(xCursor) = 0) {
  SQL_RetornarAlfa(xCursor, "CAMPO", vaValor);
  SQL_Proximo(xCursor);
}
SQL_FecharCursor(xCursor);
SQL_Destruir(xCursor);
```

### **Armadilhas Comuns**

```lsp
@ NUNCA FAÇA @
Mensagem(Retorna, "Valor: " + IntParaAlfa(vnNumero));  @ Erro! @
vnTamanho = TamanhoAlfa(vaTexto);                      @ Erro! @
AlfaParaDecimal(vaTexto, Grid.Campo);                  @ Erro! @

@  SEMPRE FAÇA @
IntParaAlfa(vnNumero, vaNumeroStr);
vaMensagem = "Valor: " + vaNumeroStr;
Mensagem(Retorna, vaMensagem);

TamanhoAlfa(vaTexto, vnTamanho);

AlfaParaDecimal(vaTexto, vnValor);
Grid.Campo = vnValor;
```

---
