# Regras estáticas LSP (canônico)

Fonte: interpretação de [`docs/lsp/`](../../lsp/).  
Uso: extensão **LSP Workbench** (Problems ao digitar) + skill **`@lsp-compilar`**.

Legenda Quick Fix: `sim` | `parcial` | `nao`  
Status extensão: `ok` = implementado | `pendente`

## SYN — Sintaxe

| ID | Regra | Detecção | QF | Ext | Fonte |
|----|-------|----------|----|-----|-------|
| SYN001 | Instrução termina com `;` | linha de stmt sem `;`/`{`/`}`/`\` (exceto cabeçalhos `Se`/`Enquanto`/`Para`/`Senao`; exceto string multilinha com `\` — ver SYN012) | sim (acrescentar `;`) | ok | sintaxe, padroes |
| SYN002 | `Se`/`Enquanto`/`Para` com condição entre `()` | `\bSe\s+[^(]` etc. | sim (envolver `(…)`) | ok | sintaxe, condicionais |
| SYN003 | Em `e`/`ou`, cada parte entre `()` | `Se`/`Enquanto` com `e`/`ou` mal parentizado | sim (parentizar partes) | ok | condicionais |
| SYN004 | **Revogado ([ADR-008](adr/ADR-008-aceitar-inicio-fim-e-retorna.md))** — `Inicio`/`Fim;` equivalem a `{ }`. ID não reutilizado; em `ignoreIds` é no-op | — | nao (conversão é refactor opcional) | — | ADR-008 |
| SYN005 | `Definir` no início (não no meio de `Se`/loop) | `Definir` após stmts em bloco | sim (mover Definir ao topo) | ok | erros-comuns |
| SYN006 | Nomenclatura `va`/`vn`/`vd`/`vl`/`Cur_` vs tipo | `Definir Tipo nome` desalinhado | sim (renomear **ou** mudar tipo) | ok | variaveis |
| SYN007 | Comentário `/*` fechado com `*/` | bloco aberto | sim (acrescentar `*/`) | ok | comentarios |
| SYN008 | Chaves `{`/`}` balanceadas (`Inicio`/`Fim` contam como `{`/`}`) | contagem fora de string (alerta na linha do `}` extra) | sim (remover `}` extra) | ok | sintaxe |
| SYN009 | String longa / SQL: preferir `\` ~col 80 | literal > ~100 sem `\` | sim (quebrar com `\`) | ok | padroes, sql |
| SYN010 | Identificador/tipo solto (não compila) | linha = só `Nome` ou `Nome;` sem atribuição/chamada/comando | sim (remover; ou `Definir Tipo …` se for tipo) | ok | Senior: "falta valor, expressão ou comando" |
| SYN011 | `@` só na mesma linha | abertura `@` sem fechar + fechamento `@` em outra linha | sim (converter para `/* … */`) | ok | comentarios, padroes |
| SYN012 | String `"` fechada ou continuada com `\` | `"` aberta sem fechar e sem `\` no fim (continua na linha de baixo) | nao | ok | strings, inicio-rapido |
| SYN013 | Marcador `<...>` de snippet ainda na chamada | argumento no formato `<Nome>` | nao | ok | snippets |
| SYN014 | `ConverteMascara` tipo 5 (Alfa) | tipo `5` com origem diferente de `0` ou destino que não é Alfa | nao | ok | ConverteMascara |
| SYN015 | Máscara CPF/CGC em `ConverteMascara` | máscara fora de `999.999.999-99` / `99.999.999/9999-99` | nao | ok | ConverteMascara |
| SYN016 | `FimSe` / `FimEnquanto` não existem (erro). Mensagem: "falta valor, expressão ou comando" | `\bFim(Se\|Enquanto\|Para)\b` fora de string/comentário | nao | ok | ADR-008, compilador Senior |

## RUL — Regras de ouro / limites

| ID | Regra | Detecção | QF | Ext | Fonte |
|----|-------|----------|----|-----|-------|
| RUL001 | Params de função: só `Numero` **com tipo na assinatura** | `Funcao`/`Definir Funcao` com `Alfa|Data|Lista` **ou** param só com nome (`Foo(vaP)`) | sim (Alfa→remove param + Definir global; sem tipo→`Numero vn*`) | ok | funcoes |
| RUL002 | Retorno por parâmetro (não `vn = TamanhoAlfa(`) | atribuição a out-param funcs | sim | ok | limitacoes, erros-comuns |
| RUL003 | `EstaNulo` fora da condição `Se` | `Se (EstaNulo(` | sim | ok | erros-comuns, validacao |
| RUL004 | `FormatarData` 1º arg Numero (não `vd*`) | `FormatarData(vd` | sim | ok | datas, erros-comuns |
| RUL005 | Não passar `Obj.Campo` em parâmetro cuja doc não diz Campo/Variável | arg `\w+(\.\w+)+` nas funções da lista, salvo descrição Campo/Variável | sim | ok | doc Senior (IntParaAlfa e afins) |
| RUL006 | Sem concat/`+` dentro de argumentos | arg com `+` | sim | ok | limitacoes, lembrete-ouro |
| RUL007 | `Retorna;`/`Retorne;` **sem parênteses** → `Cancel(1);`. Mensagem: "falta valor, expressão ou comando". `Retorna(x)`/`Retorna()` e `Mensagem(Retorna, …)` são válidos (ADR-008) | `\bRetorn[ae]\s*;` (exceto `Mensagem(Retorna`) | sim | ok | avisos, cancel, ADR-008 |
| RUL008 | Prefixo alinhado ao tipo (`Definir Alfa` → `va`) | ver SYN006 (mesmo check) | sim (renomear **ou** mudar tipo) | ok | variaveis |
| RUL009 | `ExecSQLEx`: `0`=sucesso (não tratar `1` como ok) | heurística pós-`ExecSQLEx` | sim (+ ignorar sem comentário) | ok | sql |
| RUL010 | Evitar `Mensagem` com JSON/XML/log enorme | `Mensagem(..., vaJSON|vaXML|vaLog…)` | nao (+ ignorar sem comentário) | ok | limitacoes, mensagens |
| RUL011 | Operador `%` → `RestoDivisao` | `\w+\s*%\s*` | sim | ok | operadores |
| RUL012 | `Chr(` inexistente → `CaracterParaAlfa` | `\bChr\s*\(` | sim | ok | erros-comuns, strings |
| RUL013 | `\n` literal → `CaracterParaAlfa(13,…)` | `"…\n…"` | sim | ok | strings |
| RUL014 | `Break` → `Pare` | `\bBreak\b` | sim | ok | condicionais |
| RUL015 | Data literal `vd = 15/08/1990` inválido | `vd*\s*=\s*\d+/\d+/\d+` | sim (`vd = CodData` / `MontaData`) | ok | erros-comuns, datas |
| RUL016 | Nome sem acento / reservada / ≤100 | id inválido após Definir | sim (reservada → vnCancel etc.) | ok | variaveis, palavras-reservadas |
| RUL017 | `Pare;` só dentro de loop | `Pare` com depth=0 | nao | ok | condicionais |
| RUL018 | `ExecSQL(va)`: Alfa deve ter SQL atribuído | `ExecSQL` + Alfa sem INSERT/UPDATE/DELETE/… | nao | ok | sql / lsp.md ExecSQL |
| RUL019 | `Cancel` só com `1`, `2` ou `3` | `Cancel;` / `Cancel()` / `Cancel(n)` com n∉{1,2,3} | sim (oferece Cancel(1\|2\|3)) | ok | cancel.md |

## FUN — Funções

| ID | Regra | Detecção | QF | Ext | Fonte |
|----|-------|----------|----|-----|-------|
| FUN001 | `Truncar(Numero)` retorna valor; também `TruncarDecimal` / `TruncarValor` | `Truncar` com 2+ args | sim | ok | erros-comuns |
| FUN002 | Máscara `FormatarData`: `dd/mm/yyyy` (não `DD/MM/YYYY`) | literal com DD/MM/YYYY | sim | ok | datas |
| FUN003 | `EstaNulo(vd*)` → 1º param Alfa (`va*`) | `EstaNulo(vd` — grifa só o `vd*` | sim (+ Definir va*) | ok | validacao |
| FUN004 | Destino `SQL_Retornar*` → `vn*` local, não `p*` | `SQL_Retornar*(…, p` | sim | ok | limitacoes, cursores |
| FUN005 | `Arredondar` inexistente → `Arredonda(valor, casas)` (literal ok; sem criar vnCasas) | `\bArredondar\s*\(` | sim (+ completion) | ok | evolucao-regras |
| FUN006 | `Arredonda(valor)` sem 2º param Decimais | 1 arg só | sim (`<vnDecimais>` / snippet) | ok | ops-numéricas |
| FUN007 | `Definir Funcao` sem `Funcao … { }` | decl sem impl | nao | ok | PDR-003 |
| FUN008 | `Funcao … { }` sem `Definir Funcao` | impl sem decl | nao | ok | PDR-003 |
| FUN009 | Chamada a função elegível só em outro arquivo do escopo | call sem Decl+Impl locais | sim (importar) | ok | PDR-003 |
| FUN010 | Função não declarada: `Falta declaração do "Label/Função" = "X"` | `X(` fora do arquivo/escopo, embutidos e catálogo; métodos `.X(` não contam. Erro com catálogo extra, aviso sem ele | nao | ok | PDR-012 |
| FUN011 | `Faltam`/`Muitos parâmetros na chamada da função "X"` | embutido fora da faixa (`Cancel 0–1`, `Retorna 0–1`…); função do catálogo só com assinatura do extra (a doc pública diverge na aridade) | nao | ok | PDR-012 |
| FUN012 | `valor "v" (T) para o parâmetro "P" (T) são incompatíveis` | Alfa × Numero (Data = Numero) com assinatura do extra; tipo do argumento só por literal ou `Definir` (`'X'` passa nos dois) | nao | ok | PDR-012 |
| FUN013 | Saída (`End`) recebendo expressão ou constante | arg não é variável, `vetor[i]` nem `Tabela.Campo`; vale com `End` da doc ou do extra | nao | ok | PDR-012 |
| FUN014 | Saída (`End`) recebendo campo de cursor | `Cur.Campo` com `Definir Cursor Cur` | nao | ok | PDR-012 |

## TYP — Tipos

Tipo conhecido: literal, `Definir`, parâmetro de `Funcao` e `Tabela.Campo` pelo catálogo de banco (`lsp.catalog.path`). Variável sem `Definir`, campo de cursor e retorno de função ficam desconhecidos e nunca geram erro. `Data`/`Hora` contam como Numero; `'X'` passa nos dois. Comando que o checador não consegue ler é ignorado inteiro.

| ID | Regra | Detecção | QF | Ext | Fonte |
|----|-------|----------|----|-----|-------|
| TYP001 | Atribuição Alfa × Numero: `tipos incompatíveis: ALFA e NUMERO` (alvo primeiro) | `=`, `+=`, `-=`, `*=`, `/=`, `++`, `--` | nao | ok | PDR-012 |
| TYP002 | Comparação ou operador com Alfa | comparação/`+`/`-` com tipos misturados → `tipos incompatíveis: …`; `* / %`, `-` unário e Alfa − Alfa → `Variáveis alfanuméricas ou operadores não compatíveis <op>`. Vale em argumento de função (`"Total: " + vnTotal`) | nao | ok | PDR-012 |
| TYP003 | Condição Alfa em `Se`/`Enquanto` | `Se (vaNome)` → `Variáveis alfanuméricas ou operadores não compatíveis na condição` | nao | ok | PDR-012 |

## SEM — Semântica (heurística)

| ID | Regra | Detecção | QF | Ext | Fonte |
|----|-------|----------|----|-----|-------|
| SEM001 | Variável usada sem `Definir` (exceto `vn*` — Numero implícito = 0; instâncias `Definir caminho.ws Nome`; membros após `.`). Prefixo `va*`/`vd*`/… é boa prática, não filtro. Em relatório: `E*` da Entrada **e** `Definir` file-scope dos peers (`Inicializacao`, seções, `contextoExtra`) via `knownGlobals`; em escopo multiarquivo, peers do índice também | qualquer id (não keyword/builtin/função/tabela/`vn*`/WS) fora do set de Definir | sim (+ Ctrl+Espaço) | ok | erros-comuns, variaveis, PDR-008, web-service |
| SEM002 | `Abrir`/`Fechar` pareados (arquivo) | alerta na linha do `Abrir` órfão | sim (Fechar / Completar) | ok | arquivos |
| SEM003 | Cursor: `.AbrirCursor` sem `.FecharCursor` | alerta na linha do AbrirCursor órfão (contagem; fechar a mais não alerta) | sim (FecharCursor / Completar) | ok | cursores / lsp.md |
| SEM004 | Lista: campo usado sem `AdicionarCampo` | `vl.Campo` ∉ set de AdicionarCampo | sim (inserir AdicionarCampo) | ok | listas |
| SEM005 | Laço `Enquanto (X.Achou)` sem `X.Proximo()` no corpo (loop infinito) | AST: condição exatamente `X.Achou`; procura `X.Proximo` em qualquer profundidade do corpo | nao | ok | PDR-012 |
| SEM006 | `Continue` sem `X.Proximo()` antes, dentro de `Enquanto (X.Achou)` | AST: stmts anteriores no mesmo bloco e nos ancestrais até o laço; laços internos não entram | nao | ok | PDR-012 |
| SEM007 | Atribuição a campo de cursor: `não é possível atribuir valores a campos de cursores.` | `Cur.CAMPO =` / `+=` / `++` fora de parênteses (cursor de `Definir Cursor`) | nao | ok | PDR-012 |

## SQL

| ID | Regra | Detecção | QF | Ext | Fonte |
|----|-------|----------|----|-----|-------|
| SQL001 | Preferir `:bind` a concat em SQL | alerta na linha do `+` | sim (→ `:variavel`) | ok | sql |
| SQL002 | `SQL_Criar` ↔ `SQL_Destruir` | alerta na linha do `SQL_Criar` | sim (inserir Destruir) | ok | cursores, sql |
| SQL003 | `SQL_AbrirCursor` sem `SQL_FecharCursor` | alerta na linha do Abrir (contagem; fechar a mais não alerta) | sim (inserir FecharCursor) | ok | cursores |
| SQL004 | `SQL_Criar(x)`: `x` deve ser `Definir Alfa` | tipo ≠ alfa ou sem Definir | sim (Definir Alfa + renomear para `va*`) | ok | sql / lsp.md |
| SQL005 | `SQL_AbrirCursor` após `SQL_DefinirComando` | Abrir sem DefinirComando prévio | sim (inserir DefinirComando) | ok | sql |
| SQL006 | `SQL_UsarSQLSenior2` / `SQL_UsarAbrangencia` antes de DefinirComando | Usar* depois do comando | sim (mover Usar* antes) | ok | sql nativo / subquery |
| SQL007 | `SQL_DefinirComando` após `SQL_Criar` | DefinirComando sem Criar | sim (inserir Criar) | ok | sql |
| SQL008 | JOIN/subquery → nativo | comando com JOIN/`(SELECT` sem UsarAbrangencia(0)+UsarSQLSenior2(0) | sim (inserir Usar*) | ok | sql nativo |
| SQL009 | Não misturar API simples × completa | `SQL_*` em `Definir Cursor` ou `.AbrirCursor` em handle de `SQL_Criar` | sim (**esqueleto** do modo certo; ou só converter a linha). SQL002 adiado enquanto a API estiver misturada | ok | cursores |
| SQL010 | Função nativa do banco em SQL Senior 2 | `TO_DATE`/`NVL`/`SYSDATE`/… no comando com dialeto Senior 2 | sim (→ `STRTODATE`/`IFNULL`/`TODAY`/…) | ok | dialeto Senior 2 |
| SQL011 | Agregação no SELECT sob Senior 2 | `COUNT`/`SUM`/`MAX`/`MIN`/`AVG` na lista do SELECT | sim (inserir Usar* nativo) | ok | dialeto Senior 2 |
| SQL012 | Campo do cursor fora do SELECT: `Campo X não foi encontrado no SELECT do cursor C` | `Cur.CAMPO` contra a união das colunas de todos os `Cur.SQL "…"` do arquivo (nome ou apelido). `SELECT *`, coluna sem apelido que é expressão ou SQL por variável desligam | nao | ok | PDR-012 |
| SQL013 | Coluna repetida no SELECT (aviso): `Campo de nome "X" está sendo selecionado repetidamente no cursor "C".` | mesmo nome ou apelido duas vezes num SELECT. Aviso porque regras em produção têm coluna repetida | nao | ok | PDR-012 |
| SQL014 | `Cursor C está sem comando SQL` | `Cur.AbrirCursor()` sem `Cur.SQL` antes no texto | nao | ok | PDR-012 |
| SQL015 | Parâmetro do SQL sem variável (aviso): `comando SQL definido incorretamente: identificador "x" não foi declarado ou utilizado na regra. …` | `:x` no `Cur.SQL "…"` (fora de `'…'`) sem `x` em nenhum ponto do código fora de strings. Aviso porque pode ser variável da tela | nao | ok | PDR-012 |

## ANL — Analyzer (`@lsp-workbench/analyzer`)

Emitidos pela AST (Opção 2). A extensão faz **merge** com SYN/RUL (dedupe vs RUL007 / SYN003 / SYN008). Source típico: `LSP Analyzer` (LS) ou mesclado no Problems in-process.

| ID | Regra | Detecção | QF | Ext | Fonte |
|----|-------|----------|----|-----|-------|
| ANL001 | `{`/`Inicio` sem `}`/`Fim` correspondente | AST braces | parcial | ok | analyzer |
| ANL002 | `}`/`Fim` sem `{`/`Inicio` correspondente | AST braces | parcial | ok | analyzer |
| ANL004 | **Revogado (ADR-008)** — `Inicio`/`Fim` são válidos | — | — | — | ADR-008 |
| ANL010 | `Retorna;` / `Retorne;` sem parênteses ("falta valor, expressão ou comando"); `Retorna(x)` é válido | AST / token | sim (via RUL007) | ok | analyzer |
| ANL011 | `e` / `ou` com partes mal parentizadas | AST condição | sim (via SYN003) | ok | analyzer |
| ANL012 | `Se`/`Enquanto`/`Para` sem `(` | tokens | sim (via SYN002) | ok | analyzer |

## DEM — Catálogo local de tabelas

Só quando existir JSON no path configurado de catálogo local (ou default `docs/banco-senior/.generated/catalog.json` na 1ª pasta do workspace).

| ID | Regra | Detecção | QF | Ext | Fonte |
|----|-------|----------|----|-----|-------|
| DEM001 | Identificador E*/R*/USU_* ausente do catálogo local | heurística + catálogo | nao (+ ignore) | ok | catálogo local |
| DEM002 | Campo inexistente em `TABELA.CAMPO`: `Campo X não foi encontrado` | tabela do catálogo (não declarada como variável) com campo fora dela; `TABELA.X(` e `TABELA.X.Y` não contam | nao | ok | PDR-012 |
| DEM003 | Coluna do SELECT inexistente na tabela (aviso): `Campo X não foi encontrado na tabela T (SELECT do cursor C)` | coluna com prefixo de tabela/apelido, ou sem prefixo com uma só tabela no FROM | nao | ok | PDR-012 |

## GER — Projeto de relatório (PDR-008)

Só quando o arquivo `.lsp` está sob um projeto com `relatorio.json` (resolver sobe diretórios) **e** o contexto de evento é passado ao `analyzeLsp`.

| ID | Regra | Detecção | QF | Ext | Fonte |
|----|-------|----------|----|-----|-------|
| GER001 | `InsClauSQL*` / `SubstituiFrom` / `DeleteFieldSQL` / `InsSQLWhereSimples` só na Pré-Seleção | API fora de `Pre-Selecao.lsp` | nao (+ ignore) | ok | gerador-relatorios |
| GER002 | Não usar `ListaSecao` / `AlteraControle` na Pré-Seleção | chamada nesses nomes em Pré-Seleção | nao (+ ignore) | ok | modelo-gerador |
| GER003 | `ListaSecao("Nome")` — seção deve existir no projeto | string ∉ pastas `Secoes/` | nao | ok | PDR-008 |
| GER004 | 1º arg de `InsClauSQL*` / `InsSQLWhereSimples` — seção Detalhe conhecida | string ∉ seções do manifesto | nao | ok | PDR-008 |

## Mapa de equivalência (IDs antigos do skill)

| Antes (skill antigo) | Agora (canônico) |
|----------------------|------------------|
| SYN007 string longa | **SYN009** |
| SYN008 comentários | **SYN007** + docs |
| SYN009 Pare/Cancel | **RUL017** / **RUL007** |
| RUL008 CopiarAlfa | (manual / SEM) — não confundir com **RUL008** prefixo |
| FUN001 `%` | **RUL011** |
| FUN002 `\n` | **RUL013** |
| FUN003 Break | **RUL014** |
| FUN004 Chr/Truncar | **RUL012** / **FUN001** |
| FUN005 reservada | **RUL016** |
| SEM001 Cursor Abrir | **SEM003** (`.AbrirCursor` / `.FecharCursor`) |
| SEM008 Arquivo | **SEM002** (`Abrir` / `Fechar` de arquivo) |
| SEM010 sem Definir | **SEM001** |

## Fora de escopo estático (só docs / Agent)

Recursão pedagógica, trade-offs de arquitetura, SSL/certificados, “quando usar JSON”, conteúdo de `tags-e-palavras-chave.md`.  
(`Cancel(1|2|3)` → **RUL019**; significado de cada código permanece em `docs/lsp/cancel.md`.)
