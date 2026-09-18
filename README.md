# LSP Workbench

Monorepo da plataforma **LSP Workbench** — Linguagem Senior de Programação no Cursor/VS Code.

**Remoto:** https://github.com/brunoleocam/lsp-workbench

| Artefato | Pasta | Público |
|----------|-------|---------|
| Extensão IDE | [`packages/lsp-workbench`](packages/lsp-workbench) | Sim |
| Agent Cursor | [`packages/lsp-workbench-agent`](packages/lsp-workbench-agent) | Sim |
| Plugin Demóbile | `packages/lsp-workbench-demobile` | **Não** (gitignored) |

## Roadmap (1 → 2 → 3)

1. **Paridade UX** — [PDR-004](docs/product/pdr/PDR-004-paridade-ux.md)
2. **Compiler** — [PDR-005](docs/product/pdr/PDR-005-compiler-e-language-server.md)
3. **Language Server + Worker** — PDR-005

Arquitetura: [`docs/product/architecture/ARCHITECTURE.md`](docs/product/architecture/ARCHITECTURE.md)

Docs de engenharia: [`docs/product/`](docs/product/) (PDR, ADR, TDD, Eval).  
Extensão (0.2.0): [`packages/lsp-workbench/README.md`](packages/lsp-workbench/README.md) · [`CHANGELOG.md`](packages/lsp-workbench/CHANGELOG.md).  
Analyzer (Opção 2): [`packages/lsp-analyzer`](packages/lsp-analyzer).  
Language Server (Opção 3 foundation, default off): [`packages/lsp-language-server`](packages/lsp-language-server).  
Linguagem: [`docs/lsp/`](docs/lsp/). Exemplos: [`exemplos/`](exemplos/).

Config compartilhada: [`lsp.config.json`](lsp.config.json).

## Teste local

Guia: [`docs/product/LOCAL-TEST.md`](docs/product/LOCAL-TEST.md).

Marca (logo): [`assets/`](assets/).

## Setup rápido (público)

1. Abra esta pasta no Cursor.
2. Extensão: `cd packages/lsp-workbench && npm install && npm test`
3. Agent: skills/commands em `.cursor/` ou plugin agent local.

## Setup Demóbile (interno)

`docs/banco-senior/` e `docs/senior/` são **privados** (`.gitignore`).

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-demobile-plugin.ps1
```

## Commands Agent

`/validar-lsp` · `/formatar-lsp` · `/refatorar-lsp` · `/gerar-lista-lsp` · `/gerar-cursor-lsp` · `/gerar-http-lsp`

## Mapa Agent

Ver [`AGENTS.md`](AGENTS.md).
