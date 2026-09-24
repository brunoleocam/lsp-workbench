# Changelog — LSP Workbench (extensão)

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
