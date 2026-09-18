# Funções SQL

As funções a seguir podem ser utilizadas para manipulação de comandos SQL e o resultado dos comandos (cursores) em regras. A partir destas funções podem ser executados comandos DML (INSERT, UPDATE, DELETE) e também comandos SELECT que retornam cursores que poderão ser manipulados também.

| Nome                | Descrição                                                                                       |
|---------------------|-------------------------------------------------------------------------------------------------|
| SQL_AbrirCursor     | Função que abre o cursor (depois de informado o comando SQL a ser utilizado, que é definido na função SQL_DefinirComando). |
| SQL_Criar           | A partir de uma variável criada como alfa, é criado um cursor para trabalhar com informações da base de dados. |
| SQL_DefinirAlfa     | Função que define um valor do tipo alfa para o parâmetro dentro do comando SQL inserido na função SQL_DefinirComando. |
| SQL_DefinirBlob     | Função que define um valor do tipo alfa (que representa o arquivo blob) para o parâmetro dentro do comando SQL inserido na função SQL_DefinirComando. |
| SQL_DefinirBoleano  | Função que define um valor do tipo boolean (Número 1 para verdadeiro e 0 para falso) para o parâmetro dentro do comando SQL inserido na função SQL_DefinirComando. |
| SQL_DefinirComando  | Função que aplica o comando SQL para o cursor passado como parâmetro. |
| SQL_DefinirData     | Função que define um valor do tipo data ou date para o parâmetro dentro do comando SQL inserido na função SQL_DefinirComando. |
| SQL_DefinirFlutuante| Função que define um valor do tipo flutuante ou float (Fracionado Ex: 1,5) para o parâmetro dentro do comando SQL inserido na função SQL_DefinirComando. |
| SQL_DefinirInteiro  | Função que define um valor do tipo inteiro para o parâmetro dentro do comando SQL inserido na função SQL_DefinirComando. |
| SQL_Destruir        | Função que elimina um cursor e deve ser chamada quando o cursor não for mais utilizado. |
| SQL_BOF             | Função que retorna a informação se o cursor está na posição inicial (antes do primeiro registro: posição BOF). |
| SQL_EOF             | Função que retorna se o cursor está na posição final (depois do último registro chamada de posição EOF). |
| SQL_FecharCursor    | Função que fecha a pesquisa sendo feita pelo cursor. |
| SQL_Proximo         | Função que posiciona o cursor no próximo registro. |
| SQL_RetornarAlfa    | Função que retorna um valor alfa de um campo do registro do cursor. |
| SQL_RetornarBlob    | Função que retorna um valor alfa de um campo do registro do cursor. |
| SQL_RetornarBoleano | Função que retorna um número que representa um valor boolean, 1 para verdadeiro e 0 (zero) para falso, de um campo do tipo boolean do cursor. |
| SQL_RetornarData    | Função que retorna um valor do tipo data de um campo do registro do cursor. |
| SQL_RetornarFlutuante| Função que retorna um valor flutuante (fracionado, por exemplo 1,5) de um campo do registro do cursor. |
| SQL_RetornarInteiro | Função que retorna um valor inteiro de um campo do registro do cursor. |
| SQL_RetornarSeNulo  | Função que retorna se campo do registro do cursor é nulo. |
| SQL_UsarAbrangencia | Função que informa ao cursor se é para utilizar abrangência de usuários ou não. |
| SQL_UsarSQLSenior2  | Função que informa se o comando a ser definido para o cursor utiliza a sintaxe de linguagem Senior ou a sintaxe nativa (SQL Nativa: linguagem originada da base de dados utilizada, ex: Oracle, SQL server...etc). |
| **Execução Direta de SQL** | |
| ExecSQL             | Executa um comando SQL no banco para operações INSERT, UPDATE e DELETE. |
| ExecSQLEx           | Executa um comando SQL no banco com controle de erro, retornando status de sucesso/falha. |
| **Controle de Transações** | |
| IniciarTransacao    | Inicia uma transação no banco de dados. |
| FinalizarTransacao  | Finaliza a transação no banco de dados executando COMMIT. |
| DesfazerTransacao   | Desfaz a transação no banco de dados executando ROLLBACK. |

### Ciclo de vida do cursor SQL (`SQL_Criar`)

O parâmetro de `SQL_Criar` **deve ser variável `Definir Alfa`** (o handle do cursor). Não use `Numero`, `Data` ou `Lista`.

**Ordem obrigatória:**

1. `Definir Alfa xCursor;`
2. `SQL_Criar(xCursor);`
3. Se SQL nativo / `JOIN` / subquery: `SQL_UsarAbrangencia(xCursor, 0)` + `SQL_UsarSQLSenior2(xCursor, 0)` (**obrigatório** nesses casos; senão pode omitir — o padrão do cursor é SQL Senior 2)
4. `SQL_DefinirComando(xCursor, …);` — só depois do passo 3, se houver
5. Binds (`SQL_DefinirAlfa` / `SQL_DefinirInteiro` / …) se houver `:param`
6. `SQL_AbrirCursor(xCursor);` — abre a transação/conexão e executa o comando já definido
7. Leitura / loop (`SQL_EOF`, `SQL_Retornar*`, `SQL_Proximo`)
8. `SQL_FecharCursor(xCursor);` + `SQL_Destruir(xCursor);` — sempre ao terminar (evita vazamento / travamento de transação)

**Agregados (`COUNT`, `SUM`, …):** use **alias** no SELECT e o mesmo nome em `SQL_Retornar*` (ex.: `COUNT(*) AS conta` → `SQL_RetornarInteiro(xCursor, "conta", vnConta)`).

**SQL nativo, INNER JOIN, subquery:** por padrão o cursor usa SQL Senior 2. Para sintaxe nativa (ou recursos não suportados no Senior 2), chame **antes** de `SQL_DefinirComando`:

```lsp
SQL_Criar(xCursor);
SQL_UsarAbrangencia(xCursor, 0);   @ obrigatório com SQL nativo @
SQL_UsarSQLSenior2(xCursor, 0);    @ 0 = nativo; ≠0 = Senior 2 @
SQL_DefinirComando(xCursor, …);
```

Cursores de `SQL_Criar` **não** herdam a flag global da regra sobre SQL Senior 2 — só o que `SQL_UsarSQLSenior2` definir. Sem desabilitar abrangência com SQL nativo, o runtime interrompe com erro de abrangência (*Não é suportado o uso de abrangência de usuário com SQL nativo*).

**Quando é obrigatório (heurística / plugin SQL008):** se o comando contém `JOIN` (INNER/LEFT/…) ou subquery (`(SELECT …)`, `EXISTS (SELECT…)`, `IN (SELECT…)`), o Senior 2 costuma falhar (ex.: *subqueries não são permitidas aqui*). Use o par `UsarAbrangencia(0)` + `UsarSQLSenior2(0)` **antes** do `SQL_DefinirComando`.

```lsp
@ ❌ Senior 2 — subquery / JOIN sem nativo @
SQL_Criar(xCursor);
SQL_DefinirComando(xCursor, "SELECT a.CODEMP, (SELECT COUNT(*) FROM E085HCL b WHERE b.CODEMP = a.CODEMP) FROM E070FIL a");

@ ✅ Nativo — ordem correta @
SQL_Criar(xCursor);
SQL_UsarAbrangencia(xCursor, 0);
SQL_UsarSQLSenior2(xCursor, 0);
SQL_DefinirComando(xCursor, "SELECT a.CODEMP, (SELECT COUNT(*) FROM E085HCL b WHERE b.CODEMP = a.CODEMP) FROM E070FIL a");
```

**Runtime (não detectável estaticamente):** se `UPDATE`/`DELETE` via cursor não afetar registros, o Sapiens pode exibir mensagem e cancelar a regra — isso não é diagnóstico do plugin.

### Placeholders SQL - Regra de Segurança

**🚨 REGRA CRÍTICA DE SEGURANÇA:** **NUNCA concatene variáveis diretamente em strings SQL. SEMPRE utilize placeholders de parâmetros (`:variavel`) para evitar SQL Injection e garantir performance.**

#### Por que usar Placeholders?

✅ **Segurança:** Previne SQL Injection
✅ **Performance:** Melhor cache de consultas
✅ **Manutenibilidade:** Código mais limpo e legível
✅ **Padrão:** Prática recomendada pela Senior

#### Exemplos de Uso Correto e Incorreto

**❌ INCORRETO - Concatenação Direta (NUNCA FAÇA):**

```lsp
@ ❌ PERIGOSO - Vulnerável a SQL Injection @
Definir Alfa vaSQL;
Definir Numero vnCodigoCliente;
Definir Alfa vaNomeCliente;

vnCodigoCliente = 123;
vaNomeCliente = "João Silva";

@ CONCATENAÇÃO DIRETA - NUNCA USE! @
vaSQL = "SELECT * FROM CLIENTES WHERE CODIGO = " + vnCodigoCliente + " AND NOME = '" + vaNomeCliente + "'";
```

**✅ CORRETO - Placeholders (SEMPRE USE):**

```lsp
@ ✅ SEGURO - Usando placeholders @
Definir Alfa vaSQL;
Definir Numero vnCodigoCliente;
Definir Alfa vaNomeCliente;

vnCodigoCliente = 123;
vaNomeCliente = "João Silva";

@ PLACEHOLDERS - SEMPRE USE! @
vaSQL = "SELECT * FROM CLIENTES WHERE CODIGO = :vnCodigoCliente AND NOME = :vaNomeCliente";

@ Configurar parâmetros no cursor @
SQL_DefinirInteiro(xCursor, "vnCodigoCliente", vnCodigoCliente);
SQL_DefinirAlfa(xCursor, "vaNomeCliente", vaNomeCliente);
```

#### Padrão de Nomenclatura para Placeholders

**Regra:** Use o mesmo nome da variável precedido de `:`

```lsp
@ Variáveis @
Definir Numero vnCodigoEmpresa;
Definir Alfa vaNomeEmpresa;
Definir Data vdDataCadastro;

@ Placeholders correspondentes @
vaSQL = "SELECT * FROM EMPRESAS WHERE CODIGO = :vnCodigoEmpresa AND NOME = :vaNomeEmpresa AND DATA_CADASTRO = :vdDataCadastro";

@ Configuração dos parâmetros @
SQL_DefinirInteiro(xCursor, "vnCodigoEmpresa", vnCodigoEmpresa);
SQL_DefinirAlfa(xCursor, "vaNomeEmpresa", vaNomeEmpresa);
SQL_DefinirData(xCursor, "vdDataCadastro", vdDataCadastro);
```

#### Exemplo Completo com Placeholders

```lsp
Definir Funcao exemploPlaceholdersSQL();

@ Variáveis globais @
Definir Alfa xCursor;
Definir Alfa vaSQL;
Definir Numero vnCodigoCliente;
Definir Alfa vaStatusCliente;
Definir Data vdDataInicio;
Definir Data vdDataFim;

exemploPlaceholdersSQL();

Funcao exemploPlaceholdersSQL(); {
  @ Definir parâmetros de busca @
  vnCodigoCliente = 1001;
  vaStatusCliente = "A";
  MontaData(1, 1, 2024, vdDataInicio);
  MontaData(31, 12, 2024, vdDataFim);
  
  @ SQL com placeholders @
  vaSQL = "SELECT CODIGO, NOME, STATUS, DATA_CADASTRO \
             FROM CLIENTES                            \
            WHERE CODIGO = :vnCodigoCliente           \
              AND STATUS = :vaStatusCliente           \
              AND DATA_CADASTRO BETWEEN :vdDataInicio AND :vdDataFim \
            ORDER BY NOME";
  
  @ Configurar cursor @
  SQL_Criar(xCursor);
  SQL_UsarAbrangencia(xCursor, 0);
  SQL_UsarSQLSenior2(xCursor, 0);
  SQL_DefinirComando(xCursor, vaSQL);
  
  @ Configurar parâmetros @
  SQL_DefinirInteiro(xCursor, "vnCodigoCliente", vnCodigoCliente);
  SQL_DefinirAlfa(xCursor, "vaStatusCliente", vaStatusCliente);
  SQL_DefinirData(xCursor, "vdDataInicio", vdDataInicio);
  SQL_DefinirData(xCursor, "vdDataFim", vdDataFim);
  
  @ Executar consulta @
  SQL_AbrirCursor(xCursor);
  
  @ Processar resultados @
  Enquanto (SQL_EOF(xCursor) = 0) {
    @ Processar cada registro @
    SQL_Proximo(xCursor);
  }
  
  @ Finalizar @
  SQL_FecharCursor(xCursor);
  SQL_Destruir(xCursor);
  
  Mensagem(Retorna, "Consulta executada com segurança!");
}
```

**⚠️ LEMBRE-SE:** Placeholders são obrigatórios para todas as consultas SQL que utilizam variáveis. Nunca concatene variáveis em strings SQL!

### SQL Senior 2

A linguagem Senior SQL 2 pode ser utilizada nas regras dos geradores de informação (gerador de relatórios e consultas), regras de cálculo (regras avulsas executadas diretamente pelo sistema) e importador/exportador de arquivos texto. Esta linguagem é um padrão adotado pela Senior para que os comandos SQL possam ser escritos em um formato padrão que permita um melhor aprendizado e uma melhor tradução para os bancos de dados suportados pelos sistemas da Senior.

#### Ativação da Linguagem

- **Gerador de Relatórios**: Menu principal do gerador > Diversos > Usar Senior SQL 2.
- **Importador/Exportador de Arquivos Texto**: Página Definições > Usar Senior SQL 2.
- **Gerador de Consultas**: Tela principal de definição de modelos > Senior SQL 2.
- **Regras**: Editor de regras > Compilar > Usar Senior SQL 2 ou Ctrl + F12.

#### Restrições

- **Funções de Agregação**: Funções como SUM, COUNT, MAX não podem ser usadas dentro da cláusula SELECT.
- **Comandos Nativos do Banco de Dados**: Comandos como TO_DATE ou CONVERT devem ser substituídos por comandos da linguagem Senior SQL 2.
- **JOIN e UNION**: Não têm garantias de funcionamento dentro das regras.

### Exemplos

#### Utilização de INSERT

```lsp
Definir Alfa xCursor;
Definir Alfa xBlob;

SQL_Criar(xCursor);

@ Insere um novo registro na tabela de intervalos. @
SQL_DefinirComando(xCursor, "INSERT INTO R006INT VALUES (9999, 'Exemplo de intervalo')");
SQL_AbrirCursor(xCursor);

/* Todas as operações referentes à base de dados
   serão feitas entre abrirCursor e fecharCursor. */

SQL_FecharCursor(xCursor);
SQL_Destruir(xCursor);
```

#### Utilização de SELECT

```lsp
Definir Alfa xCursor;

@ Cria o cursor. @
SQL_Criar(xCursor);

@ Define um comando para poder carregar as informações no Cursor. @
SQL_DefinirComando(xCursor, "SELECT R034FUN.CODFIL FROM R034FUN WHERE R034FUN.CODFIL = 1");

@ Abre o cursor para utilização. @
SQL_AbrirCursor(xCursor);

/* Todas as operações referentes à base de dados
   serão feitas entre abrirCursor e fecharCursor. */

@ Fecha o cursor depois de utilizar. @
SQL_FecharCursor(xCursor);
SQL_Destruir(xCursor);
```

#### Utilização de UPDATE

```lsp
Definir Alfa xCursor;
Definir Alfa xBlob;

SQL_Criar(xCursor);

@ Atualiza as informações na base de dados através do comando UPDATE. @
SQL_DefinirComando(xCursor, "UPDATE R034FOT SET FOTEMP = :xBlob WHERE NUMEMP = 9999");

@ Abre o arquivo para a leitura (Indicado pelo 2º parâmetro). @
xArquivo = Abrir("C:/Teste.jpg", Ler);

@ Lê o arquivo que foi aberto acima, e o atribui à variável xBlob (em binário). @
Ler(xArquivo, xBlob, 9999999);

SQL_DefinirBlob(xCursor, "xBlob", xBlob);
SQL_AbrirCursor(xCursor);

/* Todas as operações referentes à base de dados
   serão feitas entre abrirCursor e fecharCursor. */

SQL_FecharCursor(xCursor);
SQL_Destruir(xCursor);
```

### Passagem de Parâmetros

A passagem de parâmetros para dentro de um cursor pode ser feita utilizando `__inserir` ou `SQL_Definir<tipo_variavel>` e passando com `:` para dentro da query, em vez de concatenar um valor na Query.

O `:` é utilizado para indicar que se trata de um parâmetro que será substituído por um valor específico antes da execução do comando SQL. Isso é comum em consultas parametrizadas para evitar a concatenação direta de valores nas strings SQL, o que pode ajudar a prevenir injeções de SQL, melhorar a legibilidade e manutenção do código, pois não é necessário converter variáveis para alfa para concatenar na query. O ideal é sempre utilizar passagem de parâmetro e evitar concatenar variáveis na query.

#### Exemplo com `__inserir`

```lsp
Definir Cursor C;
Definir Numero vnCodEmp;
Definir Numero vnCodFil;
Definir Alfa vaOrderBy;

vnCodEmp = 1;
vnCodFil = 6;
vaOrderBy = "ORDER BY CODFIL";

C.SQL "SELECT NumEmp, TipCol, NumCad, NomFun, ValSal FROM R034FUN WHERE CodEmp = __inserir(:vnCodEmp) and CodFil = __inserir(:vnCodFil) __inserir(:vaOrderBy)";

C.AbrirCursor();
se (C.Achou) {
  // ...existing code...
}
C.FecharCursor();
```

#### Exemplo com `SQL_Definir<tipo_variavel>`

```lsp
Definir Alfa xCursor;
Definir Numero xNumero;

SQL_Criar(xCursor);
SQL_DefinirComando(xCursor, "SELECT * FROM Tabela WHERE Campo = :xNumero");
SQL_DefinirInteiro(xCursor, "xNumero", 123);

SQL_AbrirCursor(xCursor);
Enquanto (SQL_EOF(xCursor) = 0) {
  SQL_Proximo(xCursor);
}
SQL_FecharCursor(xCursor);
SQL_Destruir(xCursor);
```

### SelecaoTabelas

Traz os dados de um comando SELECT(SQL) mais elaborado, incluindo funções de agregação como COUNT(), SUM(), etc. Aceita também comandos como GROUP BY, UNION entre outros.

**Sintaxe:**

```lsp
SelecaoTabelas(<pSqlSel>, <pCpoRet>, <pTemMas>);
```

**Parâmetros:**

- `pSqlSel`: Variável que recebe uma instrução SELECT(SQL) ou "+" para buscar próximo registro
- `pCpoRet`: Variável que retorna os dados resultantes do comando (separados por ';' se múltiplos campos)
- `pTemMas`: Variável que retorna '+' caso o comando retorne mais de uma linha

**⚠️ Observações importantes:**

- O início do SQL é fixado em SELECT para evitar danos ao banco
- Todos os dados são convertidos para uma única variável Alfa
- Quando há múltiplos campos, são separados por ';'
- Para navegar entre registros, passe "+" como parâmetro `pSqlSel`

**Exemplo:**

```lsp
Definir Funcao exemploSelecaoTabelas();

@ Variáveis globais @
Definir Alfa vaSQL;
Definir Alfa vaRetorno;
Definir Alfa vaMais;
Definir Numero vnContador;

exemploSelecaoTabelas();

Funcao exemploSelecaoTabelas(); {
  @ === EXEMPLO 1: CONTAGEM POR ESTADO === @
  vaSQL = "SIGUFS, COUNT(*) FROM E085CLI GROUP BY SIGUFS";
  SelecaoTabelas(vaSQL, vaRetorno, vaMais);
  
  vnContador = 1;
  Enquanto (vaMais = "+") {
    @ Processar o registro atual @
    Definir Alfa vaMensagem;
    Definir Alfa vaContadorStr;
    IntParaAlfa(vnContador, vaContadorStr);
    vaMensagem = "Registro " + vaContadorStr + ": " + vaRetorno;
    Mensagem(Retorna, vaMensagem);
    
    @ Buscar próximo registro @
    SelecaoTabelas("+", vaRetorno, vaMais);
    vnContador++;
  }
  
  @ === EXEMPLO 2: SOMA DE VALORES === @
  vaSQL = "SUM(TOTPED), COUNT(*) FROM E120PED WHERE SITPED = 'A'";
  SelecaoTabelas(vaSQL, vaRetorno, vaMais);
  
  @ vaRetorno conterá algo como "1500.50;25" (soma;quantidade) @
  Definir Alfa vaResultado;
  vaResultado = "Total de pedidos ativos: " + vaRetorno;
  Mensagem(Retorna, vaResultado);
  
  @ === EXEMPLO 3: DADOS CONSOLIDADOS POR FILIAL === @
  vaSQL = "CODFIL, SUM(TOTPED), COUNT(*) FROM E120PED GROUP BY CODFIL ORDER BY CODFIL";
  SelecaoTabelas(vaSQL, vaRetorno, vaMais);
  
  Mensagem(Retorna, "=== RELATÓRIO POR FILIAL ===");
  vnContador = 1;
  
  @ Processar primeiro registro @
  Se (vaRetorno <> "") {
    processarRegistroFilial(vaRetorno, vnContador);
    vnContador++;
  }
  
  @ Processar demais registros @
  Enquanto (vaMais = "+") {
    SelecaoTabelas("+", vaRetorno, vaMais);
    Se (vaRetorno <> "") {
      processarRegistroFilial(vaRetorno, vnContador);
      vnContador++;
    }
  }
}

/* ========================================================================
   FUNCAO: processarRegistroFilial
   DESCRICAO: Processa um registro com dados de filial
   PARAMETROS: pDados - String com dados separados por ';'
               pContador - Numero sequencial do registro
   RETORNO: Void
   OBSERVACOES: Auxiliar para exemplo de SelecaoTabelas
   ======================================================================== */
Funcao processarRegistroFilial(Alfa pDados, Numero pContador); {
  @ Extrair componentes do registro: CODFIL;TOTAL;QUANTIDADE @
  Definir Alfa vaCodFilial;
  Definir Alfa vaTotal;
  Definir Alfa vaQuantidade;
  Definir Numero vnPos1;
  Definir Numero vnPos2;
  Definir Numero vnTamanho;
  
  @ Localizar separadores @
  PosicaoAlfa(";", pDados, vnPos1);
  Se (vnPos1 > 0) {
    @ Extrair código da filial @
    vaCodFilial = pDados;
    CopiarAlfa(vaCodFilial, 1, vnPos1 - 1);
    
    @ Buscar segundo separador @
    Definir Alfa vaRestante;
    TamanhoAlfa(pDados, vnTamanho);
    vaRestante = pDados;
    CopiarAlfa(vaRestante, vnPos1 + 1, vnTamanho - vnPos1);
    
    PosicaoAlfa(";", vaRestante, vnPos2);
    Se (vnPos2 > 0) {
      @ Extrair total @
      vaTotal = vaRestante;
      CopiarAlfa(vaTotal, 1, vnPos2 - 1);
      
      @ Extrair quantidade @
      TamanhoAlfa(vaRestante, vnTamanho);
      vaQuantidade = vaRestante;
      CopiarAlfa(vaQuantidade, vnPos2 + 1, vnTamanho - vnPos2);
      
      @ Montar relatório @
      Definir Alfa vaMensagem;
      Definir Alfa vaContadorStr;
      IntParaAlfa(pContador, vaContadorStr);
      vaMensagem = vaContadorStr + ". Filial " + vaCodFilial + 
                   " - Total: R$ " + vaTotal + " - Pedidos: " + vaQuantidade;
      Mensagem(Retorna, vaMensagem);
    }
  }
}
```

### ExecSQL

Executa um comando SQL no banco. Pode ser usado para operações INSERT, UPDATE e DELETE.

**Sintaxe:**

```lsp
ExecSQL(<ComandoSQL>);
```

**Parâmetros:**

- `ComandoSQL`: Comando SQL a ser executado (tipo Alfa)

**Exemplos:**

**INSERT:**

```lsp
Definir Funcao exemploExecSQLInsert();

@ Variáveis globais @
Definir Alfa vaSQL;
Definir Numero vnCodEmp;
Definir Alfa vaNomEmp;

exemploExecSQLInsert();

Funcao exemploExecSQLInsert(); {
  @ Definir dados para inserção @
  vnCodEmp = 999;
  vaNomEmp = "EMPRESA TESTE LTDA";
  
  @ Montar comando SQL @
  Definir Alfa vaCodEmpStr;
  IntParaAlfa(vnCodEmp, vaCodEmpStr);
  vaSQL = "INSERT INTO R030EMP (NUMEMP, NOMEMP) VALUES (" + vaCodEmpStr + ", '" + vaNomEmp + "')";
  
  @ Executar comando @
  ExecSQL(vaSQL);
  
  Mensagem(Retorna, "Empresa inserida com sucesso!");
}
```

**UPDATE:**

```lsp
Definir Funcao exemploExecSQLUpdate();

@ Variáveis globais @
Definir Alfa vaSQL;
Definir Numero vnCodEmp;
Definir Alfa vaNovoNome;

exemploExecSQLUpdate();

Funcao exemploExecSQLUpdate(); {
  @ Definir dados para atualização @
  vnCodEmp = 999;
  vaNovoNome = "EMPRESA ATUALIZADA LTDA";
  
  @ Montar comando SQL @
  Definir Alfa vaCodEmpStr;
  IntParaAlfa(vnCodEmp, vaCodEmpStr);
  vaSQL = "UPDATE R030EMP SET NOMEMP = '" + vaNovoNome + "' WHERE NUMEMP = " + vaCodEmpStr;
  
  @ Executar comando @
  ExecSQL(vaSQL);
  
  Mensagem(Retorna, "Empresa atualizada com sucesso!");
}
```

**DELETE:**

```lsp
Definir Funcao exemploExecSQLDelete();

@ Variáveis globais @
Definir Alfa vaSQL;
Definir Numero vnCodEmp;

exemploExecSQLDelete();

Funcao exemploExecSQLDelete(); {
  @ Definir código para exclusão @
  vnCodEmp = 999;
  
  @ Montar comando SQL @
  Definir Alfa vaCodEmpStr;
  IntParaAlfa(vnCodEmp, vaCodEmpStr);
  vaSQL = "DELETE FROM R030EMP WHERE NUMEMP = " + vaCodEmpStr;
  
  @ Executar comando @
  ExecSQL(vaSQL);
  
  Mensagem(Retorna, "Empresa excluída com sucesso!");
}
```

### ExecSQLEx - Função Recomendada para INSERT/UPDATE

**⚠️ REGRA DE PREFERÊNCIA:** Sempre utilize a função `ExecSQLEx` para operações INSERT e UPDATE no banco de dados. Esta função oferece controle de erro e é a prática recomendada pela Senior.

Executa um comando SQL no banco com controle de erro. Retorna 0 (zero) para sucesso ou 1 seguido da mensagem de erro em caso de falha.

**Sintaxe:**

```lsp
ExecSQLEx(<ComandoSQL>, <Sucesso>, <Mensagem>);
```

**Parâmetros:**

- `ComandoSQL`: Comando SQL a ser executado (tipo Alfa)
- `Sucesso`: Variável numérica que retorna 0 para sucesso, 1 para erro
- `Mensagem`: Variável alfa que retorna mensagem de erro (se houver)

**Vantagens do ExecSQLEx:**
✅ **Controle de erro:** Retorna status de sucesso/falha
✅ **Mensagem de erro:** Informa detalhes em caso de falha
✅ **Segurança:** Melhor tratamento de transações
✅ **Padrão Senior:** Função oficial recomendada

**Exemplos:**

**INSERT com tratamento de erro:**

```lsp
Definir Funcao exemploExecSQLExInsert();

@ Variáveis globais @
Definir Alfa vaSQL;
Definir Numero vnErro;
Definir Alfa vaMensagemErro;
Definir Numero vnCodEmp;
Definir Alfa vaNomEmp;

exemploExecSQLExInsert();

Funcao exemploExecSQLExInsert(); {
  @ Definir dados @
  vnCodEmp = 1000;
  vaNomEmp = "NOVA EMPRESA LTDA";
  
  @ Iniciar transação @
  IniciarTransacao();
  
  @ Montar e executar SQL para empresa @
  Definir Alfa vaCodEmpStr;
  IntParaAlfa(vnCodEmp, vaCodEmpStr);
  vaSQL = "INSERT INTO R030EMP (NUMEMP, NOMEMP) VALUES (" + vaCodEmpStr + ", '" + vaNomEmp + "')";
  
  ExecSQLEx(vaSQL, vnErro, vaMensagemErro);
  Se (vnErro = 0) {
    @ Inserir funcionário relacionado @
    vaSQL = "INSERT INTO R034FUN (NUMEMP, TIPCOL, NUMCAD, NOMFUN) VALUES (" + vaCodEmpStr + ", 1, 1, 'FUNCIONARIO TESTE')";
    ExecSQLEx(vaSQL, vnErro, vaMensagemErro);
    
    Se (vnErro = 0) {
      FinalizarTransacao();
      Mensagem(Retorna, "Empresa e funcionário inseridos com sucesso!");
    } Senao {
      DesfazerTransacao();
      Mensagem(Erro, "Erro ao inserir funcionário: " + vaMensagemErro);
    }
  } Senao {
    DesfazerTransacao();
    Mensagem(Erro, "Erro ao inserir empresa: " + vaMensagemErro);
  }
}
```

**UPDATE com tratamento de erro:**

```lsp
Definir Funcao exemploExecSQLExUpdate();

@ Variáveis globais @
Definir Alfa vaSQL;
Definir Numero vnErro;
Definir Alfa vaMensagemErro;

exemploExecSQLExUpdate();

Funcao exemploExecSQLExUpdate(); {
  vaSQL = "UPDATE R030EMP SET NOMEMP = 'EMPRESA MODIFICADA' WHERE NUMEMP = 1000";
  
  ExecSQLEx(vaSQL, vnErro, vaMensagemErro);
  Se (vnErro = 0) {
    Mensagem(Retorna, "Atualização realizada com sucesso!");
  } Senao {
    Mensagem(Erro, "Erro na atualização: " + vaMensagemErro);
  }
}
```

**DELETE com tratamento de erro:**

```lsp
Definir Funcao exemploExecSQLExDelete();

@ Variáveis globais @
Definir Alfa vaSQL;
Definir Numero vnErro;
Definir Alfa vaMensagemErro;

exemploExecSQLExDelete();

Funcao exemploExecSQLExDelete(); {
  vaSQL = "DELETE FROM R030EMP WHERE NUMEMP = 1000";
  
  ExecSQLEx(vaSQL, vnErro, vaMensagemErro);
  Se (vnErro = 0) {
    Mensagem(Retorna, "Exclusão realizada com sucesso!");
  } Senao {
    Mensagem(Erro, "Erro na exclusão: " + vaMensagemErro);
  }
}
```

**Utilizando com campos BLOB:**

```lsp
Definir Funcao exemploExecSQLExBlob();

@ Variáveis globais @
Definir Alfa vaSQL;
Definir Numero vnErro;
Definir Alfa vaMensagemErro;
Definir Alfa vaBlob;
Definir Numero vnArquivo;

exemploExecSQLExBlob();

Funcao exemploExecSQLExBlob(); {
  @ Ler arquivo para BLOB @
  vnArquivo = Abrir("C:\\temp\\imagem.png", Ler);
  Ler(vnArquivo, vaBlob, 9999999);
  Fechar(vnArquivo);
  
  @ Inserir imagem com BLOB @
  vaSQL = "INSERT INTO R030EMP (NUMEMP, FOTOEMP) VALUES (1001, :BLOB(vaBlob))";
  
  ExecSQLEx(vaSQL, vnErro, vaMensagemErro);
  Se (vnErro = 0) {
    Mensagem(Retorna, "Imagem inserida com sucesso!");
  } Senao {
    Mensagem(Erro, "Erro ao inserir imagem: " + vaMensagemErro);
  }
}
```

### Funções de Transação

#### IniciarTransacao

Inicia uma transação no banco de dados.

**Sintaxe:**

```lsp
IniciarTransacao();
```

**Exemplo de uso completo:**

```lsp
Definir Funcao exemploTransacaoCompleta();

@ Variáveis globais @
Definir Alfa vaSQL;
Definir Numero vnErro;
Definir Alfa vaMensagemErro;
Definir Numero vnCodUsu;

exemploTransacaoCompleta();

Funcao exemploTransacaoCompleta(); {
  @ Obter código do usuário atual @
  vnCodUsu = CodUsu;
  
  @ Iniciar transação @
  IniciarTransacao();
  
  @ Executar operações SQL @
  vaSQL = "INSERT INTO R030EMP (NUMEMP, NOMEMP) VALUES (2000, 'EMPRESA TRANSACAO')";
  ExecSQLEx(vaSQL, vnErro, vaMensagemErro);
  
  Se (vnErro = 0) {
    @ Verificar permissão do usuário @
    Se (vnCodUsu = 1) {
      DesfazerTransacao();
      Mensagem(Erro, "O usuário 1 não tem permissão para esta operação");
    } Senao {
      @ Continuar com mais operações @
      vaSQL = "UPDATE R030EMP SET NOMEMP = 'EMPRESA TRANSACAO CONFIRMADA' WHERE NUMEMP = 2000";
      ExecSQLEx(vaSQL, vnErro, vaMensagemErro);
      
      Se (vnErro = 0) {
        FinalizarTransacao();
        Mensagem(Retorna, "Transação completada com sucesso!");
      } Senao {
        DesfazerTransacao();
        Mensagem(Erro, "Erro na atualização: " + vaMensagemErro);
      }
    }
  } Senao {
    DesfazerTransacao();
    Mensagem(Erro, "Erro na inserção: " + vaMensagemErro);
  }
}
```

#### FinalizarTransacao

Finaliza a transação no banco de dados executando COMMIT.

**Sintaxe:**

```lsp
FinalizarTransacao();
```

#### DesfazerTransacao

Desfaz a transação no banco de dados executando ROLLBACK.

**Sintaxe:**

```lsp
DesfazerTransacao();
```

**⚠️ Observações importantes sobre transações:**

1. **Tratamento automático de erros:** Caso ocorra um erro entre `IniciarTransacao()` e `FinalizarTransacao()`, a transação será automaticamente desfeita com ROLLBACK, exceto durante depuração.

2. **Uso explícito:** Deve ser informada explicitamente a transação com os comandos `IniciarTransacao()` e `FinalizarTransacao()` quando necessário usar transações nas regras LSP.

3. **Validação de sessão:** A rotina de validação de seção do usuário realiza alterações no banco quando não há transações ativas.

4. **Depuração:** Durante depuração, a transação não será finalizada automaticamente em caso de erro.

**Exemplo prático - Sistema de Transferência Bancária:**

```lsp
Definir Funcao exemploTransferenciaBancaria();

@ Variáveis globais @
Definir Numero vnContaOrigem;
Definir Numero vnContaDestino;
Definir Numero vnValor;
Definir Alfa vaSQL;
Definir Numero vnErro;
Definir Alfa vaMensagemErro;
Definir Numero vnSaldoOrigem;

exemploTransferenciaBancaria();

Funcao exemploTransferenciaBancaria(); {
  @ Definir dados da transferência @
  vnContaOrigem = 12345;
  vnContaDestino = 67890;
  vnValor = 1000;
  
  @ Verificar saldo antes de iniciar transação @
  verificarSaldoConta(vnContaOrigem, vnSaldoOrigem);
  
  Se (vnSaldoOrigem >= vnValor) {
    @ Iniciar transação @
    IniciarTransacao();
    
    @ 1. Debitar da conta origem @
    Definir Alfa vaContaOrigemStr;
    Definir Alfa vaValorStr;
    IntParaAlfa(vnContaOrigem, vaContaOrigemStr);
    DecimalParaAlfa(vnValor, vaValorStr);
    
    vaSQL = "UPDATE CONTAS SET SALDO = SALDO - " + vaValorStr + " WHERE CONTA = " + vaContaOrigemStr;
    ExecSQLEx(vaSQL, vnErro, vaMensagemErro);
    
    Se (vnErro = 0) {
      @ 2. Creditar na conta destino @
      Definir Alfa vaContaDestinoStr;
      IntParaAlfa(vnContaDestino, vaContaDestinoStr);
      
      vaSQL = "UPDATE CONTAS SET SALDO = SALDO + " + vaValorStr + " WHERE CONTA = " + vaContaDestinoStr;
      ExecSQLEx(vaSQL, vnErro, vaMensagemErro);
      
      Se (vnErro = 0) {
        @ 3. Registrar histórico @
        vaSQL = "INSERT INTO HISTORICO (CONTA_ORIGEM, CONTA_DESTINO, VALOR, DATA) VALUES (" + 
                vaContaOrigemStr + ", " + vaContaDestinoStr + ", " + vaValorStr + ", GETDATE())";
        ExecSQLEx(vaSQL, vnErro, vaMensagemErro);
        
        Se (vnErro = 0) {
          FinalizarTransacao();
          Mensagem(Retorna, "Transferência realizada com sucesso!");
        } Senao {
          DesfazerTransacao();
          Mensagem(Erro, "Erro ao registrar histórico: " + vaMensagemErro);
        }
      } Senao {
        DesfazerTransacao();
        Mensagem(Erro, "Erro ao creditar conta destino: " + vaMensagemErro);
      }
    } Senao {
      DesfazerTransacao();
      Mensagem(Erro, "Erro ao debitar conta origem: " + vaMensagemErro);
    }
  } Senao {
    Mensagem(Erro, "Saldo insuficiente para transferência");
  }
}

/* ========================================================================
   FUNCAO: verificarSaldoConta
   DESCRICAO: Verifica o saldo atual de uma conta
   PARAMETROS: pConta - Numero da conta, pSaldo - Saldo atual (retorno)
   RETORNO: Void
   OBSERVACOES: Função auxiliar para verificação de saldo
   ======================================================================== */
Funcao verificarSaldoConta(Numero pConta, Numero End pSaldo); {
  @ Simulação - em ambiente real, consultaria o banco @
  Se (pConta = 12345) {
    pSaldo = 5000;  @ Conta com saldo suficiente @
  } Senao Se (pConta = 67890) {
    pSaldo = 2000;  @ Conta destino @
  } Senao {
    pSaldo = 0;     @ Conta inexistente @
  }
}
```
