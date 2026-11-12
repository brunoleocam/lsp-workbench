# Changelog — LSP Workbench (extensão)

## 0.3.2 — 2026-11-12

### Corrigido

- Ctrl+Espaço e revalidação lentos (dezenas de segundos) em regra de compartilhamento de rede: a busca do projeto de relatório subia até a raiz do servidor (`\\servidor\relatorio.json`), ~360 ms por teste, várias vezes por tecla. Agora para na raiz do compartilhamento
- A busca de arquivos `.lsp` do workspace não se repete a cada chamada quando não encontra nenhum
- Regra `.LSP` binária aberta da rede: completion, escopo de símbolos e diagnóstico usam o caminho com o servidor (antes recebiam `\pasta\...` sem `\\servidor`)

### Adicionado

- Canal de saída "LSP Workbench: desempenho": registra completion acima de 300 ms com o tempo de cada etapa, a busca de `.lsp` do workspace e leituras de arquivo acima de 100 ms

## 0.3.1 — 2026-11-12

### Alterado

- O comando "LSP: Abrir regra .LSP binária como texto" passa a se chamar "Abrir regra .LSP binária"

### Corrigido

- Regra `.LSP` binária em compartilhamento de rede (`\\servidor\pasta\X.LSP`) não abria: o caminho perdia o servidor e o arquivo era dado como inexistente. Falha ao abrir a regra agora mostra a mensagem de erro em vez de não fazer nada

## 0.3.0 — 2026-11-09

### Alterado

- `Inicio`/`Fim` equivalem a `{`/`}` no balanceamento, no escopo e na formatação. SYN004 e ANL004 foram revogados e o quick fix de conversão saiu; a conversão continua como refactor opcional ([ADR-008](../../docs/product/adr/ADR-008-aceitar-inicio-fim-e-retorna.md))
- RUL007/ANL010 valem só para `Retorna;`/`Retorne;` sem parênteses, com a mensagem do compilador "falta valor, expressão ou comando". `Retorna(valor)` e `Mensagem(Retorna, …)` não acusam mais
- `Retorna` volta ao completion como `Retorna($1);`

### Adicionado

- SYN016 (erro): `FimSe` / `FimEnquanto` não existem no compilador Senior
- F9 (`lsp.compileDocument`) revalida o arquivo e mostra a contagem de erros e avisos; `lsp.compileOnSave` (padrão `true`) revalida ao salvar; a status bar mostra os erros e avisos do arquivo ativo e abre Problemas ao clicar
- Dicionário de dados (`lsp.dataDictionary`, Ctrl+Alt+D ou botão no título do editor): escolhe a tabela do catálogo local por nome ou descrição (sem acento nem caixa), depois o campo (tipo, tamanho, chave, descrição), e insere `TABELA.CAMPO` no cursor. A palavra sob o cursor, se for tabela, já vem como filtro
- Dicionário e cursores, com o texto do compilador Senior: SEM007 (atribuição a campo de cursor), SQL012 (campo do cursor fora do SELECT), SQL013 (coluna repetida no SELECT, aviso), SQL014 (`AbrirCursor` sem `.SQL` antes), SQL015 (`:param` do SQL sem variável na regra, aviso). Com catálogo de banco (`lsp.catalog.path`): DEM002 (campo inexistente em `TABELA.CAMPO`) e DEM003 (coluna do SELECT inexistente na tabela, aviso)
- SEM005 (erro): `Enquanto (X.Achou)` sem `X.Proximo()` no corpo
- SEM006 (erro): `Continue` dentro de `Enquanto (X.Achou)` sem `X.Proximo()` antes
- TYP001..TYP003: tipos Alfa × Numero em atribuição, comparação, operador e condição, com o texto do compilador Senior; `Tabela.Campo` usa o tipo do catálogo de banco (`lsp.catalog.path`)
- FUN010..FUN014: checagem de chamada com o texto do compilador Senior — função não declarada (erro com catálogo extra, aviso sem ele), nº de argumentos (embutidos sempre; catálogo só com assinatura do extra), tipo Alfa × Numero (assinatura do extra, tipo por literal ou `Definir`), parâmetro `End` recebendo expressão, constante ou campo de cursor
- Catálogo de funções com `End` estruturado (`params[].out`) e tipo normalizado, inferidos da assinatura documentada
- Regra `.LSP` binária do Senior abre como texto (esquema `lsp-binario`) ao clicar no Explorer; `lsp.binary.autoOpen` (padrão `true`) desliga, e o comando "LSP: Abrir regra .LSP binária como texto" (também no menu do Explorer) abre manualmente. Salvar grava `X.editado.LSP` ao lado e nunca altera o original; reabrir o original com cópia presente abre a cópia e avisa. Caractere fora do Windows-1252 bloqueia o salvamento citando caractere e linha. O documento recebe diagnósticos e completion como um `.lsp` texto; o `file:` binário fica sem diagnóstico nem formatação
- "LSP: Gerar .LSP para o Senior" (botão no título do editor e paleta, em `.lsp` texto): pede o título, avisa em modal se a regra tem erros, abre "Salvar como" com `NOME.senior.LSP` ao lado do texto e grava um `.LSP` novo no formato do Senior (identificador e chave novos, histórico vazio), conferindo relendo
- `.lsptxt` abre com a linguagem Senior LSP
- Catálogo de funções extra (ADR-009): `lsp.functions.path` ou uma extensão que declare `"lspWorkbench": { "functionsCatalog": "…" }`. Assinatura, parâmetros e variantes do extra vencem; a nossa doc complementa o texto. Vale para completion, hover, signature help, diagnóstico e language server. Contrato de exemplo em `docs/product/schema/functions.example.json`

### Corrigido

- Texto com `\` seguido de espaços no fim da linha continua na linha seguinte também no analyzer; antes a string terminava ali e desalinhava os blocos seguintes

### Segurança

- Saíram do repositório o relatório de cliente usado como fixture e as tabelas e campos `USU_` reais dos testes; os testes usam nomes fictícios. `check-proprietary-data` passa a falhar com `USU_` fora da lista de fictícios em qualquer arquivo de texto ([ADR-009](../../docs/product/adr/ADR-009-catalogo-funcoes-proprietario-demobile.md))

## 0.2.16 — 2026-10-13

### Adicionado

- Snippets e hover das funções `SQL_*` descrevem cada parâmetro (tipo e texto). Inclui `SQL_DefinirFlutuante`, `SQL_DefinirBoleano`, `SQL_BOF`, `SQL_RetornarFlutuante`, `SQL_RetornarBoleano`, `SQL_RetornarBlob` e `SQL_RetornarSeNulo`
- O editor fecha o comentário `@` na mesma linha

### Alterado

- Highlight de `SQL_DefinirFlutuante` e `SQL_DefinirBoleano`

## 0.2.15 — 2026-10-02

### Adicionado

- Funções SGI no catálogo da plataforma (completion, hover e highlight): `AbrirTelaSGI`, `AbrirTelaSGICarregandoChave`, `AtribuirFocoComponenteSGI`, `AtualizarTabela`, `CompilaFormulario`, `FecharFormularioSGI`, `InserirValoresSGI`, `LimparValorCampoSGI`

## 0.2.14 — 2026-09-30

### Adicionado

- Hover e ajuda de parâmetros passam a mostrar um bloco **Dica** (aviso e exemplo curto) extraído de `docs/lsp`, sem apagar o texto que o override já cobre

## 0.2.13 — 2026-09-28

### Adicionado

- Comando **LSP Workbench: Configurar este Workspace** grava `.cursor`, `.github` (Copilot) e as associações `*.lsp` / `*.lspt` em `.vscode/settings.json`
- **Modo Ghost**: **Ativar Modo Ghost** e **Desativar Modo Ghost** ligam a sugestão inline em `senior-lsp`. No Cursor, também liberam ou bloqueiam o Tab de IA nessa linguagem
- Hover em um argumento mostra a documentação daquele parâmetro (catálogo Senior e funções do projeto), com enums e seções
- Snippet `ConverteMascara`, com tipo de dado e máscaras de CPF/CGC
- Documentação de parâmetros nos snippets nativos (`SQL_*`, `Mensagem`, `EstaNulo`, `FormatarData` e outros), usada no hover e na ajuda de parâmetros

### Corrigido

- **RUL005**: `Objeto.Campo` passa quando a documentação do parâmetro diz Campo/Variável. Menção só a tamanho ou posição não libera o parâmetro
- **SYN013**: marcador `<...>` de snippet ainda presente na chamada
- **SYN014** / **SYN015**: `ConverteMascara` no tipo 5 (Alfa) e máscara de CPF/CGC
- **DEM001**: coluna (`USU_*` em SELECT, WHERE, ORDER BY ou `alias.campo`) deixa de ser tratada como tabela; o alerta fica na tabela ausente do FROM/JOIN
- A setting `lsp.demobile.catalogPath` saiu do manifesto. Se a chave antiga ainda estiver no settings, o catálogo continua sendo lido

### Alterado

- Catálogos de funções HCM e ERP regenerados com parâmetros e texto da documentação Senior

## 0.2.12 — 2026-09-25

### Corrigido

- Campos Alfa voltam ao Ctrl+Espaço. O ícone de texto era ocultado junto com as palavras soltas

## 0.2.11 — 2026-09-25

### Alterado

- Ícone do campo no Ctrl+Espaço segue o tipo: enumeração, número, texto (Alfa) e data/hora

## 0.2.10 — 2026-09-24

### Corrigido

- Ctrl+Espaço mostra tabelas e campos do catálogo mesmo dentro de aspas (SQL da regra) e sem esperar o índice do projeto

## 0.2.9 — 2026-09-24

### Corrigido

- Ctrl+Espaço de tabelas usa o `catalog.json` já disponível na instalação quando `lsp.catalog.path` está vazio ou aponta para um arquivo que não existe

## 0.2.8 — 2026-09-24

### Adicionado

- Ctrl+Espaço de campo mostra tipo, máscara, tamanho, decimais, descrição, nulo, obrigatório e os valores da enumeração (`KEYNAM`, descrição e `KEYORD`)

## 0.2.7 — 2026-09-24

### Alterado

- Ctrl+Espaço de tabelas e campos do banco segue a ordem do catálogo (`FLDORD`), sem reordenar em A–Z
- Campo da chave primária marcado como **chave** na lista

## 0.2.6 — 2026-09-24

### Alterado

- Temas **Dark** e **Full Dark**: paleta inspirada no [Copilot Theme](https://github.com/benjaminbenais/copilot-theme) — fundo `#232a2f` / `#161b1e`, string `#5bec95`, função `#ffea6b`, keyword `#ba8ef7`, número `#ffa763`, variável/operador branco `#ffffff`, tipo `#89ddff`, variável de sistema vermelha negrito `#ff5555`, operadores (`+` `-` `=` `>` `<` `/` `\\` `;`) rosa `#ff6a80`
- Tema **Clássico** (claro): mesma hierarquia — string `#0d9f56`, função `#9a7b00`, keyword `#8250df`, número `#bc4c00`, variável/operador `#1a2023`, tipo `#0550ae`

## 0.2.5 — 2026-09-24

### Corrigido

- Snippets ERP com parâmetros ausentes: `LeListaSimulaComponentes`, `SimulaCargaRecursos`, `AtualizarPesosPFA`
- `LeLotesSubdivididos`: removido slot vazio na assinatura (typo da doc Senior)

## 0.2.4 — 2026-09-24

### Adicionado

- Catálogo unificado (~1500+ builtins): plataforma (`docs/lsp`) + índices HCM e ERP
- Fixtures `senior-docs-hcm-functions.json` / `senior-docs-erp-functions.json` com sintaxe, parâmetros e links Senior
- Merge HCM/ERP no analyzer; filtro por sistema no Ctrl+Espaço (`catalogForSystem`)
- Script `generate-system-functions` (regenera catálogos a partir das fixtures)

## 0.2.3 — 2026-09-23

### Adicionado

- SYN012: string `"` aberta sem fechar (use `\` para continuar na linha seguinte)
- SYN001: não alerta strings multilinha com `\` (ex. `Cur_Tab1.SQL "SELECT … \`)
- Cursor simples / completo no Ctrl+Espaço; overrides SQL_* com handle `vaCur`
- Variáveis de sistema no completion/hover + highlight Senior (temas embutidos)
- Gerar relatório: múltiplas seções; comando **Importar Relatório** (dump multi-trecho → ADR-007); docs de usuário/raiz atualizadas
- Ctrl+Espaço: rótulos **Sistema / Global / Arquivo / Projeto / Parâmetro / Senior / Snippet / Custom**; vars de sistema com prefixo vazio; lista `isIncomplete` para filtrar ao digitar (ex. `Cod`)
- Highlight: `End` (modificador de parâmetro), `Definir Tipo Nome` com cores distintas, chamadas `Nome(`, semantic tokens em call-sites + `semanticTokenColors` nos temas
- Highlight SQL embutido em strings: keywords (`SELECT`/`FROM`/…), funções (`TO_DATE`/`COUNT`/…), binds (`:vnId`)
- Highlight: fluxo (`Se`/`Enquanto`/`Para`), operadores (`e`/`ou`/`++`/`<>`), tipo/var/campo/método de `Lista`
- `Senao`/`Se`/`Enquanto`/`Para` via semantic token `macro` (rosa) — evita `Senao` ficar branco
- Highlight Cursor: tipo `Cursor`, variável `Cur_*`, campo (`Cur_Tab1.QtdPed`) e métodos (`AbrirCursor`/`Proximo`/…)
- Variáveis de sistema (`CodEmp`, …) só com highlight de sistema quando sozinhas — após `.` (ex. `wsPedidos.Pedido.CodEmp`) ficam como campo
- WebService: `Definir caminho.pontuado wsNome` reconhecido (sem SEM001); highlight de caminho, instância, tabela e campo (`ws.Pedido.Usuario.CmpUsu`)
- WebService na própria regra: `PedidoAssitencia.Retorno.NumPed` (PascalCase) com o mesmo highlight de instância `ws*`
- Highlight: `/` (divisão) vs `\` (continuação de linha) com cores distintas

### Removido

- Comando legado `lspWorkbench.adicionarContextoRelatorio`
- Exemplos `RDCG183` → `RDCGXXX`

## 0.2.2 — 2026-09-23

### Documentação

- README usuário: passo a passo (`.vscode/settings.json`, associação `.txt`, multiarquivo/`lsp.contexts`, relatório, catálogo)
- Build/F5/publish concentrados em [Documentação para desenvolvedores](../../docs/product/DEVELOPER.md)
- Marketplace: imagens do README com URL absoluta (`raw.githubusercontent.com/.../packages/lsp-workbench/media/`) — paths relativos `media/` resolviam para a raiz do monorepo e davam 404

## 0.2.1 — 2026-09-23

### Documentação (Marketplace / GitHub)

- README da extensão com capturas reais + GIF de validação (`media/01`…`08`)
- README raiz do monorepo com galeria e badge do Marketplace
- Keywords ampliadas (Senior, Sapiens, HCM, syntax highlighting, formatter, …)
- Exemplos de captura: banners com `/* */` (não `@` multi-linha — inválido em LSP)

### Corrigido

- TextMate: comentário `@` não atravessa linhas (só até `@` ou fim da linha)
- **SYN011**: detecta `@` aberto numa linha e fechado noutra; QF → `/* … */`
- **RUL006**: não trata `++`/`--` nem `Para`/`Se`/`Enquanto` como concatenação em argumentos
- Completion: com alerta na linha (ex. SYN010 em `Tam`), ainda sugere funções do catálogo (`TamanhoAlfa`)
- Completion: qualquer prefixo (`D`/`De`/`S`/`Tam`…) → match exato, depois variáveis, funções, comandos; lista afunila ao digitar
- Completion: dentro de cada faixa, ordem alfabética (`TamanhoAlfa` antes de `TamanhoStr`)
- Completion de membros (`vlItens.` / Cursor): ordem alfabética (antes era ordem do catálogo)
- Catálogo: fallback + setting F5 para `docs/banco-senior-base/catalog.example.json` (E012FAM. no Debug)

## 0.2.0 — 2026-09-18

### Adicionado (PDR-004 — Opção 1)

- Completion de membros Cursor / Lista + campos `AdicionarCampo` (domínio puro)
- Semantic tokens (funções, variáveis, membros)
- Snippets ~30 (Definir, blocos, SQL API, helpers) com `{ }`
- TextMate enriquecida com builtins do catálogo SENIOR (~208)
- Catálogos stub HCM / ERP mesclados por `system` do contexto
- Format SQL embutido opt-in (`lsp.format.embeddedSql.*`)
- Outline (`DocumentSymbolProvider`)
- Refactors: wrap Se/Enquanto/Para/bloco, Inicio→braces, `\`→`+`
- Camadas `domain/` / `application/` / `adapters/vscode/` (ADR-005)

### Relacionado

- Package `@lsp-workbench/analyzer` **0.2.0** (Opção 2)
- Package `lsp-language-server` **0.1.0** (Opção 3 foundation; `lsp.server.enabled` default false)
- i18n removido (fora de escopo)

## Unreleased

### Adicionado (PDR-010 — escopo implícito de relatório)

- Auto-escopo de símbolos sob `relatorio.json` + `Definicao`/`Secoes` (isola irmãos)
- Comandos: **Importar Contexto de…** / **Exportar Contexto para…** (pasta, arquivo ou `lsp.contexts`)
- Status bar / **Mostrar Escopo do Relatório**

### Adicionado (PDR-009 — catálogo base + overlay)

- Starter público: `catalog.example.json` + SQL R996/R998 (sem dump completo no git)
- `catalog.json` local gitignored; scripts `catalog-from-r996-tsv.mjs` / `export-banco-senior-base.mjs`
- `build-local-catalog.mjs` mescla base local + overlay `docs/banco-senior/`
- Resolução de catálogo: overlay `.generated` → base `.generated` → base `catalog.json`

### Adicionado (PDR-008 — projeto de relatório)

- Comandos: `lspWorkbench.gerarRelatorio`, `copiarRegraRelatorio`, `exportarRelatorioMultiTrecho`
- Diagnostics **GER001–GER004** (contexto Pré-Seleção / seções)
- Completion de colunas via `tabelaBase` + catálogo local (`E012FAM.`)
- Scaffold via comando / `/gerar-relatorio` (Agent); testes GER* em temp + smoke-ger*

### Corrigido

- SYN009: QF Ctrl+Espaço via comando dedicado (`applySyn009`) — evita sumir no suggest com literal longo; range do alerta no literal; CRLF no fixer
- SEM001 + SYN009 na mesma linha: ambos via `command` (mesmo mecanismo no suggest)

### Documentação

- Status produto alinhado a 0.2.0 / analyzer 0.3.0 / LS 0.2.0
- PDR-006 (Agent ↔ analyzer)
- Removida matriz competitiva / referências a extensões de terceiros

### Adicionado (analyzer 0.3 / LS 0.2)

- Lint unificado em `@lsp-workbench/analyzer` (`analyzeLsp`)
- LS Worker com paridade de diagnostics
- Debounce in-process; refactors Inicio/`\` só no range com efeito
- ANL004 (Inicio/Fim), ANL012 (Se sem parens)

### Adicionado (PDR-006 / catálogo local)

- CLI `scripts/analyze-lsp.mjs` para Agent validar ANL*
- Setting de path de catálogo JSON local + completion de tabelas (no-op se ausente)
- Fallback in-process se o Language Server falhar ao iniciar

### Adicionado (PDR-005 — Opção 2)

- Integração com `@lsp-workbench/analyzer` 0.2.0: merge de diagnósticos `ANL*` (AST) em `analyzeLsp`, sem duplicar `RUL007`/`SYN008`
- Analyzer: lexer com comentários `@…@` e blocos, parser/AST, `ANL010`/`ANL011`, `format`, `ignoreIds`

## 0.1.3 — 2026-09-18

### Adicionado (PDR-003)

- Índice de símbolos, escopos, contextos, FUN007–009, import QF
- Allowlist `files` união; ignoreIds por contexto; refresh peers

## 0.1.0 — baseline

- Language id `senior-lsp`, TextMate, snippets, format, diagnostics iniciais
