# Agentes — LSP Workbench

Monorepo **LSP Workbench**: extensão IDE + Agent Cursor + analyzer / language server.

- Setup (usuário): [`README.md`](README.md)
- Mantenedores: [`docs/product/DEVELOPER.md`](docs/product/DEVELOPER.md)
- Cursor local: [`.cursor/README.md`](.cursor/README.md)
- Produto: [`docs/product/`](docs/product/)
- Arquitetura: [`docs/product/architecture/ARCHITECTURE.md`](docs/product/architecture/ARCHITECTURE.md)
- Roadmap: [PDR-004](docs/product/pdr/PDR-004-paridade-ux.md) · [PDR-005](docs/product/pdr/PDR-005-compiler-e-language-server.md) · [PDR-006](docs/product/pdr/PDR-006-agent-analyzer.md) · [ADR-006](docs/product/adr/ADR-006-roadmap-opcoes-1-2-3.md)

## Skills (`lsp-<ação>`)

| Skill | Quando |
|-------|--------|
| [lsp-linguagem](.cursor/skills/lsp-linguagem/SKILL.md) | Sintaxe / padrões da linguagem |
| [lsp-gerar](.cursor/skills/lsp-gerar/SKILL.md) | Fluxo antes/depois de gerar `.lsp` |
| [lsp-validar](.cursor/skills/lsp-validar/SKILL.md) | Validação com IDs |
| [lsp-formatar](.cursor/skills/lsp-formatar/SKILL.md) | Só layout |
| [lsp-refatorar](.cursor/skills/lsp-refatorar/SKILL.md) | Refactor + relatório de lógica |
| [lsp-revisar](.cursor/skills/lsp-revisar/SKILL.md) | Checklist pré-compilação |
| [lsp-logs](.cursor/skills/lsp-logs/SKILL.md) | Logs `vaMosLog` |
| [lsp-banco](.cursor/skills/lsp-banco/SKILL.md) | Tabelas/campos Senior (`docs/banco-senior`, se presente) |
| [lsp-mcps](.cursor/skills/lsp-mcps/SKILL.md) | Ponte MCP do workspace |

## Docs

| Pasta | Uso | Git |
|-------|-----|-----|
| `docs/lsp/` | Linguagem | público |
| `docs/product/` | PDR/ADR/TDD/Eval | público |
| `docs/banco-senior/` | Modelo de dados local | **gitignore** |
| `docs/senior/` | Regras / fluxo local | **gitignore** |

## Segurança

Não publicar `docs/banco-senior/` nem `docs/senior/` em remoto público.
