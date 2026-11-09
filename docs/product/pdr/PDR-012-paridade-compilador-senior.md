# PDR-012 — Paridade com o compilador Senior

| Campo | Valor |
|-------|-------|
| Status | Aceito — decisões do usuário registradas (2026-11-06) |
| Data | 2026-11-06 |
| Branch | `feat/paridade-compilador-senior` |
| Relacionados | [PDR-005](PDR-005-compiler-e-language-server.md), [PDR-007](PDR-007-catalogo-local-bridge.md), [PDR-009](PDR-009-catalogo-base-overlay.md), [ADR-005](../adr/ADR-005-clean-architecture-nucleo-puro.md), [ADR-008](../adr/ADR-008-aceitar-inicio-fim-e-retorna.md), [ADR-009](../adr/ADR-009-catalogo-funcoes-proprietario-demobile.md), [regras-estaticas-lsp.md](../regras-estaticas-lsp.md) |

## Problema

Comparamos a LSP Workbench com uma extensão interna (`senior-lsp`, publisher `demobile`, Python + JS) que reproduz o compilador Senior com mais fidelidade. Os dados dela (palavras reservadas, mensagens, funções, dicionário) foram extraídos dos binários do Senior e são **fonte de verdade mais confiável que a nossa doc** (D1). Ela pega erros que nós deixamos passar e que só aparecem quando o usuário cola a regra no Sapiens:

- chamada de função inexistente, com número de argumentos errado ou com tipo errado;
- argumento de saída (`End`) recebendo expressão ou campo de cursor;
- `Enquanto (Cur.Achou)` sem `Cur.Proximo()` (loop infinito);
- mistura de Alfa e Numero em atribuição, comparação e operadores;
- `TABELA.CAMPO` com campo inexistente, `cursor.CAMPO` fora do SELECT.

Ela também abre o `.LSP` **binário** do Senior direto no editor, e nós não.

Ao mesmo tempo, temos regras que **contradizem** o compilador real: tratamos `Inicio`/`Fim` e qualquer `Retorna` como inválidos, mas o compilador Senior tem `INICIO`, `FIM` e `RETORNA` entre as palavras reservadas e trata `Retorna(...)` como embutido ([ADR-008](../adr/ADR-008-aceitar-inicio-fim-e-retorna.md)).

## Resultado esperado

Quem edita uma regra no VS Code/Cursor vê, antes de colar no Senior, os mesmos erros — **com o mesmo texto de mensagem** — que o compilador Senior mostraria (nos casos cobertos abaixo), com F9 / salvar / barra de status, e consegue abrir e salvar `.LSP` binário sem tocar no original. Nada de Python como dependência, nada de código copiado da `senior-lsp` e nada de dado proprietário no repo público.

## Requisitos (EARS)

### Geral

- **REQ-004** — WHEN um diagnóstico deste PDR tem equivalente no compilador Senior THE SYSTEM SHALL usar o texto da mensagem do compilador (de `compilador_senior.json` / `lsp_compilador.py` / `lsp_check.py` da `senior-lsp`), com os `%s` preenchidos, prefixado pelo ID da regra.

### Revogação / ajuste (etapa 0)

- **REQ-001** — WHEN o documento contém blocos `Inicio` … `Fim;` THE SYSTEM SHALL tratá-los como equivalentes a `{` … `}` (balanceamento, escopo, formatação) sem emitir diagnóstico de estilo.
- **REQ-002** — WHEN o documento contém `Retorna(<valor>)` ou `Retorna()` THE SYSTEM SHALL tratá-lo como comando embutido (aridade 0–1) sem diagnóstico; `Retorna` como 1º argumento de `Mensagem` é constante válida.
- **REQ-005** — IF o documento contém `Retorna;` ou `Retorne;` sem parênteses THEN THE SYSTEM SHALL emitir erro (RUL007 / ANL010) com a mensagem "falta valor, expressão ou comando".
- **REQ-003** — IF o documento contém `FimSe` ou `FimEnquanto` THEN THE SYSTEM SHALL emitir erro (não são palavras reservadas do compilador Senior).

### UX de compilação (etapa 1)

- **REQ-010** — WHEN o usuário pressiona F9 num documento `senior-lsp` THE SYSTEM SHALL validar o documento inteiro e mostrar o resultado (contagem de erros/avisos) numa notificação curta.
- **REQ-011** — WHERE `lsp.compileOnSave` está ativo (padrão `true`, configurável) WHEN o documento é salvo THE SYSTEM SHALL revalidar sem debounce.
- **REQ-012** — WHILE um documento `senior-lsp` está ativo THE SYSTEM SHALL mostrar na status bar a contagem de erros e avisos dele; clicar abre o painel Problemas.

### Laços de cursor (etapa 2)

- **REQ-020** — IF um `Enquanto` tem condição `X.Achou` e o corpo não chama `X.Proximo()` THEN THE SYSTEM SHALL emitir erro no `Enquanto`.
- **REQ-021** — IF um `Continue` dentro de `Enquanto (X.Achou)` não é precedido, no mesmo bloco, por `X.Proximo()` THEN THE SYSTEM SHALL emitir erro no `Continue`.

### Catálogo de funções (etapa 3)

- **REQ-030** — Cada parâmetro de função no catálogo SHALL ter tipo normalizado (`Alfa`, `Numero`, `Data`, `Lista`, `Cursor`, desconhecido) e flag de saída (`End`).
- **REQ-031** — Uma função SHALL poder ter variantes (sobrecargas) com listas de parâmetros diferentes.
- **REQ-032** — WHEN existe catálogo de funções extra ([ADR-009](../adr/ADR-009-catalogo-funcoes-proprietario-demobile.md)) THE SYSTEM SHALL mesclá-lo ao catálogo embutido: **assinatura, params, tipos, `End` e variantes do extra vencem**; nossa doc só complementa descrição, exemplos e links; funções só nossas continuam; funções só do extra entram sem documentação.
- **REQ-033** — IF nenhum catálogo extra existe THEN THE SYSTEM SHALL funcionar como hoje, inferindo `End` do texto `Numero End x` / `Alfa End x` da assinatura documentada.
- **REQ-034** — THE SYSTEM SHALL descobrir o catálogo extra por `lsp.functions.path` ou pela chave `"lspWorkbench": { "functionsCatalog": "<caminho relativo>" }` no `package.json` de qualquer extensão instalada.

### Checagem de chamada (etapa 4)

- **REQ-040** — IF uma chamada usa nome que não é função do catálogo, função declarada no escopo, comando embutido nem método conhecido THEN THE SYSTEM SHALL emitir "Falta declaração do "Label/Função" = "X"" — **erro** com catálogo extra carregado, **aviso** sem ele.
- **REQ-041** — IF o número de argumentos não bate com nenhuma variante (ou com a faixa do embutido) THEN THE SYSTEM SHALL emitir "Faltam parâmetros na chamada da função "X"" / "Muitos parâmetros na chamada da função "X"".
- **REQ-042** — IF o tipo do argumento é conhecido e incompatível com o parâmetro da variante escolhida (Alfa × Numero; Data conta como Numero) THEN THE SYSTEM SHALL emitir erro.
- **REQ-043** — IF o parâmetro é de saída e o argumento não é variável nem `Tabela.Campo` THEN THE SYSTEM SHALL emitir erro; se for campo de cursor, erro específico.

### Tipos (etapa 5)

- **REQ-050** — THE SYSTEM SHALL inferir o tipo de cada expressão: `Definir` explícito; variável sem `Definir` = Numero implícito; `Data` = Numero; `Tabela.Campo` pelo catálogo de banco; campo de cursor = desconhecido; literal `"…"` = Alfa; literal `'X'` = compatível com ambos; número = Numero.
- **REQ-051** — IF uma atribuição, comparação ou operação aritmética (`+ - * /`, `-` unário) mistura Alfa e Numero (tipos conhecidos) THEN THE SYSTEM SHALL emitir "tipos incompatíveis: ALFA e NUMERO". `+` entre dois Alfa é permitido.
- **REQ-052** — IF a condição de `Se`/`Enquanto` é um Alfa isolado THEN THE SYSTEM SHALL emitir erro.

### Dicionário (etapa 6)

- **REQ-060** — WHEN há catálogo de banco e o código usa `TABELA.CAMPO` com tabela conhecida THE SYSTEM SHALL emitir erro se o campo não existe nela.
- **REQ-061** — WHEN um cursor tem `.SQL` com SELECT de colunas explícitas THE SYSTEM SHALL validar `cursor.CAMPO` contra essas colunas ("Campo X não foi encontrado no SELECT do cursor") e acusar coluna repetida no SELECT. `SELECT *` desliga a checagem.
- **REQ-062** — IF o código atribui valor a `cursor.CAMPO` THEN THE SYSTEM SHALL emitir "não é possível atribuir valores a campos de cursores."
- **REQ-063** — IF `X.AbrirCursor()` ocorre sem `X.SQL` antes no fluxo THEN THE SYSTEM SHALL emitir "Cursor X está sem comando SQL".
- **REQ-064** — IF o SQL do cursor usa `:param` sem variável correspondente definida THEN THE SYSTEM SHALL emitir aviso.
- **REQ-065** — WHEN o usuário aciona "Dicionário de dados" (Ctrl+Alt+D ou botão no título do editor) THE SYSTEM SHALL abrir QuickPick de tabelas (nome + descrição), depois de campos (nome, tipo, tamanho, descrição) e inserir `TABELA.CAMPO` no cursor.
- **REQ-066** — (repo demobile) O `catalog/catalog.json` da extensão demobile SHALL incluir as tabelas e campos do `dicionario.json` extraído (77 tabelas e 478 campos a mais), gerado por script reproduzível; em conflito, o `catalog.json` atual vence (enums, PK).

### `.LSP` binário (etapa 7)

- **REQ-070** — WHERE `lsp.binary.autoOpen` está ativo (padrão `true`, configurável) WHEN o usuário abre pelo Explorer um arquivo `.lsp`/`.LSP` cuja estrutura em `0x6A` é válida (sete valores Delphi com tipos `i s m b b i s`) THE SYSTEM SHALL abri-lo como texto decodificado (fonte XOR `CHAVE & 0xFF`, Windows-1252, CRLF) num esquema próprio; arquivos `.lsp` texto continuam abrindo como hoje. Com a opção desligada, o mesmo fica disponível por comando.
- **REQ-071** — WHEN o usuário salva o documento binário THE SYSTEM SHALL gravar uma **cópia ao lado do original** com sufixo `.editado` antes da extensão (`SARG008.LSP` → `SARG008.editado.LSP`), nunca o original, reescrevendo tag+tamanho da fonte (troca `06`→`0C` se > 255 bytes), mantendo intactos os demais bytes, e conferindo relendo a cópia.
- **REQ-072** — IF o texto contém caractere fora do Windows-1252 THEN THE SYSTEM SHALL recusar o salvamento indicando caractere e linha.
- **REQ-073** — WHILE o documento binário está aberto THE SYSTEM SHALL aplicar a mesma validação/completion de um `.lsp` texto.
- **REQ-074** — WHEN o usuário abre um original que já tem cópia `.editado` ao lado THE SYSTEM SHALL abrir o conteúdo da cópia e avisar ("Abrindo a cópia editada SARG008.editado.LSP; o original não foi alterado").

### Gerar `.LSP` a partir de texto (etapa 8)

Paridade com o comando "Gerar .LSP para o Senior" da `senior-lsp` 1.0.2.

- **REQ-080** — WHEN o usuário executa "LSP: Gerar .LSP para o Senior" num documento `senior-lsp` `file:` que não é `.LSP` binário THE SYSTEM SHALL pedir o título (padrão: nome do arquivo sem extensão), abrir o diálogo "Salvar como" já apontando para `<pasta>\<NOME>.senior.LSP` e gravar ali um `.LSP` binário novo com o texto atual do editor.
- **REQ-081** — O `.LSP` gerado SHALL ter: cabeçalho `01 03 00 00 00 07 00 00 00`, título Windows-1252 em `0x0A` (tamanho em `0x09`, até 70 bytes), `0x10` em `0x51` e identificador novo (GUID versão 4) em `0x52`; em `0x6A`, os sete valores `i s m b b i s` com senha vazia, depurar e SQL Senior 2 desligados, CHAVE nova (1–127) e a fonte (XOR, CRLF, `06` até 255 bytes e `0C` acima); depois, o bloco de histórico vazio. O arquivo é relido e conferido após gravar.
- **REQ-082** — IF a regra tem erro de compilação THEN THE SYSTEM SHALL perguntar em modal "A regra tem N erro(s) de compilação. Gerar o .LSP mesmo assim?" e só gerar com confirmação.
- **REQ-083** — IF o título está vazio, passa de 70 bytes ou tem caractere fora do Windows-1252 THEN THE SYSTEM SHALL recusar no próprio campo do título; IF o texto tem caractere fora do Windows-1252 THEN recusa como no REQ-072. IF o documento já é `.LSP` binário (esquema `lsp-binario` ou `file:` binário) THEN avisa que ele já está no formato do Senior e que Ctrl+S grava a cópia `.editado`.
- **REQ-084** — Arquivos `.lsptxt` SHALL abrir com a linguagem `senior-lsp`.

## Critérios de aceite

| ID | Requisitos | Critério (Given / When / Then) |
|----|------------|--------------------------------|
| AC-004 | REQ-004 | Para cada ID novo da tabela "Novos IDs", teste confere que a mensagem do diagnóstico contém o texto do compilador (com `%s` preenchido). |
| AC-001 | REQ-001 | Dado `Se (a > 0) Inicio x = 1; Fim;`, quando analisado, então não há SYN004/ANL004 nem ANL001/ANL002, e `Inicio` sem `Fim` dá ANL001. |
| AC-002 | REQ-002 | Dado `Retorna(vn);`, `Retorna();` e `Mensagem(Retorna, "x");`, quando analisado, então não há RUL007/ANL010/FUN011; `Retorna(a, b);` → FUN011; `Retorna` aparece no completion. |
| AC-005 | REQ-005 | Dado `Retorna;` ou `Retorne;`, então há RUL007 (lint) e ANL010 (analyzer, deduplicado no merge) com mensagem "falta valor, expressão ou comando". |
| AC-003 | REQ-003 | Dado `FimSe;`, então há SYN016 (erro). |
| AC-010 | REQ-010 | F9 com documento ativo executa `lsp.compileDocument`; teste de unidade do formatador de resumo ("2 erros, 1 aviso"). |
| AC-011 | REQ-011 | Sem configuração, `lsp.compileOnSave` vale `true` e salvar dispara a validação imediata; com `false`, não (teste do handler com fake de `onDidSaveTextDocument`). |
| AC-012 | REQ-012 | Status bar mostra `$(error) 2 $(warning) 1` e esconde fora de `senior-lsp` (teste da função de texto + checklist EVAL). |
| AC-020 | REQ-020 | `Enquanto (C.Achou) { x = 1; }` → SEM005; com `C.Proximo();` no corpo → nada. |
| AC-021 | REQ-021 | `Enquanto (C.Achou) { Se (x) { Continue; } C.Proximo(); }` → SEM006 no `Continue`; com `C.Proximo();` antes do `Continue` → nada. |
| AC-030 | REQ-030, REQ-033 | Sem catálogo extra, `Potencia` tem 3º param `out: true`, tipo `Numero` (inferido da doc). |
| AC-031 | REQ-031, REQ-032 | Fixture sintética: função presente nos dois com params divergentes → entrada final tem params/tipos/`out`/variantes **do extra** e `documentation` (descrição, exemplos, links) nossa com o bloco de assinatura trocado pela assinatura do extra; função só nossa permanece igual; função só do extra entra com `origin: "extra"`. |
| AC-032 | REQ-034 | Fake de `vscode.extensions.all` com uma extensão declarando `lspWorkbench.functionsCatalog` → path resolvido; `lsp.functions.path` tem precedência; nenhuma fonte → `undefined`. |
| AC-040 | REQ-040 | `FuncaoQueNaoExiste(1);` → FUN010 com severidade erro quando há catálogo extra e aviso quando não há; função de `Definir Funcao` local, embutido ou método de cursor/lista → nada. |
| AC-041 | REQ-041 | `Cancel(1, 2);` → FUN011 (faixa 0–1); `IntParaAlfa(vn);` → FUN011 (faltam) com catálogo extra (D9). |
| AC-042 | REQ-042 | `IntParaAlfa(vaTexto, vaSaida);` com `Definir Alfa vaTexto` → FUN012 com catálogo extra (D9). `'X'` passa nos dois tipos. |
| AC-043 | REQ-043 | `IntParaAlfa(vn, vaA + vaB);` → FUN013; `IntParaAlfa(vn, Cur.Campo);` → FUN014; `IntParaAlfa(vn, E075PRO.DESPRO);` → nada. |
| AC-050 | REQ-050, REQ-051 | `Definir Alfa va; va = 1;` → TYP001; `Se (va = 1)` → TYP002; `va = va + "x";` → nada; `vn = va * 2;` → TYP002. |
| AC-052 | REQ-052 | `Se (va)` com `va` Alfa → TYP003. |
| AC-060 | REQ-060 | Com catálogo fixture `E075PRO{CODPRO,DESPRO}`, `E075PRO.XYZ` → DEM002; sem catálogo → nada. |
| AC-061 | REQ-061 | `C.SQL "SELECT CODPRO FROM E075PRO"; … C.DESPRO` → SQL012; `SELECT CODPRO, CODPRO` → SQL013; `SELECT *` → nada. |
| AC-062 | REQ-062 | `C.CODPRO = 1;` → SEM007. |
| AC-063 | REQ-063 | `C.AbrirCursor();` sem `C.SQL` antes → SQL014. |
| AC-064 | REQ-064 | `WHERE CODEMP = :vnEmp` sem `vnEmp` definido nem usado em outro ponto da regra → SQL015 (aviso). |
| AC-065 | REQ-065 | Teste das funções puras de filtro/itens do QuickPick (tabela por nome e descrição; texto inserido `TABELA.CAMPO`); comando + keybinding no `package.json`. |
| AC-066 | REQ-066 | (repo demobile) Rodar o script duas vezes gera o mesmo `catalog.json` (idempotente); tabela só do `dicionario.json` aparece com campos, tipo e tamanho; campo presente nos dois mantém enum/PK/descrição do `catalog.json` atual; relatório do script lista +77 tabelas e +478 campos. |
| AC-070 | REQ-070 | Codec: buffer sintético (gerado no teste) com chave 0x5A decodifica para o texto esperado; arquivo texto `.lsp` → `isSeniorBinaryRule = false`; com `lsp.binary.autoOpen=false` o redirecionamento não ocorre. |
| AC-071 | REQ-071 | Round-trip byte a byte: `encode(decode(buf), buf)` = `buf` em fixtures sintéticas (fonte ≤ 255 e > 255, tag 06 e 0C); fonte que cresce de 200→300 bytes troca 06→0C; bytes fora da fonte idênticos. Salvar `X.LSP` grava `X.editado.LSP` na mesma pasta e o original fica byte a byte igual. Teste opcional sobre pasta real via `LSP_BINARY_RULES_DIR` (pulado se ausente; rodado no repo demobile). |
| AC-072 | REQ-072 | Texto com `€` passa (existe no CP1252); com `→` lança erro citando a linha. |
| AC-073 | REQ-073 | Documento no esquema binário recebe diagnósticos (EVAL manual). |
| AC-074 | REQ-074 | Com `X.editado.LSP` presente, abrir `X.LSP` mostra o texto da cópia e emite o aviso; sem cópia, mostra o original (teste do resolvedor de caminho puro). |
| AC-080 | REQ-080 | Caminho padrão puro: `C:\r\minha-regra.lsp` → `C:\r\MINHA-REGRA.senior.LSP` (também de `.lspt`/`.lsptxt`); comando contribuído no título do editor e na paleta só para `senior-lsp` em `file:` (teste do `package.json`); fluxo completo no EVAL manual. |
| AC-081 | REQ-081 | Com título, GUID e chave fixos no teste: `isSeniorBinaryRule` = true; decodifica para o texto em CRLF; título em `0x0A`, `0x10` em `0x51`, GUID com bits de versão 4 em `0x52`, chave no 6º valor, depurar/SQL2 = `08`; fonte ≤ 255 usa `06` e > 255 usa `0C`; final igual ao bloco de histórico vazio; `encode(decode(buf), buf)` = `buf`. |
| AC-082 | REQ-082 | EVAL manual: com erro, o modal aparece e "Cancelar" não grava. |
| AC-083 | REQ-083 | Validação pura do título: vazio, 71 bytes e `→` recusados; `Ação €` aceito; criar com título inválido lança erro; texto com `→` lança erro citando a linha. |
| AC-084 | REQ-084 | `package.json` declara `.lsptxt` na linguagem `senior-lsp`. |

Comandos de teste: `npm test` em `packages/lsp-analyzer` e `packages/lsp-workbench` (`node --test out/test/*.test.js`). No repo demobile, o script de merge do dicionário tem teste próprio (AC-066).

## IDs de regra

Seguem as famílias de [regras-estaticas-lsp.md](../regras-estaticas-lsp.md). `TYP` é família nova: `SEM008` e `SEM010` aparecem no mapa de IDs antigos com outro significado e reaproveitá-los confundiria. Mensagens = texto do compilador Senior (REQ-004).

### Novos

| ID | Sev. | Regra | Mensagem (compilador Senior) |
|----|------|-------|------------------------------|
| SYN016 | erro | `FimSe` / `FimEnquanto` não existem | "falta valor, expressão ou comando" |
| SEM005 | erro | `Enquanto (X.Achou)` sem `X.Proximo()` no corpo | "Laço em %s.Achou sem %s.Proximo(): loop infinito." (`lsp_check.py`) |
| SEM006 | erro | `Continue` sem `X.Proximo()` antes no bloco | "'Continue' sem %s.Proximo() antes dele: volta ao mesmo registro e trava (loop infinito). Use %s.Proximo(); antes ou troque por 'Pare;'." (`lsp_check.py`) |
| SEM007 | erro | Atribuição a campo de cursor | "não é possível atribuir valores a campos de cursores." |
| FUN010 | erro / aviso* | Função/label não declarado | "Falta declaração do "Label/Função" = "%s"" |
| FUN011 | erro | Nº de argumentos (variantes / faixa do embutido) | "Faltam parâmetros na chamada da função "%s"" / "Muitos parâmetros na chamada da função "%s"" |
| FUN012 | erro | Tipo do argumento incompatível | "valor "%s" (%s) para o parâmetro "%s" (%s) são incompatíveis" |
| FUN013 | erro | Argumento de saída não é variável nem `Tabela.Campo` | "valor "%s" (%s) para o parâmetro "%s" (%s) não pode ser uma expressão" / "… não pode ser constante" |
| FUN014 | erro | Argumento de saída é campo de cursor | "valor "%s" (%s) para o parâmetro "%s" (%s) não pode ser campo de cursor" |
| TYP001 | erro | Atribuição Alfa × Numero | "tipos incompatíveis: ALFA e NUMERO" (ou "NUMERO e ALFA", conforme a ordem) |
| TYP002 | erro | Comparação / operador aritmético com Alfa | "Variáveis alfanuméricas ou operadores não compatíveis %s" |
| TYP003 | erro | Condição Alfa em `Se`/`Enquanto` | idem |
| DEM002 | erro | Campo inexistente em `TABELA.CAMPO` (catálogo) | "Campo %s não foi encontrado" |
| DEM003 | aviso | Coluna do SELECT inexistente na tabela do FROM (catálogo) | "Campo %s não foi encontrado na tabela %s (SELECT do cursor %s)" (`lsp_compilador.py`) |
| SQL012 | erro | `cursor.CAMPO` fora do SELECT | "Campo %s não foi encontrado no SELECT do cursor %s" (`lsp_compilador.py`) |
| SQL013 | aviso** | Coluna repetida no SELECT do cursor | "Campo de nome "%s" está sendo selecionado repetidamente no cursor "%s"." |
| SQL014 | erro | `.AbrirCursor` sem `.SQL` | "Cursor %s está sem comando SQL" |
| SQL015 | aviso | `:param` no SQL sem variável | "comando SQL definido incorretamente: identificador "%s" não foi declarado ou utilizado na regra. …" |

\* FUN010: erro com catálogo extra carregado; aviso sem ele (D3).

\*\* SQL013: proposto como erro; virou aviso na etapa 6b pela medição em 674 regras reais (5 regras em produção com coluna repetida, ex.: `E440IPC.CODPRO` duas vezes no mesmo SELECT). A `cursor-senior-lsp` também emite aviso. Confirmado pelo usuário em 2026-11-06 (D11).

O implementador copia o texto exato de `compilador_senior.json` / `lsp_compilador.py` para uma tabela de mensagens no analyzer (dados, não código) e referencia por ID.

### Revogados e restringidos ([ADR-008](../adr/ADR-008-aceitar-inicio-fim-e-retorna.md))

- **Revogados:** SYN004 e ANL004 (`Inicio`/`Fim`). IDs não reutilizados; ficam marcados "revogado".
- **Restringidos (mesmo ID, escopo menor):** RUL007 e ANL010 passam a valer só para `Retorna;` / `Retorne;` sem parênteses. `Retorna(...)` e `Mensagem(Retorna, …)` deixam de acusar. O quick fix "→ `Cancel(1);`" continua disponível para essa forma.

## Etapas

Ordem por dependência e valor. Cada etapa é um PR pequeno, com teste que a prova.

| # | Etapa | Depende | Pacotes | Repo demobile | Prova |
|---|-------|---------|---------|---------------|-------|
| 0 | `Inicio`/`Fim` como chaves; revogar SYN004/ANL004; restringir RUL007/ANL010 a `Retorna;`/`Retorne;`; `Retorna` embutido (0–1) e constante; criar SYN016; tabela de mensagens do compilador; rules/skills/docs (lista no ADR-008) | — | analyzer, workbench, agent, `.cursor`, `docs/lsp` | não | AC-001..005, AC-004 (parcial); atualizar `analyzer.test.ts`, `rules-expanded.test.ts`, `completion.test.ts`, `quick-fixes.test.ts`, `formatter-diagnostics.test.ts`, fixtures `smoke-*` + `MANIFEST.json` |
| 1 | UX: comando `lsp.compileDocument` + F9, `lsp.compileOnSave` (padrão `true`), status bar de erros/avisos | — | workbench | não | AC-010..012 |
| 2 | Laços `Achou`/`Proximo`/`Continue` (SEM005, SEM006) | 0 (blocos `Inicio`/`Fim`) | analyzer | não | AC-020, AC-021 |
| 3 | Tipos `out`/`variants`/`origin`; inferência de `End` pela doc; contrato, descoberta (`lsp.functions.path` + chave `lspWorkbench` em `package.json`) e merge do catálogo extra com precedência do extra (ADR-009); passar catálogo ao analyzer e ao language server | — | analyzer, workbench | sim: empacotar `functions/functions.json` e declarar `lspWorkbench.functionsCatalog` | AC-030..032 |
| 4 | Checagem de chamada genérica (FUN010..FUN014), tabela de embutidos com aridade | 3 | analyzer | não | AC-040..043 |
| 5 | Inferência de tipos (TYP001..TYP003) | 3, 4 (reusa tipos de params) | analyzer, workbench (passa tipos de campo do catálogo de banco ao analyzer) | não | AC-050, AC-052 |
| 6a | QuickPick "Dicionário de dados" (Ctrl+Alt+D + botão `editor/title`) | — | workbench | não | AC-065 |
| 6b | Dicionário: DEM002, DEM003, SQL012..SQL015, SEM007 | 5 (tipo de `Tabela.Campo`) | analyzer, workbench | não | AC-060..064 |
| 6c | Script reproduzível de merge `dicionario.json` → `catalog/catalog.json` da demobile (nosso vence em conflito) | — | — | **sim (só demobile)** | AC-066 |
| 7 | `.LSP` binário: codec puro + FileSystemProvider + detecção binário × texto + abrir automático (configurável) + cópia `.editado` ao lado + reabrir cópia | 1 (status/validação) | workbench (domínio puro + adapter vscode) | sim: teste de round-trip com regras reais | AC-070..074 |
| 8 | Gerar `.LSP` binário novo a partir de texto (título, GUID, chave, histórico vazio) + `.lsptxt` | 7 (codec) | workbench (domínio puro + adapter vscode) | não | AC-080..084 |

Ajustes em relação à ordem sugerida, e por quê:

- **6 dividida em 6a/6b/6c.** O QuickPick não depende de nada e usa o catálogo que já existe; pode entrar logo após a etapa 1. As validações (6b) dependem da inferência de tipos. O merge do dicionário (6c) é só no repo demobile e pode correr em paralelo a qualquer momento; melhora 6a e 6b quando chegar.
- **Etapa 5 depois da 4.** A checagem de chamada já precisa do "tipo do argumento"; a etapa 4 cria o inferidor mínimo (literal, `Definir`, prefixo) e a 5 o generaliza para expressões. Evita dois inferidores.
- **Etapa 7 por último, mas independente.** É a de maior risco (formato binário, FS provider, conflito com `.lsp` texto) e não bloqueia nada; pode correr em paralelo depois da 1.
- **Etapa 3 entrega valor sem o repo demobile.** A inferência de `End` pelo texto da doc já alimenta FUN013/FUN014 para quem não tem o catálogo extra.

### Detalhes técnicos por etapa (para o implementador)

- **0** — `parser.ts` passa a reconhecer `Inicio` como abre-bloco e `Fim` como fecha-bloco; `Retorna(` vira chamada embutida; `Retorna;`/`Retorne;` continua nó próprio que gera ANL010. `semantic.ts` remove ANL004 e restringe ANL010. `diagnostics.ts` remove SYN004, restringe o regex de RUL007 a `\bRetorn[ae]\s*;` (sem parênteses, fora de `Mensagem(`) e mantém a deduplicação RUL007×ANL010; remove `hasSyn004`. `rule-catalog.ts`, `quick-fixes.ts`, `code-actions.ts`, `completion.ts` perdem o fix SYN004. A conversão `Inicio`/`Fim` → `{ }` continua como **refactor** (`/refatorar-lsp`, `refactors.ts`, `scripts/refactor-lsp.mjs`). Grammar (`lsp.tmLanguage.json` + `scripts/generate-tmgrammar.mjs`): tirar `FimSe`/`FimEnquanto` de `keyword.control`. Criar a tabela de mensagens do compilador (arquivo de dados no analyzer) já nesta etapa, usada por SYN016/RUL007 e pelas próximas.
- **1** — Comando `lsp.compileDocument` reaproveita o pipeline de `diagnostics.ts` (já roda ao digitar com debounce de 200 ms). Keybinding `f9` com `when: editorLangId == senior-lsp`. Status bar separada do item de escopo atual (`context-commands.ts`).
- **2** — No analyzer, sobre a AST: para cada `Enquanto` cuja condição é `Ident.Achou` (case-insensitive), procurar `Ident.Proximo` em qualquer profundidade do corpo; para cada `Continue`, olhar os stmts anteriores no mesmo bloco e nos blocos ancestrais até o `Enquanto`.
- **3** — `LspFunctionParam.out?: boolean`; `LspFunctionEntry.variants?: LspFunctionParam[][]`; `LspFunctionEntry.origin?: "docs" | "extra" | "merged"`. Merge puro no analyzer (`mergeFunctionCatalog(base, extra)`); descoberta e leitura de arquivo no workbench. Analyzer recebe o catálogo por opção de `analyzeLsp` (hoje usa o singleton `LSP_FUNCTION_CATALOG`).
- **4** — Embutidos e aridades (minúsculas): `mensagem 1–99`, `execsql 1`, `execsqlex 2–99`, `cancel 0–1`, `cancelar 0–1`, `regra 1`, `abrir 2–3`, `fechar 1`, `ler 2–3`, `lernl 2`, `gravar 2`, `gravarnl 2`, `gravarnleol 2`, `iniciartransacao`/`finalizartransacao`/`desfazertransacao 0`, `execprog 1–99`, `habilitacampo`/`desabilitacampo 1–99`, `habilitatodos`/`desabilitatodos 0`, `vaparacampo 1–2`, `vaparapagina 1`, `habilitabotao`/`desabilitabotao 1–99`, `chamafuncao 1–99`, `atualizacampos 0`, `escondecampo 1–99`, `formatar 1–99`, `retorna 0–1`. Métodos de cursor/lista não passam por FUN010. RUL019 (`Cancel` só 1/2/3) continua valendo por cima da aridade. Constantes válidas como argumento: `erro, retorna, refaz, ler, gravar, lergravar, lernl, gravarnl, anexar, lergravarnl, gravarnleol, binario, texto, verdadeiro, falso, nulo, sim, nao, alterar, inserir, excluir, true, false`.
- **5** — Mapear `LocalCatalogColumn.type` para `Alfa`/`Numero` (string → Alfa; number/date/time → Numero; no `dicionario.json` os tipos físicos são `TRtPhyString`, `TRtPhyNumber`, `TRtPhyDate`…). Tipo desconhecido nunca gera erro.
- **6b** — Checador por tokens (`lint/dictionary-check.ts`); o workbench passa `catalogTableColumns` (tabela → campos). Cursor = `Definir Cursor` do próprio arquivo. O SELECT só é lido quando `.SQL` recebe literais (`"…"` ou `"…" + "…"`, com `\` de continuação); SQL por variável, `SELECT *` ou expressão sem apelido desligam SQL012 para aquele cursor. SQL012 compara com a **união** das colunas de todos os `.SQL` do cursor no arquivo (o mesmo cursor recebe SQL diferente em `Se`/`Senao` ou em funções). SQL014 olha só o texto antes do `AbrirCursor`. SQL015 aceita o nome se ele aparece em qualquer ponto do código fora de strings. DEM003 só infere a tabela de coluna sem prefixo quando o FROM tem uma tabela só. Medição em 674 regras: 0 DEM002, 0 DEM003, 0 SQL012, 0 SQL014, 0 SEM007; 15 SQL013 (5 regras, colunas repetidas de verdade); 2 SQL015 (1 regra declara `vnCodFor` e usa `:vsCodFor`).
- **6c** — No repo demobile, script Node (sem Python) lê `dicionario.json` (`{ TABELA: { desc, campos: { CAMPO: [enum, tamanho, decimais, descrição, vType, tipoFísico] } } }`) e o `catalog/catalog.json` atual, acrescenta tabelas e campos ausentes, nunca sobrescreve campo existente, ordena chaves para saída estável e imprime o resumo (+tabelas, +campos). O `dicionario.json` fica só no repo demobile. Feito: `packages/lsp-workbench-demobile/scripts/merge-dicionario-catalog.mjs` (função pura + CLI, altera o arquivo no lugar ou grava em `--out`), chamado no fim do `build-demobile-catalog.mjs`; entrada em `docs/banco-senior/dicionario-dados/dicionario.json`. Tipos: `TRtPhyString` → `Alfa(n)`, `TRtPhyNumber` → `Número(p[,s])`, `TRtPhyDate` → `Data`, `TRtPhyTime` → `Hora`, imagem sem tipo. Tabelas novas vão no fim, ordenadas por nome; campos novos entram antes dos `USU_`. Resultado: +77 tabelas, +478 campos em tabelas existentes, +730 campos nas tabelas novas (3437 tabelas); três execuções dão o mesmo arquivo. Corpus de 674 regras sem diagnóstico novo.
- **7** — Codec puro em `packages/lsp-workbench/src/domain/` (sem `vscode`), reimplementado em TypeScript a partir da especificação do formato abaixo (sem copiar código da `senior-lsp`); FS provider e eventos em `src/adapters/vscode/`. URI do esquema aponta para o original; leitura usa `X.editado.LSP` se existir (REQ-074), senão o original; escrita sempre em `X.editado.LSP` e usa o original como modelo quando a cópia ainda não existe. Detecção lê bytes do disco (não o texto do documento). Analyzer e formatter ignoram documento `file:` binário (evita lixo de diagnóstico enquanto o redirecionamento acontece). Abrir `X.editado.LSP` diretamente também passa pelo esquema e grava nele mesmo. Feito: codec em `src/domain/senior-binary-rule.ts` (`isSeniorBinaryRule`, `readSeniorBinaryRule`, `decodeSeniorBinaryRule`, `encodeSeniorBinaryRule`, `encodeCp1252`) e caminhos em `src/domain/binary-rule-paths.ts` (`editedCopyPath`, `resolveBinaryRuleFile`, `editedCopyNotice`, `shouldOpenAsBinaryRule`); esquema `lsp-binario` em `src/adapters/vscode/binary-rule-fs.ts` e abertura em `binary-rule-open.ts`. A abertura automática observa as abas (`tabGroups.onDidChangeTabs`), porque o VS Code mostra o `.LSP` com bytes nulos como binário e não cria `TextDocument`; ativação também por `workspaceContains:**/*.lsp` e `onFileSystem:lsp-binario`. Windows-1252 usa tabela própria nos dois sentidos: o `TextDecoder("windows-1252")` do Node 22.18 decodifica 0x80–0x9F como Latin-1 (0x80 vira U+0080, não `€`). Com o language server ligado, o middleware `handleDiagnostics` descarta os diagnósticos do `file:` binário. Teste de regras reais: `LSP_BINARY_RULES_DIR` ou, sem a variável, `docs/senior/regras-binarias/` (local, fora do git); pulado se a pasta não existe. `SARG462.LSP` (chave 231, tag `0C`, 1435 bytes de fonte) volta byte a byte igual. Pendência: o índice de símbolos do workspace lê `.LSP` binários como UTF-8 e não extrai peers deles (como antes da etapa).
- **8** — Domínio em `src/domain/senior-binary-rule.ts`: `createSeniorBinaryRule({ title, source, guid, key })` monta cabeçalho + valores em `0x6A` com fonte vazia + histórico vazio e grava a fonte com `encodeSeniorBinaryRule` (mesma troca `06`/`0C` e conferência); `validateSeniorRuleTitle` (vazio, > 70, fora do Windows-1252); `newRuleGuid` aplica os bits de versão 4 no layout do TGUID (versão no byte 7, variante no byte 8). Caminho padrão em `binary-rule-paths.ts` (`seniorExportDefaultPath`). Comando `lsp.generateSeniorRule` em `src/adapters/vscode/generate-senior-rule.ts` (título → revalida → modal se houver erro → "Salvar como" → grava, relê, oferece "Abrir"/"Mostrar na pasta"); GUID e chave vêm de `node:crypto` no adapter. Recusa gravar sobre o próprio arquivo de texto. A validação final do formato é importar no Senior (EVAL manual).

### Formato `.LSP` binário (referência)

- Cabeçalho com título em `0x0A` (tamanho em `0x09`).
- Em `0x6A`, sete valores Delphi em sequência. Tags: `02`/`03`/`04` = int8/16/32 LE; `06` = shortstring (1 byte de tamanho); `0C` = string (int32 LE de tamanho); `08`/`09` = bool false/true; `00`/`01` = marcador de lista.
- Padrão esperado `i s m b b i s`: chave-senha, senha, lista, depurar, SQL Senior 2, **CHAVE**, **FONTE**.
- Fonte = bytes XOR (`CHAVE & 0xFF`), Windows-1252, quebras CRLF.
- O restante (histórico zlib) fica intacto.

## Fora de escopo

- Gerar ou compilar `.BIN` / executar a regra (gerar `.LSP` a partir de texto entrou na etapa 8, D12).
- Python como dependência de runtime ou de build; tudo em TypeScript no analyzer/extensão (e Node no script da demobile).
- Copiar código da `senior-lsp`.
- Versionar `funcoes.json` / `dicionario.json` (ou derivados) no repo público ([ADR-009](../adr/ADR-009-catalogo-funcoes-proprietario-demobile.md)).
- Editar o `.LSP` original no lugar.
- Histórico zlib do `.LSP` (ler, exibir ou atualizar).
- Paridade com mensagens de erro de runtime do Senior.

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Falso positivo em FUN010 sem catálogo extra (funções do Sapiens que não estão nas docs) | Aviso sem catálogo extra (D3); `lsp.ignoreIds` |
| Assinatura do catálogo extra diverge da nossa doc e o usuário estranha | Extra vence por decisão (D1); hover mostra a assinatura do extra e mantém nossa descrição |
| Falso positivo em TYP* por inferência errada | Tipo desconhecido nunca gera erro; campo de cursor = desconhecido; literal `'X'` compatível com ambos |
| Corromper `.LSP` ao salvar | Nunca grava no original; confere relendo; round-trip byte a byte nos testes |
| Usuário cola no Senior o original achando que é o editado | Aviso ao reabrir (REQ-074); sufixo `.editado` visível no Explorer |
| `.lsp` texto detectado como binário | Detecção exige os sete valores com padrão `ismbbis` em `0x6A`; arquivos texto falham na primeira tag |
| Dados proprietários vazarem para o público | Contrato só aponta para arquivo externo; `.gitignore` + checagem no CI (ADR-009) |
| Mudança muda o que o Agent gera | ADR-008 mantém `{ }` e `Cancel(1)` como padrão de **geração**; só deixa de acusar erro |

## Decisões

Respostas do usuário às perguntas abertas (2026-11-06).

- **D1 — Licença e fonte de verdade.** Reimplementar em TypeScript, sem copiar código da `senior-lsp`. Usar o texto das mensagens do compilador Senior nos diagnósticos (REQ-004). Os dados da `senior-lsp` são extraídos do Senior e valem mais que a nossa doc: no merge de funções, assinatura/params/tipos/`End`/variantes do extra vencem; nossa doc complementa descrição, exemplos e links; funções só nossas continuam (REQ-032, ADR-009).
- **D2 — `Retorna`.** `Retorna(x)` / `Retorna()` é embutido válido (aridade 0–1); `Retorna` é constante válida em `Mensagem(Retorna, …)`; `Retorna;` / `Retorne;` sem parênteses continuam erro, com os mesmos IDs RUL007/ANL010 em escopo reduzido e mensagem "falta valor, expressão ou comando" (REQ-002, REQ-005, ADR-008).
- **D3 — FUN010 sem catálogo extra:** aviso (REQ-040).
- **D4 — `.LSP` binário:** abre automaticamente ao clicar no Explorer; configurável por `lsp.binary.autoOpen` (padrão `true`) (REQ-070).
- **D5 — Cópias:** ao lado do original com sufixo `.editado` (`SARG008.editado.LSP`); nunca sobrescreve o original; reabrir o original abre a cópia se existir, com aviso (REQ-071, REQ-074). Não há pasta de cópias configurável.
- **D6 — Compilar ao salvar:** ligado por padrão; configurável por `lsp.compileOnSave` (REQ-011).
- **D7 — Descoberta do catálogo extra:** chave genérica `lspWorkbench.functionsCatalog` no `package.json` de qualquer extensão + setting `lsp.functions.path` (REQ-034, ADR-009).
- **D8 — Dicionário:** mesclar as 77 tabelas e 478 campos a mais do `dicionario.json` no `catalog.json` da demobile por script reproduzível; em conflito, o `catalog.json` atual vence (REQ-066, etapa 6c).
- **D9 — Etapa 4, pela medição em 674 regras reais (confirmada em 2026-11-06).** (a) Para função do catálogo, FUN011 e FUN012 só valem com assinatura do catálogo extra. Só com a doc pública deram 214 FUN011 falsos em 13 funções, e a doc traz tipo errado (ex.: `IntParaAlfa` com `Alfa` no 1º parâmetro). Com o extra, FUN011 deu 0. Os embutidos continuam checados sempre, e o `End` da doc continua valendo para FUN013/FUN014. Com isso, `IntParaAlfa(vn);` (AC-041) só dá FUN011 com o extra carregado. (b) O tipo do argumento vem só de literal ou de `Definir`, sem inferência pelo prefixo `va`/`vn`/`vd`: os 8 FUN012 que o prefixo gerava eram variáveis sem `Definir`, que o Senior trata como Numero implícito e compila. Resultado com o extra: 9 FUN010, todos na linha de cabeçalho "Código: … - Descrição: …" dos dumps exportados; FUN011 a FUN014 deram 0. Só com a doc pública: 348 avisos FUN010, todos de funções reais que faltam na doc pública (`GravarLog`, `HttpHabilitaSNI`, `CriaNovoRoteiro`…).
- **D10 — Etapa 5: variável sem `Definir` tem tipo desconhecido (confirmada em 2026-11-06).** O REQ-050 diz "Numero implícito", que é como o Senior a trata quando ela não existe em lugar nenhum. Mas o analyzer vê um arquivo só, e a mesma variável pode ser vetor ou variável de sistema ou global de outra seção. Medição em 674 regras: com "Numero implícito", 58 TYP falsos em 29 arquivos (`GerTabAlf[80] = vsCodSnf;`, `CprACodClf = "A01";`, `vaNomUsu = NomUsu;`). Com "desconhecido", 0 TYP; 122.200 comandos analisados e 4.443 (3,5%) ignorados por o checador não ler (quase todos `Cur.SQL "…"` e cabeçalhos de dump). A `senior-lsp` faz o mesmo (variável implícita = tipo livre). TYP003 fica erro, como no REQ-052; a `senior-lsp` o emite como aviso.
- **D11 — Etapa 6b: SQL013 é aviso (confirmada em 2026-11-06).** Na medição em 674 regras, 5 regras em produção selecionam a mesma coluna duas vezes no SELECT (15 ocorrências), então o compilador Senior não recusa. A `cursor-senior-lsp` também emite aviso.
- **D12 — Etapa 8: gerar `.LSP` a partir de texto (confirmada em 2026-11-09).** Entra agora, antes do commit das etapas 0–7. Destino escolhido no diálogo "Salvar como", com padrão `<pasta>\<NOME>.senior.LSP` ao lado do texto; o diálogo do sistema confirma a substituição de arquivo existente. Com erro de compilação, pergunta em modal antes de gerar. A estrutura do `.LSP` novo vem do formato observado em `SARG462.LSP` (o bloco de histórico vazio é idêntico ao da regra mínima usada pela `senior-lsp`), sem copiar código. `.lsptxt` entra só na contribuição da linguagem; contextos, peers e relatório continuam com `.lsp`/`.lspt`.
