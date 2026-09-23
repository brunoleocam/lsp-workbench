<br />
<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=brunoleocam.lsp-workbench">
    <img src="assets/icon.png" alt="LSP Workbench" width="128" height="128">
  </a>

  <h2 align="center">LSP Workbench</h2>

  <p align="center">
    Suporte à <b>Linguagem Senior de Programação (LSP)</b> no Cursor e no Visual Studio Code —
    extensão IDE, Agent e documentação da linguagem para o ecossistema <b>Senior Sistemas</b> (Sapiens, HCM e afins).
  </p>

  <p align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=brunoleocam.lsp-workbench"><img alt="VS Marketplace" src="https://img.shields.io/visual-studio-marketplace/v/brunoleocam.lsp-workbench?label=VS%20Marketplace&logo=visualstudiocode"></a>
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/brunoleocam/lsp-workbench">
    <img alt="License" src="https://img.shields.io/github/license/brunoleocam/lsp-workbench">
  </p>
</p>

**Instalar a extensão:** [Marketplace — LSP Workbench](https://marketplace.visualstudio.com/items?itemName=brunoleocam.lsp-workbench) · `ext install brunoleocam.lsp-workbench`

Guia completo na extensão: [`packages/lsp-workbench/README.md`](packages/lsp-workbench/README.md)  
**Documentação para desenvolvedores:** [`docs/product/DEVELOPER.md`](docs/product/DEVELOPER.md)

---

## Prévia

<p align="center">
  <img src="packages/lsp-workbench/media/01-syntax-highlighting.png" alt="Syntax highlighting" width="720">
</p>

| Highlight | Autocomplete | Hover |
|:---------:|:------------:|:-----:|
| <img src="packages/lsp-workbench/media/01-syntax-highlighting.png" width="260" alt="Highlight"> | <img src="packages/lsp-workbench/media/02-autocomplete.png" width="260" alt="Autocomplete"> | <img src="packages/lsp-workbench/media/03-hover.png" width="260" alt="Hover"> |

| Parâmetros | Membros Lista/Cursor | Catálogo de banco |
|:----------:|:--------------------:|:-----------------:|
| <img src="packages/lsp-workbench/media/04-signature-help.png" width="260" alt="Signature help"> | <img src="packages/lsp-workbench/media/05-membros-lista.png" width="260" alt="Membros"> | <img src="packages/lsp-workbench/media/06-catalog-autocomplete.png" width="260" alt="Catálogo"> |

**Diagnósticos** e fluxo de validação + quick fix:

<p align="center">
  <img src="packages/lsp-workbench/media/07-diagnostics.png" alt="Diagnósticos" width="720"><br>
  <img src="packages/lsp-workbench/media/08-validation.gif" alt="Validação e quick fix" width="720">
</p>

---

## O que a extensão faz

Language id: **`senior-lsp`** · arquivos **`.lsp`**, **`.lspt`** (e `.txt` se você associar — ver abaixo)

- Coloração, snippets e semantic tokens
- Autocompletar (funções, variáveis, membros de `Cursor` / `Lista`)
- Hover, signature help, Go to Definition, Outline
- Diagnósticos e quick fixes (Ctrl+Espaço / Ctrl+.)
- Formatação e refactors
- Contextos multiarquivo e modo arquivo único
- Catálogo local de tabelas/campos
- Projeto de relatório (Gerador Senior)

---

## Configuração (passo a passo)

As settings da extensão começam com `lsp.*`. Você pode editar de dois jeitos:

| Onde | Caminho típico | Quando usar |
|------|----------------|-------------|
| **Workspace** (recomendado para time) | `.vscode/settings.json` na raiz do projeto | Contextos, catálogo, associações de arquivo do projeto |
| **Usuário** | Settings do VS Code/Cursor → busca `LSP Workbench` | Preferências pessoais (indentação, format on save) |

Abrir o arquivo do workspace:

1. Na raiz do projeto, crie a pasta `.vscode` se não existir.
2. Crie ou edite `.vscode/settings.json`.
3. Cole as chaves abaixo conforme a necessidade.
4. Salve. Em poucos casos (Language Server) será preciso **Developer: Reload Window**.

---

### 1. Começar sem configuração

1. Instale a extensão.
2. Abra um arquivo `.lsp` ou `.lspt`.
3. No canto inferior direito, confirme **Linguagem Senior**.
4. Use Ctrl+Espaço, hover e Problems — já funciona em arquivo único.

---

### 2. Associar arquivos `.txt` de regra Senior

Muitas regras exportadas do Senior vêm como `.txt` (ex.: `HR123.txt`). A extensão **não** associa `.txt` automaticamente (evita conflitar com texto comum).

**Passo a passo:**

1. Abra `.vscode/settings.json` do **workspace** (pasta do projeto).
2. Adicione `files.associations` mapeando o padrão dos seus arquivos para `senior-lsp`.
3. Salve e reabra o `.txt` (ou clique no modo de linguagem no status bar e escolha **Linguagem Senior** uma vez).

Exemplo (ajuste pastas/prefixos ao seu layout):

```json
{
  "files.associations": {
    "**/HR/HR*.txt": "senior-lsp",
    "**/TR/TR*.txt": "senior-lsp",
    "**/*.lspt": "senior-lsp"
  }
}
```

| Campo | Significado |
|-------|-------------|
| Chave (`**/HR/HR*.txt`) | Glob relativo ao workspace |
| Valor (`senior-lsp`) | Language id da extensão LSP Workbench |

Como conferir: abra o `.txt` → status bar deve mostrar **Linguagem Senior** → highlight e completion ativos.

---

### 3. Configurar multiarquivo (contextos)

Por padrão (`lsp.symbols.scope` = `project`), o completion “enxerga” símbolos de todo o workspace. Em pastas grandes isso mistura regras de módulos diferentes.

**Objetivo:** delimitar quais pastas/arquivos entram no índice (Ctrl+Espaço, Go to Definition, etc.).

**Passo a passo:**

1. Decida o escopo global:
   - `project` — workspace inteiro (default)
   - `file` — só o arquivo aberto
   - `mixed` — arquivo atual + contextos em `lsp.contexts`
2. Liste contextos em `lsp.contexts` (nome, pasta raiz, padrão de arquivo).
3. Salve `.vscode/settings.json`.
4. Abra um arquivo do contexto e use **Ctrl+Espaço** / F12 — só devem aparecer símbolos desse conjunto.
5. (Opcional) Command Palette → **LSP Workbench: Criar Contexto** / **Editar Contexto** / **Alternar Escopo de Símbolos**.

Exemplo completo:

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
| `name` | sim | Nome na status bar / UI |
| `rootDir` | sim | Pasta relativa à raiz do workspace |
| `filePattern` | sim | Glob dos arquivos do contexto (ex.: `HR*.lspt`, `*.lsp`) |
| `includeSubdirectories` | não | Incluir subpastas (`true` por default) |
| `files` | não | Allowlist extra (caminhos relativos ao workspace) |
| `system` | não | `HCM` / `ACESSO` / `ERP` (status; catálogo builtins ainda é SENIOR) |
| `diagnostics.ignoreIds` | não | IDs ignorados só neste contexto |

Demo no repositório: [`exemplos/contexto-projeto/`](exemplos/contexto-projeto/).

---

### 4. Projeto de relatório (Gerador)

Se a pasta tem `relatorio.json` + `Definicao/` ou `Secoes/`, o escopo de símbolos fica **só nessa pasta** (não mistura relatórios irmãos).

**Criar do zero**

1. Command Palette → **LSP Workbench: Gerar Projeto de Relatório** (ou `/gerar-relatorio` no Agent).
2. Abra um `.lsp` dentro da pasta do relatório — completion isolado.
3. Para incluir funções compartilhadas: **Importar Contexto de…** (grava em `contextoExtra` no `relatorio.json`).
4. **Mostrar Escopo do Relatório** confirma root + extras.

**Importar dump “Visualizar Todas as Regras”**

1. Exporte no Senior o `.lsp` multi-trecho (linhas `Código: N - Descrição: …`).
2. Command Palette → **LSP Workbench: Importar Relatório** (ou `/importar-relatorio`), com o arquivo aberto ou escolhendo o path.
3. Informe sigla, descrição e pasta pai → gera a árvore ADR-007 (`Definicao/` + `Secoes/`).
4. `*_Na Impressão` entram só no README do projeto (não viram `.lsp`).

Exemplo de `relatorio.json`:

```json
{
  "codigo": "RDCGXXX",
  "descricao": "Cargas — exemplo",
  "detalhePrincipal": "Detalhe_1",
  "contextoExtra": ["../FUNCOES"]
}
```

Docs: [`docs/gerador-relatorios/`](docs/gerador-relatorios/).
---

### 5. Catálogo local de tabelas / campos

Sem catálogo, a extensão segue normal — só não sugere `E012FAM.` etc.

**Passo a passo:**

1. Gere um `catalog.json` a partir do dicionário Senior (R996/R998) — receitas em [`docs/banco-senior-base/`](docs/banco-senior-base/).
2. Em `.vscode/settings.json`, aponte o path:

```json
{
  "lsp.catalog.path": "docs/banco-senior-base/catalog.example.json"
}
```

3. Path absoluto também funciona: `"C:/dados/catalog.json"`.
4. Se `lsp.catalog.path` estiver vazio, a extensão tenta defaults:
   - `docs/banco-senior/.generated/catalog.json`
   - `docs/banco-senior-base/.generated/catalog.json`
5. Digite `E012FAM.` + Ctrl+Espaço para validar.

O dicionário da empresa **não** vem no Marketplace.

---

### 6. Formatação e demais settings

```json
{
  "[senior-lsp]": {
    "editor.formatOnSave": true
  },
  "lsp.format.enabled": true,
  "lsp.format.indentSize": 2,
  "lsp.format.braceStyle": "sameLine",
  "lsp.format.embeddedSql.enabled": false,
  "lsp.diagnostics.ignoreIds": [],
  "lsp.server.enabled": false
}
```

| Setting | Default | Uso |
|---------|---------|-----|
| `lsp.format.enabled` | `true` | Format Document |
| `lsp.format.indentSize` | `2` | 2 ou 4 espaços |
| `lsp.format.embeddedSql.enabled` | `false` | Formatar SQL em `ExecSql` / `.SQL` |
| `lsp.diagnostics.ignoreIds` | `[]` | Ex.: `["SYN009"]` |
| `lsp.server.enabled` | `false` | LS externo (avançado; exige build — ver docs de desenvolvedor) |

---

## Agent Cursor

| Command | Função |
|---------|--------|
| `/compilar-lsp` | Pré-compilação (IDs de regra) |
| `/depurar-lsp` | Fluxo de execução / cursores |
| `/formatar-lsp` | Layout |
| `/refatorar-lsp` | Estrutura / braces |
| `/gerar-relatorio` | Scaffold de relatório |
| `/importar-relatorio` | Dump multi-trecho → projeto ADR-007 |
| `/escopo-relatorio` | Escopo do relatório aberto |
| `/copiar-regra-relatorio` | Juntar regras `.lsp` |
| `/gerar-lista-lsp` · `/gerar-cursor-lsp` · `/gerar-http-lsp` | Geração guiada |

Skills: `@lsp-linguagem` · `@lsp-gerar` · `@lsp-compilar` · `@lsp-depurar` · `@lsp-revisar` · `@lsp-formatar` · `@lsp-refatorar` · `@lsp-logs` · `@lsp-banco` · `@lsp-contexto`

---

## Documentação

| Recurso | Onde |
|---------|------|
| Guia da extensão (Marketplace) | [`packages/lsp-workbench/README.md`](packages/lsp-workbench/README.md) |
| **Documentação para desenvolvedores** | [`docs/product/DEVELOPER.md`](docs/product/DEVELOPER.md) |
| Setup local / F5 | [`docs/product/LOCAL-TEST.md`](docs/product/LOCAL-TEST.md) |
| Linguagem LSP | [`docs/lsp/`](docs/lsp/) |
| Gerador de Relatórios | [`docs/gerador-relatorios/`](docs/gerador-relatorios/) |
| Catálogo base | [`docs/banco-senior-base/`](docs/banco-senior-base/) |
| Produto (PDR/ADR) | [`docs/product/`](docs/product/) |

Este monorepo também contém analyzer, language server e agent. Detalhes de pacotes, build e publicação: **[Documentação para desenvolvedores](docs/product/DEVELOPER.md)**.

---

## Licença e créditos

- Licença: [MIT](LICENSE)
- Atribuições: [`CREDITS.md`](CREDITS.md) (incl. referência ao [vscode-language-lsp](https://github.com/llutti/vscode-language-lsp))
