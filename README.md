# LSP Workbench

![LSP Workbench](assets/icon.png)

**Linguagem Senior de Programação** no Cursor e no VS Code — extensão IDE, Agent e documentação da linguagem.

Remoto: https://github.com/brunoleocam/lsp-workbench

## Status (0.2.0)

| Artefato | Versão |
|----------|--------|
| Extensão `packages/lsp-workbench` | **0.2.0** |
| Analyzer `@lsp-workbench/analyzer` | **0.3.0** |
| Language Server (opt-in) | **0.2.0** |
| Agent `packages/lsp-workbench-agent` | PDR-006 |

Roadmap do motor (PDR-003…007 / ADR-006): **foundation concluída**. Próximo foco público: Marketplace / catálogos multi-sistema.

A extensão cobre o **subconjunto estático** de regras (SYN/RUL/FUN/SEM/SQL + ANL/DEM) em [`docs/product/regras-estaticas-lsp.md`](docs/product/regras-estaticas-lsp.md) — não o manual `lsp.md` inteiro.

## Visão geral

- colorização, snippets e semantic tokens para `.lsp` / `.lspt`
- autocompletar (funções, variáveis, membros de `Cursor` / `Lista`)
- diagnósticos e quick fixes (Ctrl+Espaço / Ctrl+.)
- formatação e refactors
- contextos multiarquivo e modo arquivo único
- Agent Cursor alinhado às regras de ouro

## Extensão IDE

Language id: **`senior-lsp`** · **`.lsp`**, **`.lspt`**

- Formatação, diagnostics, QF, completion/hover (~214 builtins)
- Semantic tokens, Outline, snippets
- Contextos (`lsp.contexts`) e escopo de símbolos
- Refactors e SQL embutido opt-in
- Language Server opt-in (`lsp.server.enabled`, default `false`)

## Agent Cursor

| Command | Função |
|---------|--------|
| `/validar-lsp` | Regras + sintaxe + semântica (IDs) |
| `/formatar-lsp` | Layout canônico |
| `/refatorar-lsp` | Estrutura, braces, relatório de lógica |
| `/gerar-lista-lsp` | Lista dinâmica |
| `/gerar-cursor-lsp` | Cursor (+ SQL) |
| `/gerar-http-lsp` | HTTP + parse JSON/XML |

Skills: `@lsp-linguagem` · `@lsp-gerar` · `@lsp-validar` · `@lsp-formatar` · `@lsp-refatorar` · `@lsp-revisar` · `@lsp-logs`

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
| Produto (PDR/ADR) | [`docs/product/`](docs/product/) |
| Regras estáticas | [`docs/product/regras-estaticas-lsp.md`](docs/product/regras-estaticas-lsp.md) |
