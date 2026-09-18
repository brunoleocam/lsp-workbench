# LSP Workbench

Monorepo da plataforma **LSP Workbench** — Linguagem Senior de Programação no Cursor/VS Code.

**Remoto:** https://github.com/brunoleocam/lsp-workbench

| Artefato | Pasta | Público |
|----------|-------|---------|
| Extensão IDE | [`packages/lsp-workbench`](packages/lsp-workbench) | Sim |
| Agent Cursor | [`packages/lsp-workbench-agent`](packages/lsp-workbench-agent) | Sim |
| Plugin Demóbile | `packages/lsp-workbench-demobile` | **Não** (gitignored) |

## Roadmap

1. **UX IDE** — [PDR-004](docs/product/pdr/PDR-004-paridade-ux.md) (**concluída**, extensão 0.2.0)
2. **Analyzer** — [PDR-005](docs/product/pdr/PDR-005-compiler-e-language-server.md) (foundation 0.2.0)
3. **Language Server + Worker** — PDR-005 (foundation 0.1.0, opt-in)
4. **Agent ↔ analyzer** — [PDR-006](docs/product/pdr/PDR-006-agent-analyzer.md)
5. **Bridge Demóbile → IDE** — [PDR-007](docs/product/pdr/PDR-007-demobile-catalog-bridge.md)

Arquitetura: [`docs/product/architecture/ARCHITECTURE.md`](docs/product/architecture/ARCHITECTURE.md)

Docs de engenharia: [`docs/product/`](docs/product/) (PDR, ADR, TDD, Eval).  
Extensão (0.2.0): [`packages/lsp-workbench/README.md`](packages/lsp-workbench/README.md) · [`CHANGELOG.md`](packages/lsp-workbench/CHANGELOG.md).  
Analyzer: [`packages/lsp-analyzer`](packages/lsp-analyzer).  
Language Server: [`packages/lsp-language-server`](packages/lsp-language-server).  
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
