# Evolução de regras (lacunas identificadas na conversa)

Registro **opcional** e **versionado** de lacunas ou correções que surgiram no dia a dia e que ainda não viraram regra formal em `.cursor/rules/`.

## Como usar

1. Quando o agente (ou você) identificar um padrão de erro ou omissão, adicione uma entrada na seção abaixo com **data**, **contexto** e **texto sugerido** para futura rule ou Memory.
2. Periodicamente, promover entradas estáveis para o `.mdc` ou skill adequado e marcar aqui como resolvido ou remover.

## Entradas

### 2026-09-18 — RUL001: tipo obrigatório na assinatura (não SEM001 + Definir)

- **Contexto:** `Definir Funcao Foo(vaP)` gerava SEM001 → QF `Definir Alfa vaP` + param solto (errado).
- **Texto canônico:**
  > Params de função: tipo obrigatório na assinatura e só Numero. `Foo(vaP)` → RUL001 → `Numero vnP`. Alfa = variável global, sem param. Não Definir + nome solto.
- **Status:** SEM001 ignora params; RUL001 cobre tipado ilegal e sem tipo; QFs corrigidos.

### 2026-09-18 — Ordem de `Definir` no topo do arquivo

- **Contexto:** QFs inseriam `Definir Funcao` / variáveis sem respeitar o bloco inicial ordenado.
- **Texto canônico (Memory / rule):**
  > Bloco inicial: variáveis depois funções. Ordem dos tipos: Numero → Alfa → Data → Lista → Tabela → Grid → Cursor → Funcao. Plugin: `definir-insert` + FUN008.
- **Status:** promovido para `.cursor/rules/boas-praticas-lsp.mdc`; implementado em `definir-insert.ts` / FUN007–008; doc em `docs/lsp/variaveis.md`.

### 2026-05-06 — Documentação LSP: arredondamento e conversão Numero → Alfa

- **Contexto:** No ambiente real, a função **`Arredondar(<numero>, <casasDecimais>, <resultado>)` não existe** (estava descrita em `docs/lsp/operacoes-numericas-avancadas.md`). Exemplos de código que a usavam quebram na compilação ou induzem erro.
- **Correções planejadas na documentação (`docs/lsp/`):**
  1. **Remover** referências à função inexistente **`Arredondar`** e exemplos que a utilizam.
  2. **Manter / consolidar** apenas as funções reais de arredondamento (validar comportamento no manual Senior e no compilador):
     - `Arredonda`
     - `ArredondaABNT`
     - `ArredondarValor`
     - `ArredondarValorEx` — **teste no ambiente:** mesmo comportamento que `ArredondarValor`; pode padronizar o uso em uma delas.
     - `ArredondaValorTipoAcerto`
  3. **Conversões:** onde a documentação trata **`IntParaAlfa`** para exibir números, revisar e incluir **`DecimalParaAlfa`** quando o valor for **`Numero` com parte decimal** (evita perder casas decimais na string).
- **Referência oficial Senior (links diretos):**
  - [Arredonda](https://documentacao.senior.com.br/gestaoempresarialerp/5.10.4/regra_funcoes/arredonda.htm) (Gestão Empresarial ERP 5.10.4 — regras)
  - [ArredondarValor](https://documentacao.senior.com.br/gestao-de-pessoas-hcm/6.10.4/customizacoes/funcoes/funcao_arredondarvalor.htm) (HCM 6.10.4 — customizações; sintaxe `ArredondarValor(Valor, Qtde_Casas)`)
  - [Arredonda ABNT](https://documentacao.senior.com.br/gestaoempresarialerp/5.10.4/regra_funcoes/arredonda-abnt.htm)
  - [Arredonda Valor Tipo Acerto](https://documentacao.senior.com.br/gestaoempresarialerp/5.10.4/regra_funcoes/arredondavalortipoacerto.htm)
- **Status:** função inexistente `Arredondar` removida de `operacoes-numericas-avancadas.md`; `DecimalParaAlfa` incluído em `cast-de-variavel.md`. Ajustar `datas.md` com links e, se necessário, alinhar assinaturas ao manual (ex.: `Arredonda` com `Numero End Valor` na doc ERP).

### 2026-09-17 — Cursor: AbrirCursor/FecharCursor (não Abrir/Fechar)

- **Contexto:** Smoke SEM003 e snippet usavam `Cur_*.Abrir()` / `.Fechar()`, mas em `lsp.md` / `docs/lsp/cursores.md` cursor abre com `.AbrirCursor()` / `.FecharCursor()` (ou `SQL_AbrirCursor` / `SQL_FecharCursor`). `Abrir` / `Fechar` são só para **arquivo**.
- **Texto canônico (Memory / hábito):**
  > Cursor: `.AbrirCursor` / `.FecharCursor` (ou `SQL_AbrirCursor` / `SQL_FecharCursor`). Arquivo: `Abrir` / `Fechar`. SEM003 = cursor; SEM002 = arquivo. Não usar `.Abrir` em cursor.
- **Status:** SEM003, `smoke-sem.lsp`, snippet `cursor` e `regras-estaticas-lsp.md` alinhados (2026-09-17).

### 2026-09-17 — Cursor SQL: Alfa + ordem + nativo/subquery

- **Contexto:** `SQL_Criar(x)` exige `x` como `Definir Alfa`. Ordem: Criar → (UsarAbrangencia/UsarSQLSenior2) → DefinirComando → binds → Abrir → Fechar → Destruir. INNER JOIN / subquery / SQL nativo: `UsarAbrangencia(0)` + `UsarSQLSenior2(0)` **antes** do comando.
- **Texto canônico (Memory):**
  > SQL_Criar: handle Alfa. Ordem Criar→Usar*→DefinirComando→Abrir→Fechar→Destruir. Nativo/JOIN/subquery: Abrangencia(0)+SQLSenior2(0) antes do comando. Plugin: SQL004–SQL008.
- **Status:** diagnostics/QF/completion SQL004–SQL008 (SQL008 = heurística JOIN/subquery); docs `sql.md` / `cursores.md` / `lsp.md` / `regras-estaticas-lsp.md` (2026-09-17).

### 2026-09-17 — SQL009: separar modos + esqueleto (não empilhar QFs)

- **Contexto:** Aplicar todos os QFs no bloco misturado gerava Fechar/Destruir/DefinirComando em cima da conversão de API (e completion corrompia texto).
- **Texto canônico (Memory):**
  > SQL009: Cursor SIMPLES (`Definir Cursor` + `.AbrirCursor`) ≠ COMPLETO (`SQL_Criar` + `SQL_*`). QF preferido = esqueleto comentado do modo certo. SQL002 adiado enquanto `.AbrirCursor` no handle de `SQL_Criar`. Preferir Ctrl+. ; um modo por vez.
- **Status:** smoke `SQL009a`/`SQL009b`, `applySql009ScaffoldFix`, SQL002 adiado; docs cursores/regras (2026-09-17).

### 2026-09-17 — Completion QF: range deve conter o cursor

- **Contexto:** Ctrl+Espaço em `SQL_|Criar(vaCur)` + QF com `insertText=""` e range na col 0 apagava `SQL_` → `Criar(vaCur);`.
- **Texto canônico (Memory):**
  > Completion QF: `range` deve conter a posição do cursor. QF só com additionalTextEdits → primary = no-op (`insertText=word`, `range=wordRange`). Nunca `insertText=""` com range longe do cursor.
- **Status:** `pushQfEditsOnly` / Ignorar alerta corrigidos (2026-09-17).

### 2026-09-17 — Completion: whole-doc sem overlap; Numero implícito

- **Contexto:** SYN007 via Ctrl+Espaço corrompia a linha seguinte (`Numero`+`comentario`). `vn*` sem Definir é válido (Numero = 0).
- **Texto canônico (Memory):**
  > Completion QF whole-doc: primary = replace(0..end), sem additionalTextEdits. SYN007 = só a linha (` */`). Numero implícito: `vnX = 1;` sem Definir ok (inicia 0). SEM001 não alerta `vn*`. SYN001 não alerta tipo solto (`Numero`).
- **Status:** pushWholeDocFix; SEM001/SYN001/variaveis.md (2026-09-17).

### 2026-09-18 — Cancel(1\|2\|3) + autocomplete de funções

- **Contexto:** Validar os três códigos de `Cancel` (`docs/lsp/cancel.md`) e Ctrl+Espaço por prefixo (`M`/`Mens` → `Mensagem`, …) com assinatura e uso.
- **Texto canônico (Memory):**
  > Cancel só `1` (interromper), `2` (relatório ValStr/ValRet), `3` (fórmula relatório). Plugin: RUL019. Ctrl+Espaço: catálogo `function-catalog.ts`.
- **Status:** RUL019 + `LSP_FUNCTION_CATALOG` + seeds (2026-09-18).

### 2026-09-18 — Catálogo de funções 100% docs/lsp

- **Contexto:** Autocomplete cobria ~62 funções; docs/lsp documenta ~200+ builtins.
- **Texto canônico (Memory):**
  > Catálogo Ctrl+Espaço = `npm run extract-functions` a partir de `docs/lsp/` → `function-catalog.generated.ts` + overrides. Cobertura garantida por teste. Fonte: docs/lsp (não lsp.md).
- **Status:** script + merge + coverage test (2026-09-18).

<!--
### AAAA-MM-DD — Título curto
- Contexto: ...
- Texto sugerido para regra/Memory: ...
-->
