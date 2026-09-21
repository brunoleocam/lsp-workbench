# PDR-003 — Símbolos, contexto e completion (LSP Workbench)

| Campo | Valor |
|-------|-------|
| Status | Aceito — entregue na extensão **0.1.3**; UX complementar em PDR-004 (**0.2.0**) |
| Data | 2026-09-18 |
| Artefato | Extensão `packages/lsp-workbench` |
| Relacionados | PDR-001, PDR-004, ADR-003 (`lsp.*`), `docs/product/regras-estaticas-lsp.md` |

## Problema

Desenvolvedores precisam de Ctrl+Espaço / hover / signature help para funções e variáveis **do arquivo e do projeto**, com documentação, sem confundir módulos distintos. A extensão atual cobre builtins e regras estáticas; falta índice de símbolos customizados e modos de escopo explícitos.

## Personas

- Dev editando vários `.lsp` / `.lspt` (e `.txt` de regra) no mesmo workspace
- Dev editando um arquivo isolado (protótipo / trecho)
- Dev com workspace grande que quer limitar o índice a pastas/arquivos escolhidos

## Decisões travadas (sem lacuna aberta)

| # | Decisão |
|---|---------|
| D1 | Três modos de escopo: **Projeto** (default), **Arquivo**, **Misto** |
| D2 | Prefixo de settings alinhado a ADR-003: `lsp.*` (não `lspWorkbench.*`) |
| D3 | Função customizada só entra no completion se tiver `Definir Funcao` **e** `Funcao … { … }` (elegível) |
| D4 | Cross-file no mesmo escopo: sugerir chamada; diagnosticar ausência local; Quick Fix copia Decl+Impl |
| D5 | Doc opcional estilo LSPDoc imediatamente acima de `Definir Funcao` / `Funcao` |
| D6 | Sistema **SENIOR** sempre carregado; sistema adicional (`HCM` \| `ACESSO` \| `ERP`) por contexto nomeado ou fallback SingleFile |
| D7 | Um arquivo pertence a **no máximo um** contexto nomeado; símbolos não vazam entre contextos nomeados |
| D8 | Associação `files.associations` para `.txt` é **configuração de workspace** (documentada), não feature de runtime da extensão |
| D9 | Language id canônico: **`senior-lsp`** (evita colisão com outras extensões no mesmo workspace) |

## Modos de escopo

Setting:

```json
{
  "lsp.symbols.scope": "project"
}
```

Valores: `project` \| `file` \| `mixed`. Default: `project`.

### 1. Projeto (padrão)

- Índice = todos os arquivos LSP elegíveis sob as **raízes do workspace** (multi-root: união das pastas).
- Extensões indexadas: `.lsp`, `.lspt`, e `.txt` **somente** se o editor os associar à linguagem `lsp` (via `files.associations`) **ou** se um contexto nomeado incluir o padrão.
- Um único escopo implícito “workspace” (salvo restrição de contextos nomeados futuros — ver Misto).
- Completion/hover/go-to-def/diagnostics cross-file dentro desse índice.

### 2. Arquivo

- Índice = apenas o buffer atual.
- Sem varredura de pasta.
- Escopo limitado ao buffer atual (sem varredura de pasta).
- Sistema adicional selecionável na status bar (`lsp.fallback.defaultSystem`).

### 3. Misto (arquivo + entradas explícitas)

- Sempre inclui o arquivo atual.
- Mais o que estiver em `lsp.contexts` / allowlist: **pastas**, **subpastas** e **arquivos** (`.lsp`, `.lspt`, `.txt` associados ou listados).
- Útil quando o workspace é grande e só se quer um subconjunto.

```json
{
  "lsp.symbols.scope": "mixed",
  "lsp.contexts": [
    {
      "name": "Senior-ops",
      "rootDir": "regras/operacoes",
      "filePattern": "**/*.{lsp,lspt}",
      "includeSubdirectories": true,
      "system": "HCM"
    },
    {
      "name": "TR-txt",
      "rootDir": "TR",
      "filePattern": "re:^\\d+.*\\.txt$",
      "includeSubdirectories": false,
      "system": "HCM"
    }
  ]
}
```

Campos de contexto (`lsp.contexts`):

| Campo | Obrigatório | Significado |
|-------|-------------|-------------|
| `name` | sim | Identificador do grupo |
| `rootDir` | sim | Pasta relativa à raiz do workspace |
| `filePattern` | sim | Glob ou `re:…` (regex) |
| `includeSubdirectories` | não (default true em Projeto/Misto conforme entrada) | Recursão |
| `system` | não | Adicional: `HCM` \| `ACESSO` \| `ERP` |
| `files` | não | Allowlist **adicional** (união com `filePattern`); caminhos relativos ao workspace |
| `diagnostics.ignoreIds` | não | IDs ignorados neste contexto (**unidos** a `lsp.diagnostics.ignoreIds`) |

### SingleFile (automático)

Se `lsp.symbols.scope` ≠ `file` mas o arquivo **aberto** não entra em nenhum contexto nomeado **e** o modo é `mixed` sem match → tratar como SingleFile (isolado + status bar de sistema).

Se modo `project`, o arquivo sempre entra no índice do workspace (desde que seja linguagem `senior-lsp`).

## Associação de `.txt` (documentação de setup)

Não é setting da extensão; recomenda-se no `.vscode/settings.json` do workspace de regras:

```json
{
  "files.associations": {
    "**/HR/HR*.txt": "senior-lsp",
    "**/QL/QL*.txt": "senior-lsp",
    "**/RS/RS*.txt": "senior-lsp",
    "**/SM/SM*.txt": "senior-lsp",
    "**/TR/TR*.txt": "senior-lsp"
  }
}
```

Evitar `*.txt` global para não validar textos que não são regra.

## Funções e variáveis

### Elegibilidade de função customizada

Obrigatório no **mesmo arquivo de origem**:

1. `Definir Funcao nome(...);`
2. `Funcao nome(...) { ... }`

Caso contrário: não sugerir no Ctrl+Espaço; emitir diagnóstico (`FUN_DECL_SEM_IMPL` / `FUN_IMPL_SEM_DECL` — IDs finais no catálogo estático).

### Completion (Ctrl+Espaço)

- Funções internas (catálogo SENIOR + sistema adicional)
- Funções customizadas elegíveis no escopo ativo
- Variáveis do arquivo (globais + params/locais da função ativa)
- Variáveis do escopo projeto/misto, com `detail` de origem (`arquivo`, `função`, caminho)
- Membros `Cursor` / `Lista` / campos via `.AdicionarCampo(...)`
- Snippets existentes

Inserção de função customizada: snippet de chamada, ex. `somar(${1:vnA}, ${2:vnB}, ${3:vnOut});`.

### Cross-file

Ex.: `operacoes.lsp` (somar/subtrair/…) e `main.lsp` no mesmo escopo.

1. Em `main.lsp`, Ctrl+Espaço lista as funções elegíveis de `operacoes.lsp` (detail = origem).
2. Aceitar → insere a **chamada**.
3. Diagnóstico: função não declarada/implementada **neste** arquivo.
4. Quick Fix **Importar implementação**: copia `Definir Funcao` + corpo `Funcao` (e LSPDoc adjacente, se houver) para posição canônica no consumidor.

### LSPDoc (opcional)

Comentário de bloco imediatamente acima da declaração ou implementação:

```lsp
/**
 * Soma dois números; resultado no parâmetro de saída.
 * @param vnNumero1 Primeiro operando
 * @param vnNumero2 Segundo operando
 * @param vnResultado [End] Saída
 * @returns void — via parâmetro End
 */
Definir Funcao somar(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado);
```

Usado em completion `documentation`, hover e signature help (parâmetro ativo). Sem comentário → só assinatura inferida.

### Destaque semântico

Funções internas/customizadas; variáveis; parâmetros/assinaturas; membros `Cursor`/`Lista`; campos dinâmicos `AdicionarCampo`; SQL embutido se highlight habilitado (`lsp.semantic.embeddedSqlHighlight.enabled`).

### Signature help

Ctrl+Shift+Espaço (ou equivalente): parâmetro atual + doc `@param` quando existir.

### Go to Definition

F12 / Ctrl+clique em função customizada → declaração/implementação no arquivo de origem (mesmo escopo).

## Comandos

| Comando | Comportamento |
|---------|---------------|
| `LSP Workbench: Criar Contexto` | Wizard: nome, rootDir, filePattern, system; persiste em `lsp.contexts` |
| `LSP Workbench: Editar Contexto` | Selecionar contexto → editar settings ou abrir membro |
| `LSP Workbench: Apagar Contexto` | Remove entrada de `lsp.contexts` |
| `LSP Workbench: Adicionar ao Contexto` | Arquivo/pasta atual (ou picker) → `files` / ajuste de pattern |
| `LSP Workbench: Remover do Contexto` | Remove da allowlist (não apaga disco) |
| `LSP Workbench: Selecionar Sistema (Fallback)` | Só SingleFile / modo `file` |
| `LSP Workbench: Alternar Escopo de Símbolos` | Atalho entre `project` / `file` / `mixed` |

Após mudar contextos: **hot-reload do índice** (preferido). Se impossível na leva, documentar “Reload Window”.

## Settings (resumo)

| Chave | Default | Finalidade |
|-------|---------|------------|
| `lsp.symbols.scope` | `project` | `project` \| `file` \| `mixed` |
| `lsp.contexts` | `[]` | Contextos nomeados (obrigatório para personalizar no Misto; opcional no Projeto para subdividir módulos) |
| `lsp.fallback.defaultSystem` | `""` | Sistema adicional no SingleFile / modo arquivo |
| `lsp.format.*` / `lsp.diagnostics.ignoreIds` | (ADR-003) | Inalterados |
| `lsp.semantic.embeddedSqlHighlight.enabled` | `false` | Highlight SQL |

No modo **Projeto**, `lsp.contexts` vazio = índice = workspace inteiro. Se `lsp.contexts` tiver entradas mesmo em `project`, cada contexto nomeado isola símbolos (não vazam); arquivos fora de qualquer contexto nomeado ficam em SingleFile — útil para workspaces multi-módulo tipo HR/TR.

## Critérios de aceite

| ID | Caso | Esperado |
|----|------|----------|
| ACC-01 | Definir+Funcao no mesmo arquivo | Aparece no completion |
| ACC-02 | Só Definir ou só Funcao | Não aparece; diagnóstico |
| ACC-03 | Modo `project`; função em outro `.lsp` do workspace | Aparece com origem |
| ACC-04 | Aceitar completion cross-file | Insere chamada + diagnóstico “não local” |
| ACC-05 | Quick Fix importar | Copia Decl+Impl (+ doc); diagnóstico some |
| ACC-06 | LSPDoc presente | documentation/hover/signature preenchidos |
| ACC-07 | `scope=file` | ACC-03 falha (sem cross-file) |
| ACC-08 | `scope=mixed` só com pasta `operacoes/` | `main` fora da pasta não vê ops; `main` dentro ou adicionado vê |
| ACC-09 | Variável de outro arquivo no escopo | Completion com detail de origem |
| ACC-10 | Dois contextos nomeados | Símbolos não vazam |
| ACC-11 | `.txt` associado a `lsp` no Projeto | Entra no índice; sem association, ignorado |
| ACC-12 | SingleFile / status bar | Troca de sistema adicional só nesse cenário |

## Não-objetivos

- Compilador/runtime Senior
- Publicação Marketplace nesta leva
- Execução real da regra / link de módulos Senior além do índice estático

## Ordem de implementação sugerida

1. Índice por documento (funções elegíveis, variáveis, LSPDoc)
2. Completion / hover / signature no modo `file`
3. Modo `project` + testes ACC-03…05
4. `lsp.contexts` + modo `mixed` + isolamento ACC-10
5. Comandos CRUD + status bar SingleFile
6. Semantic tokens restantes + docs de `files.associations`

## Eval / TDD

Complementar `docs/product/tdd/TDD-extension.md` e fixtures em `packages/lsp-workbench` com ACC-01…12.

Estado: ACC-01…08 e ACC-10 cobertos por testes unitários na **0.1.3**; ACC-09/11/12 e demo manual em `exemplos/contexto-projeto/`. Itens que eram backlog deste PDR (semantic tokens, SQL embutido, stubs HCM/ERP) foram entregues na **0.2.0** via [PDR-004](PDR-004-paridade-ux.md). Catálogos multi-sistema completos: backlog futuro.

Demo manual: [`exemplos/contexto-projeto/`](../../../exemplos/contexto-projeto/).
