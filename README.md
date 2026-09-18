# LSP Workbench

![LSP Workbench](assets/icon.png)

**Linguagem Senior de Programação** no Cursor e no VS Code — extensão IDE, Agent e documentação da linguagem.

Remoto: https://github.com/brunoleocam/lsp-workbench

## Visão geral

O LSP Workbench reúne, no fluxo normal de edição e no chat do Cursor:

- colorização, snippets e semantic tokens para `.lsp` / `.lspt`
- autocompletar (funções, variáveis, membros de `Cursor` / `Lista`)
- diagnósticos com IDs canônicos (SYN/RUL/FUN/SEM/SQL + ANL*)
- formatação (`Format Document`) e refactors
- contextos multiarquivo e modo arquivo único
- Agent Cursor com commands e skills alinhados às regras de ouro da linguagem

## Principais recursos

### Extensão IDE (`packages/lsp-workbench`, 0.2.0)

Language id: **`senior-lsp`** · extensões: **`.lsp`**, **`.lspt`**

- Formatação canônica (indentação, braces, parâmetros)
- Diagnósticos e quick fixes
- Completion e hover de builtins SENIOR
- Semantic tokens, Outline, snippets (~30)
- Contextos nomeados (`lsp.contexts`) e escopo de símbolos
- Refactors: envolver com `Se` / `Enquanto` / `Para` / bloco; `Inicio/Fim` ↔ `{ }`; `\` → `+`
- SQL embutido opt-in (formatação em `ExecSql` / `.SQL` / `SQL_DefinirComando`)
- Language Server opt-in (`lsp.server.enabled`, default `false`)

### Agent Cursor (`packages/lsp-workbench-agent`)

| Command | Função |
|---------|--------|
| `/validar-lsp` | Regras + sintaxe + semântica (IDs) |
| `/formatar-lsp` | Layout canônico |
| `/refatorar-lsp` | Estrutura, braces, relatório de lógica |
| `/gerar-lista-lsp` | Lista dinâmica a partir dos campos |
| `/gerar-cursor-lsp` | Cursor simples/completo (+ SQL) |
| `/gerar-http-lsp` | Chamada HTTP + parse JSON/XML |

Skills: `@lsp-linguagem` · `@lsp-gerar` · `@lsp-validar` · `@lsp-formatar` · `@lsp-refatorar` · `@lsp-revisar` · `@lsp-logs`

## Como configurar

### 1. Extensão (desenvolvimento local)

```powershell
cd packages\lsp-workbench
npm install
npm test
```

Abra a **raiz do monorepo** no Cursor/VS Code → painel **Run and Debug** → **Run LSP Workbench Extension** (F5).

Detalhes: [docs/product/LOCAL-TEST.md](docs/product/LOCAL-TEST.md).

### 2. Agent

Instale o plugin local (junction) a partir de `packages/lsp-workbench-agent` (ver [LOCAL-TEST.md](docs/product/LOCAL-TEST.md)) e use **Developer: Reload Window**.

No próprio monorepo, o harness em [`.cursor/`](.cursor/) já espelha skills e commands públicos.

### 3. Associate `.txt` de regra (opcional)

```json
{
  "files.associations": {
    "**/HR/HR*.txt": "senior-lsp",
    "**/TR/TR*.txt": "senior-lsp"
  }
}
```

## Como usar

### Arquivo único

Abra um `.lsp` ou `.lspt` — a extensão ativa `senior-lsp` sem configuração extra.

### Contextos multiarquivo

Exemplo em `.vscode/settings.json`:

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

Comandos: **LSP Workbench: Criar/Editar/Remover Contexto**, **Alternar Escopo de Símbolos**, **Selecionar Sistema (Fallback)**.

### Formatação e SQL embutido

```json
{
  "lsp.format.enabled": true,
  "lsp.format.indentSize": 2,
  "lsp.format.embeddedSql.enabled": false,
  "lsp.format.embeddedSql.dialect": "sql"
}
```

### Language Server (opt-in)

```powershell
cd packages\lsp-analyzer
npm install
npm run compile
cd ..\lsp-language-server
npm install
npm test
```

Settings: `lsp.server.enabled` = `true` → **Reload Window**. Diagnósticos ANL* passam a ter source `LSP Analyzer`.

## Exemplos e linguagem

| Recurso | Onde |
|---------|------|
| Exemplos `.lsp` | [`exemplos/`](exemplos/) |
| Docs da linguagem | [`docs/lsp/`](docs/lsp/) |
| Config compartilhada | [`lsp.config.json`](lsp.config.json) |

## Para mantenedores

Arquitetura, build, changelog de plataforma e PDRs/ADRs: [`docs/product/`](docs/product/) · guia do desenvolvedor: [`docs/product/DEVELOPER.md`](docs/product/DEVELOPER.md).
