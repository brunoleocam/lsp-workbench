# LSP Workbench

Extensão para **VS Code** e **Cursor** com suporte à **Linguagem Senior de Programação (LSP)** usada no ecossistema **Senior Sistemas** (Sapiens, HCM e afins).

Abra um arquivo `.lsp` ou `.lspt` e a extensão ativa automaticamente a linguagem **Linguagem Senior** (`senior-lsp`).

![Syntax highlighting](https://raw.githubusercontent.com/brunoleocam/lsp-workbench/main/packages/lsp-workbench/media/01-syntax-highlighting.png)

---

## O que você ganha

| Recurso | O que faz |
|---------|-----------|
| **Syntax highlighting** | Cores para palavras-chave, funções, variáveis e literais |
| **Autocompletar** | Funções nativas (~200), variáveis, membros de Cursor/Lista e campos |
| **Hover** | Documentação ao passar o mouse em funções |
| **Ajuda de parâmetros** | Signature help ao digitar argumentos entre `(` `)` |
| **Diagnósticos** | Validação sintática e de regras (erros/avisos na edição) |
| **Quick fixes** | Correções sugeridas (lâmpada / Ctrl+.) |
| **Snippets** | Atalhos para `Definir`, blocos `{ }`, SQL API, helpers |
| **Formatador** | Indentação e layout (opcional: SQL embutido) |
| **Outline** | Visão de funções e símbolos no arquivo |
| **Ir para definição** | Navegação para funções do projeto |
| **Catálogo de banco** | Autocomplete de tabelas/campos (com catálogo local) |
| **Contextos / relatórios** | Escopo de símbolos e comandos de projeto de relatório |

---

## Instalação

1. Abra o [Marketplace](https://marketplace.visualstudio.com/items?itemName=brunoleocam.lsp-workbench) ou, no VS Code/Cursor: **Extensions** → busque **LSP Workbench**.
2. Instale e abra (ou crie) um arquivo com extensão `.lsp`.
3. Confirme no canto inferior direito que o modo de linguagem é **Linguagem Senior**.

Atalho de instalação rápida (Command Palette / Quick Open):

```text
ext install brunoleocam.lsp-workbench
```

---

## Guia rápido (5 minutos)

1. Crie `exemplo.lsp`.
2. Digite `def` e escolha um snippet de **Definir** (variável, função, etc.).
3. Digite o nome de uma função nativa (ex.: `TamanhoAlfa`) e use **Ctrl+Espaço** para completar.
4. Passe o mouse sobre a função → veja o **hover**.
5. Dentro dos `(` `)`, observe a **ajuda de parâmetros**.
6. Formate com **Shift+Alt+F** (ou Format Document).
7. Se aparecer um sublinhado vermelho/amarelo, abra a lâmpada (**Ctrl+.**) para quick fixes.

---

## Recursos em detalhe

### Syntax highlighting (cores)

A gramática TextMate + *semantic tokens* colorizam palavras-chave (`Se`, `Enquanto`, `Definir`), funções builtins, variáveis e membros.

![Syntax highlighting](https://raw.githubusercontent.com/brunoleocam/lsp-workbench/main/packages/lsp-workbench/media/01-syntax-highlighting.png)

Não há configuração obrigatória: basta o arquivo estar como **Linguagem Senior**.

---

### Autocompletar

Sugestões ao digitar ou com **Ctrl+Espaço**:

- Funções nativas Senior (catálogo SENIOR)
- Variáveis e funções do arquivo / projeto (conforme escopo)
- Após `.` em Cursor/Lista: membros e campos (`AdicionarCampo`, etc.)
- Com catálogo local: tabelas e `Tabela.Campo`

![Autocompletar](https://raw.githubusercontent.com/brunoleocam/lsp-workbench/main/packages/lsp-workbench/media/02-autocomplete.png)

Dica: em `[senior-lsp]` a extensão já desliga sugestões genéricas de “palavras do arquivo” para priorizar o completion LSP.

#### Membros de Lista / Cursor

Após digitar `.` em uma variável `Lista` ou `Cursor`, o suggest lista membros válidos:

![Membros de Lista](https://raw.githubusercontent.com/brunoleocam/lsp-workbench/main/packages/lsp-workbench/media/05-membros-lista.png)

---

### Hover (documentação)

Passe o mouse sobre uma função (nativa ou do projeto) para ver resumo e detalhes.

![Hover](https://raw.githubusercontent.com/brunoleocam/lsp-workbench/main/packages/lsp-workbench/media/03-hover.png)

---

### Ajuda durante a digitação (parâmetros)

Ao abrir `(` em uma chamada de função, o editor mostra a assinatura e destaca o parâmetro atual (*signature help*).

![Ajuda de parâmetros](https://raw.githubusercontent.com/brunoleocam/lsp-workbench/main/packages/lsp-workbench/media/04-signature-help.png)

---

### Validação sintática e de regras

Enquanto você edita, a extensão analisa o código e marca problemas (ex.: parâmetros incorretos, padrões inválidos da linguagem, regras `RUL*` / `SYN*` / `ANL*` / `GER*`).

![Diagnósticos](https://raw.githubusercontent.com/brunoleocam/lsp-workbench/main/packages/lsp-workbench/media/07-diagnostics.png)

Fluxo típico: erro → alerta → Quick Fix → código corrigido:

![Validação e quick fix](https://raw.githubusercontent.com/brunoleocam/lsp-workbench/main/packages/lsp-workbench/media/08-validation.gif)

- Painel **Problems** (Ctrl+Shift+M) lista todos os alertas.
- **Quick Fix** (Ctrl+.) aplica correções quando disponíveis.
- Para ignorar IDs específicos: setting `lsp.diagnostics.ignoreIds`.

---

### Snippets

Dezenas de snippets para estruturas comuns: `Definir Alfa/Numero/...`, blocos `Se`/`Enquanto`/`Para` com `{ }`, helpers de SQL (`ExecSQLEx`, `SQL_*`), etc.

Digite o prefixo do snippet e confirme com Tab/Enter.

---

### Formatador

- **Format Document** / **Format Selection**
- Settings: `lsp.format.enabled`, `lsp.format.indentSize`, `lsp.format.braceStyle`, …
- SQL dentro de `ExecSql` / `.SQL` / `SQL_DefinirComando`: ligue `lsp.format.embeddedSql.enabled` (opt-in)

---

### Outline e navegação

- **Outline** na barra lateral: funções e símbolos do arquivo
- **Go to Definition** (F12) em funções do projeto
- Escopo cross-file: [Configurar multiarquivo](#3-configurar-multiarquivo-contextos)

---

### Catálogo de banco (tabelas e campos)

Sem catálogo local, a extensão funciona normalmente — só não sugere tabelas/campos do dicionário Senior.

![Autocomplete de catálogo](https://raw.githubusercontent.com/brunoleocam/lsp-workbench/main/packages/lsp-workbench/media/06-catalog-autocomplete.png)

Passo a passo (gerar JSON + `lsp.catalog.path`): [Catálogo de tabelas](#5-catálogo-de-tabelas).

O dicionário da sua empresa **não** vem no pacote do Marketplace.

---

### Contextos e escopo de símbolos

Ver passo a passo em [Configurar multiarquivo](#3-configurar-multiarquivo-contextos).

Comandos úteis (Ctrl+Shift+P): **Criar/Editar/Apagar Contexto**, **Alternar Escopo de Símbolos**. A status bar mostra o escopo atual.

---

### Projeto de relatório

Comandos (Command Palette → “LSP Workbench”):

- **Gerar Projeto de Relatório** — scaffold vazio (`relatorio.json` + pastas)
- **Importar Relatório** — dump “Visualizar Todas as Regras” → árvore ADR-007
- **Copiar Regra do Relatório** / **Visualizar Todas as Regras**
- **Importar / Exportar Contexto**
- **Mostrar Escopo do Relatório**

Há diagnósticos específicos (`GER*`) para pré-seleção e seções. Passo a passo: [Projeto de relatório](#4-projeto-de-relatório-gerador).

---

### Refactors

Code Actions / refactors: envolver seleção em `Se`/`Enquanto`/`Para`/bloco, converter `Inicio`/`Fim` → `{ }`, `\` → `+`, entre outros. Estilo padrão de bloco: `lsp.refactor.defaultBlockStyle`.

---

## Configuração (passo a passo)

As settings começam com `lsp.*`.

| Onde editar | Caminho | Quando |
|-------------|---------|--------|
| **Workspace** (recomendado) | `.vscode/settings.json` na raiz do projeto | Contextos, catálogo, `files.associations` |
| **Usuário** | Settings → busque `LSP Workbench` | Preferências pessoais |

1. Crie `.vscode/settings.json` se ainda não existir.
2. Cole as chaves necessárias (seções abaixo).
3. Salve o arquivo. Só o Language Server exige **Reload Window**.

---

### 1. Arquivo `.lsp` / `.lspt` (sem config)

1. Instale a extensão.
2. Abra um `.lsp` ou `.lspt`.
3. Status bar → **Linguagem Senior**.
4. Pronto: highlight, completion e diagnostics já ativos.

---

### 2. Associar `.txt` de regra Senior

Regras exportadas do Senior muitas vezes são `.txt`. A extensão **não** associa `.txt` sozinha.

1. Abra **`.vscode/settings.json`** do workspace (não o settings global, se a associação for do projeto).
2. Adicione `files.associations` com o glob dos seus arquivos e o valor `senior-lsp`.
3. Salve e reabra o arquivo (ou mude o language mode manualmente uma vez).

```json
{
  "files.associations": {
    "**/HR/HR*.txt": "senior-lsp",
    "**/TR/TR*.txt": "senior-lsp"
  }
}
```

| Peça | Exemplo | Significado |
|------|---------|-------------|
| Padrão | `**/HR/HR*.txt` | Arquivos sob `HR/` que começam com `HR` e terminam em `.txt` |
| Language id | `senior-lsp` | Ativa a extensão LSP Workbench |

Conferência: status bar = **Linguagem Senior** + cores/completion.

---

### 3. Configurar multiarquivo (contextos)

Use quando o workspace tem vários módulos e o Ctrl+Espaço mistura símbolos demais.

1. Escolha o escopo (`lsp.symbols.scope`):
   - `project` — workspace inteiro (default)
   - `file` — só o arquivo aberto
   - `mixed` — arquivo + entradas de `lsp.contexts`
2. Defina um ou mais itens em `lsp.contexts`.
3. Salve `.vscode/settings.json`.
4. Abra um arquivo do contexto e teste Ctrl+Espaço / F12.
5. Opcional: **LSP Workbench: Criar Contexto** na Command Palette.

```json
{
  "lsp.symbols.scope": "project",
  "lsp.contexts": [
    {
      "name": "HR",
      "rootDir": "HR",
      "filePattern": "HR*.lspt",
      "includeSubdirectories": false,
      "system": "HCM"
    },
    {
      "name": "TR",
      "rootDir": "TR",
      "filePattern": "TR*.txt",
      "includeSubdirectories": true,
      "files": ["shared/helpers.lsp"]
    }
  ]
}
```

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `name` | sim | Nome exibido |
| `rootDir` | sim | Pasta relativa ao workspace |
| `filePattern` | sim | Glob (ex.: `*.lsp`, `HR*.txt`) |
| `includeSubdirectories` | não | Default `true` |
| `files` | não | Arquivos extras (allowlist) |
| `system` | não | `HCM` / `ACESSO` / `ERP` (status bar) |
| `diagnostics.ignoreIds` | não | IDs ignorados só neste contexto |

---

### 4. Projeto de relatório (Gerador)

**Criar do zero**

1. **LSP Workbench: Gerar Projeto de Relatório** (scaffold com `relatorio.json`).
2. Edite `.lsp` dentro da pasta — o escopo fica isolado nessa pasta.
3. **Importar Contexto de…** para pastas compartilhadas (`contextoExtra`).
4. **Mostrar Escopo do Relatório** para conferir.

**Importar de um dump Senior**

1. No Gerador, use **Visualizar Todas as Regras** e salve o `.lsp` multi-trecho (padrão `Código: N - Descrição: …`).
2. Abra esse arquivo **ou** Command Palette → **LSP Workbench: Importar Relatório** e escolha o arquivo.
3. Informe sigla (ex. `RDCG183`), descrição e pasta destino.
4. A extensão cria `relatorio.json`, `Definicao/`, `Secoes/<Nome>/` e abre o `README.md`.
5. Eventos `*_Na Impressão` ficam listados no README (não geram arquivo).

```json
{
  "codigo": "RDCGXXX",
  "descricao": "Cargas — exemplo",
  "detalhePrincipal": "Detalhe_1",
  "contextoExtra": ["../FUNCOES"]
}
```

Docs: [docs/gerador-relatorios](https://github.com/brunoleocam/lsp-workbench/tree/main/docs/gerador-relatorios).
---

### 5. Catálogo de tabelas

1. Gere ou copie um `catalog.json` ([receitas](https://github.com/brunoleocam/lsp-workbench/tree/main/docs/banco-senior-base)).
2. Configure o path no workspace:

```json
{
  "lsp.catalog.path": "docs/banco-senior-base/catalog.example.json"
}
```

3. Sem path, a extensão tenta `docs/banco-senior/.generated/catalog.json` e `docs/banco-senior-base/.generated/catalog.json`.
4. Teste: digite `E012FAM.` → Ctrl+Espaço.

---

### 6. Formatação e tabela de settings

```json
{
  "[senior-lsp]": {
    "editor.formatOnSave": true
  },
  "lsp.format.enabled": true,
  "lsp.format.indentSize": 2,
  "lsp.format.braceStyle": "sameLine",
  "lsp.format.embeddedSql.enabled": false,
  "lsp.format.embeddedSql.dialect": "sql",
  "lsp.diagnostics.ignoreIds": [],
  "lsp.fallback.defaultSystem": "",
  "lsp.server.enabled": false
}
```

| Setting | Default | Descrição |
|---------|---------|-----------|
| `lsp.format.enabled` | `true` | Formatação de documentos |
| `lsp.format.indentSize` | `2` | Indentação (2 ou 4) |
| `lsp.format.braceStyle` | `sameLine` | `{` na mesma linha ou na seguinte |
| `lsp.format.embeddedSql.enabled` | `false` | Formatar SQL embutido |
| `lsp.format.embeddedSql.dialect` | `sql` | `sql` / `oracle` / `sqlserver` |
| `lsp.diagnostics.ignoreIds` | `[]` | IDs a ignorar |
| `lsp.symbols.scope` | `project` | Escopo de símbolos |
| `lsp.contexts` | `[]` | Contextos nomeados |
| `lsp.fallback.defaultSystem` | `""` | Sistema na status bar |
| `lsp.catalog.path` | `""` | Path do catálogo JSON |
| `lsp.server.enabled` | `false` | Language Server externo (experimental) |

### Language Server (opcional)

Default: diagnósticos **in-process** (`lsp.server.enabled` = `false`). Para o LS externo é preciso build do monorepo — ver [Documentação para desenvolvedores](https://github.com/brunoleocam/lsp-workbench/blob/main/docs/product/DEVELOPER.md). Depois de ligar a setting: **Reload Window**.

---

## Atalhos úteis

| Ação | Atalho típico (Windows) |
|------|-------------------------|
| Completar | Ctrl+Espaço |
| Quick Fix | Ctrl+. |
| Format Document | Shift+Alt+F |
| Go to Definition | F12 |
| Hover | Mouse over / Ctrl+K Ctrl+I |
| Problems | Ctrl+Shift+M |
| Command Palette | Ctrl+Shift+P → `LSP Workbench:` |

---

## Requisitos

- VS Code **1.85+** (ou Cursor compatível)
- Arquivos `.lsp` / `.lspt`

---

## Problemas comuns

| Sintoma | O que verificar |
|---------|-----------------|
| Sem cores / sem completion | Linguagem = **Linguagem Senior** (não Plain Text) |
| `.txt` sem highlight | `files.associations` em `.vscode/settings.json` → `senior-lsp` |
| Sem sugestão de tabelas | Catálogo ausente ou `lsp.catalog.path` incorreto |
| Completion mistura outros módulos | Configure `lsp.contexts` / escopo (passo 3) |
| Formatação não roda | `lsp.format.enabled` = true |
| Muitos avisos indesejados | `lsp.diagnostics.ignoreIds` ou ignore por contexto |

Issues: [github.com/brunoleocam/lsp-workbench/issues](https://github.com/brunoleocam/lsp-workbench/issues)

---

## Licença e créditos

MIT — ver [LICENSE](LICENSE). Créditos de terceiros: [CREDITS.md](CREDITS.md).

Código-fonte: [github.com/brunoleocam/lsp-workbench](https://github.com/brunoleocam/lsp-workbench).  
**Documentação para desenvolvedores:** [DEVELOPER.md](https://github.com/brunoleocam/lsp-workbench/blob/main/docs/product/DEVELOPER.md).
