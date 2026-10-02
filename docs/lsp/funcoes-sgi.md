# Funções SGI

Funções de tela e formulário SGI da Tecnologia Senior. Fonte: [Funções SGI](https://documentacao.senior.com.br/tecnologia/5.10.3/lsp/funcoes/sgi.htm) (5.10.3).

Disponíveis em Gestão Empresarial | ERP, Gestão Empresarial PME | GO UP, Gestão de Pessoas | HCM e Ronda Senior.

### AbrirTelaSGI

Ao executar essa função é feita a chamada de uma tela SGI que já esteja compilada e sem inconsistências em seu formulário ou interface.

**Sintaxe:** `AbrirTelaSGI(Alfa TelaNome);`

**Parâmetros:**

- `TelaNome` (Alfa) — Nome da tela que deverá ser aberta

**Exemplo:**

```lsp
@ Abre a tela cujo nome é HistoricoAnotacoes @
AbrirTelaSGI("HistoricoAnotacoes");
```

### AbrirTelaSGICarregandoChave

Abre uma tela SGI já compilada e sem inconsistências, informando a chave e, se quiser, o componente que recebe o foco. Para abrir com os registros da chave, aponte o foco para um campo depois da seção-chave. Nome de componente vazio (`""`) não move o foco.

**Sintaxe:** `AbrirTelaSGICarregandoChave(Alfa TelaNome, Alfa ParametrosChave, Alfa NomeComponente);`

**Parâmetros:**

- `TelaNome` (Alfa) — Nome da tela que deverá ser aberta
- `ParametrosChave` (Alfa) — Campos da chave e seus valores. Exemplo: `"'R900PPL.PerId=1';'R900PPL.PerNam=Maria'"`
- `NomeComponente` (Alfa) — Componente que recebe o foco, no formato `NomeDaTabela.NomeDoCampo`. Vazio não aciona o foco

**Observação:**

Esta função não funciona em modo de depuração, pois a tela ativa passa a ser a do Depurador.

**Exemplo:**

```lsp
Definir Numero vnPerId;
Definir Alfa vaPerId;
Definir Alfa vaParametros;

vnPerId = R900PPL.PerId;
IntParaAlfa(vnPerId, vaPerId);
vaParametros = "'R900PPL.PerId=" + vaPerId + "'";
AbrirTelaSGICarregandoChave("Teste1", vaParametros, "R900PPL.EMAIL");
```

### AtribuirFocoComponenteSGI

Atribui o foco ao componente do formulário SGI X-Window ativo. O nome vai no formato `NomeDaTabela.NomeDoCampo`. Em componente do tipo tabela, informe só o nome da tabela base. Campo imagem e campo não editável não recebem foco.

**Sintaxe:** `AtribuirFocoComponenteSGI(Alfa NomeComponente);`

**Parâmetros:**

- `NomeComponente` (Alfa) — Componente do formulário ativo, no formato `NomeDaTabela.NomeDoCampo`

**Observação:**

Esta função não funciona em modo de depuração, pois a tela ativa passa a ser a do Depurador. Não use em campo da seção-chave: conforme o estado da tela, esse campo pode estar desabilitado.

### AtualizarTabela

Atualiza na tela os dados de uma tabela depois que eles mudaram. A chamada descarta alterações do usuário que ainda não foram salvas: se a ação rodar antes do clique em Alterar, essas alterações se perdem.

**Sintaxe:** `AtualizarTabela(Alfa NomeTabela);`

**Parâmetros:**

- `NomeTabela` (Alfa) — Tabela cujos dados devem ser recarregados na tela

**Observação:**

Esta função não funciona em modo de depuração, pois a tela ativa passa a ser a do Depurador.

### CompilaFormulario

Compila de forma automatizada os formulários SGI. Nome vazio compila todos. Se terminar com êxito, o status volta `OK`; se falhar, volta a mensagem do erro.

**Sintaxe:** `CompilaFormulario(Alfa Formulario, Alfa End Status);`

**Parâmetros:**

- `Formulario` (Alfa) — Nome do formulário. Vazio compila todos
- `Status` (Alfa) — Status da compilação. `OK` quando termina com êxito; caso contrário, a mensagem do erro

**Exemplo:**

```lsp
Definir Alfa vaStatus;
Definir Alfa vaMsg;

CompilaFormulario("", vaStatus);
CompilaFormulario("Formulario1", vaStatus);
Se (vaStatus = "OK") {
  vaMsg = "Compilado com Exito";
  Mensagem(Retorna, vaMsg);
} Senao {
  vaMsg = "Erro: " + vaStatus;
  Mensagem(Retorna, vaMsg);
}
```

### FecharFormularioSGI

Fecha o formulário SGI ativo. Se o registro estiver em edição, o usuário confirma se cancela a inclusão ou alteração: Sim fecha a tela; Não deixa a tela aberta. O efeito é o mesmo do botão Sair ou do fechar da janela.

**Sintaxe:** `FecharFormularioSGI();`

**Observação:**

Esta função não funciona em modo de depuração, pois a tela ativa passa a ser a do Depurador.

### InserirValoresSGI

Simula o clique de Inserir ou Alterar do formulário SGI X-Window ativo. Registro novo dispara Inserir; registro existente alterado dispara Alterar. O foco precisa estar na tela: não dá para trocar de tela, abrir o depurador nem usar a barra de progresso no meio da chamada. Se a seção-chave mudou de valor, não execute esta função; nesse caso o botão Inserir é manual.

**Sintaxe:** `InserirValoresSGI();`

**Observação:**

Esta função não funciona em modo de depuração, pois a tela ativa passa a ser a do Depurador.

### LimparValorCampoSGI

Limpa o valor do componente do formulário SGI X-Window ativo. O nome vai no formato `NomeDaTabela.NomeDoCampo`. Não use em campo acima da seção-chave.

**Sintaxe:** `LimparValorCampoSGI(Alfa NomeComponente);`

**Parâmetros:**

- `NomeComponente` (Alfa) — Componente do formulário ativo, no formato `NomeDaTabela.NomeDoCampo`

**Observação:**

Esta função não funciona em modo de depuração, pois a tela ativa passa a ser a do Depurador.
