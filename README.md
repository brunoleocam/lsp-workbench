<br />
<p align="center">
  <a href="https://github.com/brunoleocam/lsp-workbench">
    <img src="https://github.com/brunoleocam/lsp-workbench/raw/main/assets/icon.png" alt="Logo" width="160" height="160">
  </a>

  <h2 align="center">LSP Workbench</h2>

  <p align="center">
    Suporte à <b>Linguagem Senior de Programação</b> no Cursor e no Visual Studio Code —
    extensão IDE, Agent e documentação da linguagem.
  </p>

  <p align="center" style="display:flex;gap:7px;justify-content:center;align-items:center;">
    <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/brunoleocam/lsp-workbench">
  </p>
</p>

Remoto: https://github.com/brunoleocam/lsp-workbench

## Status (0.2.0)

| Artefato | Versão |
|----------|--------|
| Extensão `packages/lsp-workbench` | **0.2.0** |
| Analyzer `@lsp-workbench/analyzer` | **0.3.0** |
| Language Server (opt-in) | **0.2.0** |
| Agent `packages/lsp-workbench-agent` | PDR-006 |

Roadmap do motor (PDR-003…007 / ADR-006): **foundation concluída**. Relatórios: PDR-008 + PDR-010 (escopo por pasta). Próximo foco público: Marketplace / catálogos multi-sistema.

A extensão cobre o **subconjunto estático** de regras (SYN/RUL/FUN/SEM/SQL + ANL/DEM/GER) em [`docs/product/regras-estaticas-lsp.md`](docs/product/regras-estaticas-lsp.md) — não o manual completo em [`docs/lsp/`](docs/lsp/).

## Visão geral

- colorização, snippets e semantic tokens para `.lsp` / `.lspt`
- autocompletar (funções, variáveis, membros de `Cursor` / `Lista`)
- diagnósticos e quick fixes (Ctrl+Espaço / Ctrl+.)
- formatação e refactors
- contextos multiarquivo e modo arquivo único
- **projeto de relatório** multi-arquivo (Gerador Senior) com escopo automático por pasta
- Agent Cursor alinhado às regras de ouro

## Extensão IDE

Language id: **`senior-lsp`** · **`.lsp`**, **`.lspt`**

- Formatação, diagnostics, QF, completion/hover (~214 builtins)
- Semantic tokens, Outline, snippets
- Contextos (`lsp.contexts`) e escopo de símbolos
- Projeto de relatório: scaffold, GER*, escopo implícito + `contextoExtra`
- Refactors e SQL embutido opt-in
- Language Server opt-in (`lsp.server.enabled`, default `false`)

## Agent Cursor

| Command | Função |
|---------|--------|
| `/compilar-lsp` | Pré-compilação: regras + sintaxe + semântica (IDs) |
| `/formatar-lsp` | Layout canônico |
| `/refatorar-lsp` | Estrutura, braces, relatório de lógica |
| `/gerar-relatorio` | Scaffold de projeto de relatório (PDR-008) |
| `/gerar-lista-lsp` | Lista dinâmica |
| `/gerar-cursor-lsp` | Cursor (+ SQL) |
| `/gerar-http-lsp` | HTTP + parse JSON/XML |

Skills: `@lsp-linguagem` · `@lsp-gerar` · `@lsp-compilar` · `@lsp-formatar` · `@lsp-refatorar` · `@lsp-revisar` · `@lsp-logs`

## Configurar (dev)

```powershell
cd packages\lsp-analyzer
npm install
npm run compile
cd ..\lsp-workbench
npm install
npm test
```

Abra a **raiz do monorepo** → **Run and Debug** → **Run LSP Workbench Extension** (F5).

Setup detalhado: [docs/product/LOCAL-TEST.md](docs/product/LOCAL-TEST.md) · mantenedores: [docs/product/DEVELOPER.md](docs/product/DEVELOPER.md).

### Associate `.txt` de regra (opcional)

```json
{
  "files.associations": {
    "**/HR/HR*.txt": "senior-lsp",
    "**/TR/TR*.txt": "senior-lsp"
  }
}
```

## Usar

### Arquivo único

Abra um `.lsp` / `.lspt` — ativa `senior-lsp` sem config extra.

### Contextos multiarquivo

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
    }
  ]
}
```

### Projeto de relatório (Gerador)

Pasta com `relatorio.json` + `Definicao/` ou `Secoes/` — o Ctrl+Espaço fica **só nessa pasta** (não mistura irmãos como `RDCG183` / `RDCG184`).

```json
{
  "codigo": "RDCG183",
  "descricao": "Cargas — exemplo",
  "detalhePrincipal": "Detalhe_1",
  "contextoExtra": ["../FUNCOES"]
}
```

| Comando (Palette) | Função |
|-------------------|--------|
| **Gerar Projeto de Relatório** | Scaffold da árvore |
| **Importar Contexto de…** | Pasta/arquivo → `contextoExtra` do relatório aberto |
| **Exportar Contexto para…** | Escopo aberto → outro relatório ou `lsp.contexts` |
| **Mostrar Escopo do Relatório** | Root + extras ativos |
| **Copiar Regra** / **Visualizar Todas as Regras** | Clipboard do evento / juntar todos os `.lsp` num arquivo |

Scaffold: comando **Gerar Relatório** / `/gerar-relatorio` · docs: [`docs/gerador-relatorios/`](docs/gerador-relatorios/) · [PDR-008](docs/product/pdr/PDR-008-projeto-relatorio.md) · [PDR-010](docs/product/pdr/PDR-010-escopo-projeto-relatorio.md).

### Catálogo local de tabelas (sem dados de cliente)

A extensão **não** embute dicionário Senior. Gere o seu `catalog.json` a partir do banco (R996/R998):

```powershell
# Ver docs/banco-senior-base/consultar-dicionario.sql
node scripts/catalog-from-r996-tsv.mjs --in r996.tsv --out docs/banco-senior-base/catalog.json
```

Detalhes: [`docs/banco-senior-base/`](docs/banco-senior-base/) · setting opcional `lsp.catalog.path` · [PDR-009](docs/product/pdr/PDR-009-catalogo-base-overlay.md).

### Formatação / SQL / Language Server

```json
{
  "lsp.format.enabled": true,
  "lsp.format.indentSize": 2,
  "lsp.format.embeddedSql.enabled": false,
  "lsp.server.enabled": false
}
```

## Docs

| Recurso | Onde |
|---------|------|
| Exemplos | [`exemplos/`](exemplos/) |
| Linguagem | [`docs/lsp/`](docs/lsp/) |
| Gerador de Relatórios | [`docs/gerador-relatorios/`](docs/gerador-relatorios/) |
| Produto (PDR/ADR) | [`docs/product/`](docs/product/) |
| Regras estáticas | [`docs/product/regras-estaticas-lsp.md`](docs/product/regras-estaticas-lsp.md) |

## Licença e créditos

- Licença: [MIT](LICENSE) — cópia/modificação/redistribuição exigem manter o aviso de copyright e o texto da licença.
- Atribuições a terceiros (incl. referência ao [vscode-language-lsp](https://github.com/llutti/vscode-language-lsp) de Luciano Cargnelutti): [`CREDITS.md`](CREDITS.md).
