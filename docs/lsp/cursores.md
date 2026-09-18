# Definição de Cursor

### Cursor Simples

Um cursor simples é utilizado para realizar consultas SQL e iterar sobre os resultados. Ele é definido utilizando o comando `Definir` seguido do tipo `Cursor`.

Exemplo de definição de um cursor simples:

```lsp
Definir Cursor curExemplo;
curExemplo.SQL "SELECT * FROM Tabela";
curExemplo.AbrirCursor();

Enquanto (curExemplo.Achou) {
  Mensagem(Retorna, curExemplo.Campo);
  curExemplo.Proximo();
}

curExemplo.FecharCursor();
```

### Cursor Completo - Padrão de Uso Completo

Um cursor completo é utilizado para realizar consultas SQL mais complexas e iterar sobre os resultados. Ele é definido utilizando o comando `SQL_Criar` e outras funções SQL específicas.

**⚠️ PADRÃO RECOMENDADO:** Sempre siga este ciclo completo de criação, uso e destruição do cursor para evitar vazamentos de memória e garantir performance.

#### Exemplo Padrão Completo de Cursor

```lsp
Definir Funcao exemploCursorCompleto();

@ Variáveis globais @
Definir Alfa xCursor;
Definir Alfa vaSQL;
Definir Alfa vaNomeCliente;
Definir Numero vnCodigoCliente;
Definir Numero vnValorTotal;
Definir Data vdDataCadastro;
Definir Numero vnContador;

exemploCursorCompleto();

Funcao exemploCursorCompleto(); {
  vnContador = 0;
  
  @ ===== 1. PREPARAÇÃO DO SQL ===== @
  vaSQL = "SELECT NOME_CLIENTE, CODIGO_CLIENTE, VALOR_TOTAL, DATA_CADASTRO \
             FROM CLIENTES                                                 \
            WHERE STATUS = 'A'                                             \
            ORDER BY NOME_CLIENTE";
  
  @ ===== 2. CRIAÇÃO E CONFIGURAÇÃO DO CURSOR ===== @
  SQL_Criar(xCursor);
  SQL_UsarAbrangencia(xCursor, 0);          @ 0 = Sem abrangência (obrigatório com SQL nativo) @
  SQL_UsarSQLSenior2(xCursor, 0);           @ 0 = SQL Nativo, ≠0 = SQL Senior 2; sempre antes de DefinirComando @
  SQL_DefinirComando(xCursor, vaSQL);
  
  @ ===== 3. ABERTURA E EXECUÇÃO DO CURSOR ===== @
  SQL_AbrirCursor(xCursor);
  
  @ ===== 4. ITERAÇÃO SOBRE OS RESULTADOS ===== @
  Enquanto (SQL_EOF(xCursor) = 0) {
    @ Extrair dados do registro atual @
    SQL_RetornarAlfa(xCursor, "NOME_CLIENTE", vaNomeCliente);
    SQL_RetornarInteiro(xCursor, "CODIGO_CLIENTE", vnCodigoCliente);
    SQL_RetornarFlutuante(xCursor, "VALOR_TOTAL", vnValorTotal);
    SQL_RetornarData(xCursor, "DATA_CADASTRO", vdDataCadastro);
    
    @ Processar dados (exemplo) @
    vnContador++;
    
    @ Avançar para próximo registro @
    SQL_Proximo(xCursor);
  }
  
  @ ===== 5. FINALIZAÇÃO E LIMPEZA ===== @
  SQL_FecharCursor(xCursor);
  SQL_Destruir(xCursor);
  
  @ ===== 6. RESULTADO FINAL ===== @
  Definir Alfa vaMensagem;
  Definir Alfa vaContadorStr;
  IntParaAlfa(vnContador, vaContadorStr);
  vaMensagem = "Processados " + vaContadorStr + " clientes";
  Mensagem(Retorna, vaMensagem);
}
```

**📋 Estrutura Padrão do Cursor Completo:**

1. **Preparação:** Montar SQL com placeholders (`:var`) se necessário
2. **Criação:** `Definir Alfa` + `SQL_Criar()` + (opcional) `SQL_UsarAbrangencia` / `SQL_UsarSQLSenior2` **antes** de `SQL_DefinirComando`
3. **Comando:** `SQL_DefinirComando()` + binds (`SQL_Definir*`)
4. **Abertura:** `SQL_AbrirCursor()`
5. **Iteração:** `Enquanto (SQL_EOF() = 0)` + `SQL_Proximo()`
6. **Finalização:** `SQL_FecharCursor()` + `SQL_Destruir()`

**⚠️ IMPORTANTE:** Sempre feche e destrua o cursor após o uso. Para INNER JOIN / subquery / SQL nativo: `SQL_UsarAbrangencia(cursor, 0)` + `SQL_UsarSQLSenior2(cursor, 0)` antes do comando.

**Dois modos — não misturar (plugin SQL009):**

| | Cursor simples | Cursor completo |
|--|----------------|-----------------|
| Declaração | `Definir Cursor Cur_X;` | `Definir Alfa vaX;` + `SQL_Criar(vaX)` |
| Comando | `Cur_X.SQL "…"` | `SQL_DefinirComando(vaX, …)` |
| Abrir / fechar | `Cur_X.AbrirCursor()` / `.FecharCursor()` | `SQL_AbrirCursor(vaX)` / `SQL_FecharCursor(vaX)` |
| Loop | `Cur_X.Achou` / `.Proximo()` | `SQL_EOF(vaX)` / `SQL_Proximo(vaX)` |
| Limpeza | só fechar | `SQL_FecharCursor` + **`SQL_Destruir`** (sempre no **final** do uso) |

`SQL_Criar` + `SQL_AbrirCursor` **é o par correto** do cursor completo. Errado é usar `.AbrirCursor` no handle de `SQL_Criar`, ou `SQL_*` em `Definir Cursor`.

**Plugin (SQL009):** trate os dois modos em blocos separados. O QF preferido expande um **esqueleto comentado** do modo certo (simples ou completo). Enquanto `.AbrirCursor` ainda estiver no handle de `SQL_Criar`, o plugin **não** empilha `SQL_Destruir` (SQL002) — corrija a API primeiro.

### Vantagens e Desvantagens dos Cursores

#### Cursor Simples

**Vantagens:**
✅ **Simplicidade na definição e uso.**
✅ **Menor quantidade de funções necessárias.**
✅ **Ideal para consultas simples e rápidas.**

**Desvantagens:**
❌ **Menos flexível para consultas complexas.**
❌ **Não suporta múltiplos parâmetros ou tipos de dados avançados.**
❌ **Não permite o uso de determinadas funções SQL.**

#### Cursor Completo

**Vantagens:**
✅ **Permite acesso a dados atualizados.**
✅ **Permite filtragem dos dados diretamente no banco de dados.**
✅ **Suporta operações complexas com múltiplos parâmetros.**
✅ **Pode utilizar ou não a sintaxe SQL Senior 2.**

**Desvantagens:**
❌ **A performance de resposta depende da rede e do banco de dados.**
❌ **Requer mais funções e configurações em comparação ao cursor simples.**

### Funções de Retorno SQL

As funções de retorno SQL são utilizadas para extrair dados dos registros retornados pelo cursor. Cada função é específica para um tipo de dado e permite recuperar valores dos campos da consulta SQL.

#### Exemplo Completo com Todos os Tipos de Retorno

```lsp
Definir Funcao exemploCompletoRetornoSQL();

@ Variáveis globais @
Definir Alfa xCursor;
Definir Alfa vaNomeFuncionario;      @ Para SQL_RetornarAlfa @
Definir Numero vnCodigoFilial;       @ Para SQL_RetornarInteiro @
Definir Data vdDataNascimento;       @ Para SQL_RetornarData @
Definir Numero vnSalario;            @ Para SQL_RetornarFlutuante @
Definir Numero vnDeficienteFisico;   @ Para SQL_RetornarBoleano @
Definir Alfa vaFotoFuncionario;      @ Para SQL_RetornarBlob @
Definir Numero vnContadorRegistros;

exemploCompletoRetornoSQL();

Funcao exemploCompletoRetornoSQL(); {
  vnContadorRegistros = 0;
  
  SQL_Criar(xCursor);
  SQL_DefinirComando(xCursor, "SELECT NOMFUN, CODFIL, DATNAS, VALSALARIO, DEFFIS FROM R034FUN WHERE NUMEMP = 1");
  
  SQL_AbrirCursor(xCursor);
  Enquanto (SQL_EOF(xCursor) = 0) {
    
    @ ===== TODOS OS TIPOS DE RETORNO EM UM ÚNICO EXEMPLO ===== @
    
    @ 1. SQL_RetornarAlfa - Para campos de texto @
    SQL_RetornarAlfa(xCursor, "NOMFUN", vaNomeFuncionario);
    
    @ 2. SQL_RetornarInteiro - Para campos numéricos inteiros @
    SQL_RetornarInteiro(xCursor, "CODFIL", vnCodigoFilial);
    
    @ 3. SQL_RetornarData - Para campos de data @
    SQL_RetornarData(xCursor, "DATNAS", vdDataNascimento);
    
    @ 4. SQL_RetornarFlutuante - Para campos numéricos com decimais @
    SQL_RetornarFlutuante(xCursor, "VALSALARIO", vnSalario);
    
    @ 5. SQL_RetornarBoleano - Para campos boolean (1/0) @
    SQL_RetornarBoleano(xCursor, "DEFFIS", vnDeficienteFisico);
    
    @ 6. SQL_RetornarSeNulo - Para verificar campos NULL @
    Se (SQL_RetornarSeNulo(xCursor, "NOMFUN") = 0) {
      @ Campo não é nulo, processa normalmente @
      vnContadorRegistros++;
      
      @ Exemplo de processamento dos dados obtidos @
      Se (vnDeficienteFisico = 1) {
        Definir Alfa vaMensagem;
        vaMensagem = vaNomeFuncionario + " - PCD";
        Mensagem(Retorna, vaMensagem);
      } Senao {
        Definir Alfa vaCodigoFilialStr;
        Definir Alfa vaMensagem;
        IntParaAlfa(vnCodigoFilial, vaCodigoFilialStr);
        vaMensagem = vaNomeFuncionario + " - Filial: " + vaCodigoFilialStr;
        Mensagem(Retorna, vaMensagem);
      }
    }
    
    SQL_Proximo(xCursor);
  }
  
  SQL_FecharCursor(xCursor);
  SQL_Destruir(xCursor);
  
  IntParaAlfa(vnContadorRegistros, vaNomeFuncionario);
  Mensagem(Retorna, "Total processado: " + vaNomeFuncionario + " funcionários");
}

@ ===== EXEMPLO ADICIONAL PARA SQL_RetornarBlob ===== @
Funcao exemploRetornarBlob(); {
  Definir Alfa xCursorBlob;
  
  SQL_Criar(xCursorBlob);
  SQL_DefinirComando(xCursorBlob, "SELECT FOTEMP FROM R034FOT WHERE NUMEMP = 1");
  
  SQL_AbrirCursor(xCursorBlob);
  Enquanto (SQL_EOF(xCursorBlob) = 0) {
    @ 7. SQL_RetornarBlob - Para campos binários/arquivos @
    SQL_RetornarBlob(xCursorBlob, "FOTEMP", vaFotoFuncionario);
    
    @ Processar arquivo blob @
    Se (TamanhoAlfa(vaFotoFuncionario) > 0) {
      Mensagem(Retorna, "Foto encontrada");
    }
    
    SQL_Proximo(xCursorBlob);
  }
  
  SQL_FecharCursor(xCursorBlob);
  SQL_Destruir(xCursorBlob);
}
```

#### Referência Rápida das Funções

| **Função** | **Tipo de Campo** | **Sintaxe** | **Uso** |
|------------|-------------------|-------------|---------|
| `SQL_RetornarAlfa` | Texto/String | `SQL_RetornarAlfa(cursor, "CAMPO", variavel)` | Nomes, descrições, códigos texto |
| `SQL_RetornarInteiro` | Número Inteiro | `SQL_RetornarInteiro(cursor, "CAMPO", variavel)` | IDs, códigos, quantidades |
| `SQL_RetornarFlutuante` | Número Decimal | `SQL_RetornarFlutuante(cursor, "CAMPO", variavel)` | Valores monetários, percentuais |
| `SQL_RetornarData` | Data | `SQL_RetornarData(cursor, "CAMPO", variavel)` | Datas de nascimento, cadastro |
| `SQL_RetornarBoleano` | Boolean | `SQL_RetornarBoleano(cursor, "CAMPO", variavel)` | Flags verdadeiro/falso (1/0) |
| `SQL_RetornarBlob` | Binário/Arquivo | `SQL_RetornarBlob(cursor, "CAMPO", variavel)` | Imagens, documentos, anexos |
| `SQL_RetornarSeNulo` | Verificação NULL | `resultado = SQL_RetornarSeNulo(cursor, "CAMPO")` | Valida se campo é nulo |

#### Funções de Controle de Posicionamento do Cursor

Além das funções de retorno, existem funções importantes para controlar e verificar a posição do cursor durante a navegação pelos registros.

##### SQL_BOF

Verifica se o cursor está na posição inicial (antes do primeiro registro: posição BOF - Beginning of File).

**Sintaxe:** `SQL_BOF(Alfa Objeto);`

**Retorno:**

- `1`: Cursor está na posição BOF (antes do primeiro registro)
- `0`: Cursor NÃO está na posição BOF

**Importante:** Na posição BOF, todos os registros estarão nulos.

**Exemplo Prático - Proteção de Contador:**

```lsp
Definir Alfa xCursor;
Definir Numero xFormula;

xFormula = 0;
SQL_Criar(xCursor);
SQL_DefinirComando(xCursor, "SELECT R034FUN.CODFIL FROM R034FUN WHERE R034FUN.CODFIL = 1 AND R034FUN.NUMEMP = 1");

@ Teste para proteger o contador @
@ Se não está em BOF (posição inicial), processa normalmente @
Se (SQL_BOF(xCursor) = 0) {
  SQL_Proximo(xCursor);
  xFormula++;
}

SQL_FecharCursor(xCursor);
SQL_Destruir(xCursor);
```

##### SQL_EOF

Verifica se o cursor está na posição final (depois do último registro: posição EOF - End of File).

**Sintaxe:** `SQL_EOF(Alfa Objeto);`

**Retorno:**

- `1`: Cursor está na posição EOF (depois do último registro)
- `0`: Cursor NÃO está na posição EOF

**Importante:** Na posição EOF, todos os registros estarão nulos.

**Exemplo Prático - Loop de Contagem:**

```lsp
Definir Alfa xCursor;
Definir Numero xFormula;

xFormula = 0;
SQL_Criar(xCursor);
SQL_DefinirComando(xCursor, "SELECT R034FUN.CODFIL FROM R034FUN WHERE R034FUN.CODFIL = 1 AND R034FUN.NUMEMP = 1");
SQL_AbrirCursor(xCursor);

@ Loop enquanto não chegou no fim dos registros @
Enquanto (SQL_EOF(xCursor) = 0) {
  SQL_Proximo(xCursor);
  xFormula++;
}

SQL_FecharCursor(xCursor);
SQL_Destruir(xCursor);
```

#### Observações Importantes

**SQL_RetornarInteiro vs SQL_RetornarFlutuante:**

- `SQL_RetornarInteiro`: Se o campo tem valor `5.45`, retorna apenas `5`
- `SQL_RetornarFlutuante`: Retorna o valor completo `5.45`
- Para campos tipo Double, use **obrigatoriamente** `SQL_RetornarFlutuante`

**SQL_RetornarBoleano:**

- Retorna `1` para verdadeiro e `0` para falso
- Útil para campos de status, flags, indicadores

**SQL_RetornarSeNulo:**

- Retorna `1` se campo é NULL, `0` se não é NULL  
- Não detecta campos vazios (`""`) ou zero (`0`), apenas NULL
- Use para validação antes de processar dados

**SQL_BOF vs SQL_EOF:**

- **SQL_BOF**: Verifica início do cursor (Before Of File)
- **SQL_EOF**: Verifica fim do cursor (End Of File)
- Ambas retornam `1` quando na posição correspondente, `0` caso contrário
- Em ambas as posições (BOF/EOF), todos os registros estarão nulos
- Use para proteger contadores e controlar loops de navegação

### Otimizações para Cursores com Múltiplos Tipos

**❓ Pergunta Comum:** "Não há como otimizar o uso de todos os tipos de retorno em um mesmo cursor?"

**Resposta:** A sequência de `SQL_Retornar*` **é obrigatória** para cada campo, mas podemos otimizar a lógica de processamento:

#### **Versão Otimizada - Verificação Prévia de NULLs**

```lsp
Definir Funcao consultarFuncionariosOtimizado();

@ Variáveis globais @
Definir Alfa xCursor;
Definir Alfa vaNomeFuncionario;
Definir Numero vnCodigoFilial;
Definir Data vdDataNascimento;
Definir Numero vnSalario;
Definir Numero vnDeficienteFisico;
Definir Numero vnContadorValidos;
Definir Numero vnContadorTotal;

consultarFuncionariosOtimizado();

Funcao consultarFuncionariosOtimizado(); {
  vnContadorValidos = 0;
  vnContadorTotal = 0;
  
  SQL_Criar(xCursor);
  SQL_DefinirComando(xCursor, "SELECT NOMFUN, CODFIL, DATNAS, VALSALARIO, DEFFIS FROM R034FUN WHERE NUMEMP = 1");
  
  SQL_AbrirCursor(xCursor);
  Enquanto (SQL_EOF(xCursor) = 0) {
    vnContadorTotal++;
    
    @ 1. PRIMEIRA OTIMIZAÇÃO: Verificar NULLs ANTES de recuperar dados @
    Se ((SQL_RetornarSeNulo(xCursor, "NOMFUN") = 0) e (SQL_RetornarSeNulo(xCursor, "VALSALARIO") = 0)) {
      
      @ 2. SEGUNDA OTIMIZAÇÃO: Só recupera dados se necessário @
      SQL_RetornarAlfa(xCursor, "NOMFUN", vaNomeFuncionario);
      SQL_RetornarFlutuante(xCursor, "VALSALARIO", vnSalario);
      
      @ 3. TERCEIRA OTIMIZAÇÃO: Recupera dados opcionais só se precisar @
      Se (vnSalario > 5000) { @ Só pega outros dados para salários altos @
        SQL_RetornarInteiro(xCursor, "CODFIL", vnCodigoFilial);
        SQL_RetornarData(xCursor, "DATNAS", vdDataNascimento);
        SQL_RetornarBoleano(xCursor, "DEFFIS", vnDeficienteFisico);
        
        @ Processamento completo @
        vnContadorValidos++;
      }
    }
    
    SQL_Proximo(xCursor);
  }
  
  SQL_FecharCursor(xCursor);
  SQL_Destruir(xCursor);
  
  Definir Alfa vaContadorValidosStr;
  Definir Alfa vaContadorTotalStr;
  Definir Alfa vaMensagem;
  IntParaAlfa(vnContadorValidos, vaContadorValidosStr);
  IntParaAlfa(vnContadorTotal, vaContadorTotalStr);
  vaMensagem = "Registros processados: " + vaContadorValidosStr + " de " + vaContadorTotalStr;
  Mensagem(Retorna, vaMensagem);
}
```

#### **Técnicas de Otimização Aplicadas**

- **1. Verificação Prévia de NULLs**

```lsp
@ Evita recuperar dados desnecessários @
Se ((SQL_RetornarSeNulo(xCursor, "NOMFUN") = 0) e (SQL_RetornarSeNulo(xCursor, "VALSALARIO") = 0)) {
  @ Só recupera dados se campos essenciais existem @
}
```

- **2. Recuperação Condicional**

```lsp
@ Recupera dados básicos primeiro @
SQL_RetornarAlfa(xCursor, "NOMFUN", vaNomeFuncionario);
SQL_RetornarFlutuante(xCursor, "VALSALARIO", vnSalario);

@ Só recupera dados extras se condição atendida @
Se (vnSalario > 5000) {
  SQL_RetornarInteiro(xCursor, "CODFIL", vnCodigoFilial);
  @ ... outros dados @
}
```

- **3. Agrupamento por Uso**

```lsp
@ Agrupa recuperação por necessidade @
@ Campos obrigatórios: sempre recupera @
SQL_RetornarAlfa(xCursor, "NOMFUN", vaNomeFuncionario);
SQL_RetornarFlutuante(xCursor, "VALSALARIO", vnSalario);

@ Campos opcionais: recupera condicionalmente @
Se (precisaDetalhes = 1) {
  SQL_RetornarData(xCursor, "DATNAS", vdDataNascimento);
  SQL_RetornarBoleano(xCursor, "DEFFIS", vnDeficienteFisico);
}
```

#### **Resumo das Limitações e Soluções**

| **Aspecto** | **Limitação** | **Solução** |
|-------------|---------------|-------------|
| **Tipos de Dados** | Cada tipo precisa de função específica |  **Obrigatório** - Use SQL_Retornar correto |
| **Performance** | Recuperar dados desnecessários |  **Otimizável** - Verificar NULLs primeiro |
| **Lógica** | Processamento sequencial |  **Otimizável** - Recuperação condicional |
| **Memória** | Muitas variáveis |  **Otimizável** - Reutilizar variáveis |

**📌 Conclusão:** A sequência de `SQL_Retornar*` **não pode ser simplificada** (é obrigatória), mas a **lógica de quando e como recuperar** pode ser muito otimizada!
