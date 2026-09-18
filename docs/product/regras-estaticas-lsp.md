# Regras estáticas LSP (canônico)

Fonte: interpretação de [`docs/lsp/`](../../lsp/).  
Uso: extensão **LSP Workbench** (Problems ao digitar) + skill **`@lsp-validar`**.

Legenda Quick Fix: `sim` | `parcial` | `nao`  
Status extensão: `ok` = implementado | `pendente`

## SYN — Sintaxe

| ID | Regra | Detecção | QF | Ext | Fonte |
|----|-------|----------|----|-----|-------|
| SYN001 | Instrução termina com `;` | linha de stmt sem `;`/`{`/`}`/`\` | sim (acrescentar `;`) | ok | sintaxe, padroes |
| SYN002 | `Se`/`Enquanto`/`Para` com condição entre `()` | `\bSe\s+[^(]` etc. | sim (envolver `(…)`) | ok | sintaxe, condicionais |
| SYN003 | Em `e`/`ou`, cada parte entre `()` | `Se`/`Enquanto` com `e`/`ou` mal parentizado | sim (parentizar partes) | ok | condicionais |
| SYN004 | Blocos `{ }` (não `Inicio`/`Fim;`/`FimSe`/`FimEnquanto`) | palavras-chave legado | sim (par Inicio…Fim; → `{`…`}` de uma vez) | ok | sintaxe, padroes |
| SYN005 | `Definir` no início (não no meio de `Se`/loop) | `Definir` após stmts em bloco | sim (mover Definir ao topo) | ok | erros-comuns |
| SYN006 | Nomenclatura `va`/`vn`/`vd`/`vl`/`Cur_` vs tipo | `Definir Tipo nome` desalinhado | sim (renomear prefixo) | ok | variaveis |
| SYN007 | Comentário `/*` fechado com `*/` | bloco aberto | sim (acrescentar `*/`) | ok | comentarios |
| SYN008 | Chaves `{`/`}` balanceadas | contagem fora de string (alerta na linha do `}` extra) | sim (remover `}` extra) | ok | sintaxe |
| SYN009 | String longa / SQL: preferir `\` ~col 80 | literal > ~100 sem `\` | sim (quebrar com `\`) | ok | padroes, sql |
| SYN010 | Identificador/tipo solto (não compila) | linha = só `Nome` ou `Nome;` sem atribuição/chamada/comando | sim (remover; ou `Definir Tipo …` se for tipo) | ok | Senior: "falta valor, expressão ou comando" |

## RUL — Regras de ouro / limites

| ID | Regra | Detecção | QF | Ext | Fonte |
|----|-------|----------|----|-----|-------|
| RUL001 | Params de função: só `Numero` em `Funcao` | `Funcao …(Alfa|Data|Lista…)` | sim (remove tipo + Definir) | ok | funcoes |
| RUL002 | Retorno por parâmetro (não `vn = TamanhoAlfa(`) | atribuição a out-param funcs | sim | ok | limitacoes, erros-comuns |
| RUL003 | `EstaNulo` fora da condição `Se` | `Se (EstaNulo(` | sim | ok | erros-comuns, validacao |
| RUL004 | `FormatarData` 1º arg Numero (não `vd*`) | `FormatarData(vd` | sim | ok | datas, erros-comuns |
| RUL005 | Não passar `Obj.Campo` direto em args de função | arg `\w+(\.\w+)+` em call | sim | ok | limitacoes, avisos |
| RUL006 | Sem concat/`+` dentro de argumentos | arg com `+` | sim | ok | limitacoes, lembrete-ouro |
| RUL007 | `Retorna;`/`Retorne;` → `Cancel(1);` | `\bRetorn[ae]\s*;` (exceto `Mensagem(Retorna`) | sim | ok | avisos, cancel |
| RUL008 | Prefixo alinhado ao tipo (`Definir Alfa` → `va`) | ver SYN006 (mesmo check) | sim (renomear) | ok | variaveis |
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

## SEM — Semântica (heurística)

| ID | Regra | Detecção | QF | Ext | Fonte |
|----|-------|----------|----|-----|-------|
| SEM001 | Variável prefixada usada sem `Definir` (exceto `vn*` — Numero implícito = 0) | `va*`/`vd*`/`vl*`/`Cur_*` fora do set (se há Definir) | sim (+ Ctrl+Espaço) | ok | erros-comuns, variaveis |
| SEM002 | `Abrir`/`Fechar` pareados (arquivo) | alerta na linha do `Abrir` órfão | sim (Fechar / Completar) | ok | arquivos |
| SEM003 | Cursor: `.AbrirCursor` ↔ `.FecharCursor` | alerta na linha do AbrirCursor órfão | sim (FecharCursor / Completar) | ok | cursores / lsp.md |
| SEM004 | Lista: campo usado sem `AdicionarCampo` | `vl.Campo` ∉ set de AdicionarCampo | sim (inserir AdicionarCampo) | ok | listas |

## SQL

| ID | Regra | Detecção | QF | Ext | Fonte |
|----|-------|----------|----|-----|-------|
| SQL001 | Preferir `:bind` a concat em SQL | alerta na linha do `+` | sim (→ `:variavel`) | ok | sql |
| SQL002 | `SQL_Criar` ↔ `SQL_Destruir` | alerta na linha do `SQL_Criar` | sim (inserir Destruir) | ok | cursores, sql |
| SQL003 | `SQL_AbrirCursor` ↔ `SQL_FecharCursor` | alerta na linha do Abrir | sim (inserir FecharCursor) | ok | cursores |
| SQL004 | `SQL_Criar(x)`: `x` deve ser `Definir Alfa` | tipo ≠ alfa ou sem Definir | sim (Definir Alfa + renomear para `va*`) | ok | sql / lsp.md |
| SQL005 | `SQL_AbrirCursor` após `SQL_DefinirComando` | Abrir sem DefinirComando prévio | sim (inserir DefinirComando) | ok | sql |
| SQL006 | `SQL_UsarSQLSenior2` / `SQL_UsarAbrangencia` antes de DefinirComando | Usar* depois do comando | sim (mover Usar* antes) | ok | sql nativo / subquery |
| SQL007 | `SQL_DefinirComando` após `SQL_Criar` | DefinirComando sem Criar | sim (inserir Criar) | ok | sql |
| SQL008 | JOIN/subquery → nativo | comando com JOIN/`(SELECT` sem UsarAbrangencia(0)+UsarSQLSenior2(0) | sim (inserir Usar*) | ok | sql nativo |
| SQL009 | Não misturar API simples × completa | `SQL_*` em `Definir Cursor` ou `.AbrirCursor` em handle de `SQL_Criar` | sim (**esqueleto** do modo certo; ou só converter a linha). SQL002 adiado enquanto a API estiver misturada | ok | cursores |

## ANL — Analyzer (`@lsp-workbench/analyzer`)

Emitidos pela AST (Opção 2). A extensão faz **merge** com SYN/RUL (dedupe vs RUL007 / SYN003 / SYN008). Source típico: `LSP Analyzer` (LS) ou mesclado no Problems in-process.

| ID | Regra | Detecção | QF | Ext | Fonte |
|----|-------|----------|----|-----|-------|
| ANL001 | `{` sem `}` correspondente | AST braces | parcial | ok | analyzer |
| ANL002 | `}` sem `{` correspondente | AST braces | parcial | ok | analyzer |
| ANL010 | `Retorna;` / `Retorne;` inválidos | AST / token | sim (via RUL007) | ok | analyzer |
| ANL011 | `e` / `ou` com partes mal parentizadas | AST condição | sim (via SYN003) | ok | analyzer |

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
