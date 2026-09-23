# Agentes — LSP Workbench

Monorepo **LSP Workbench**: extensão IDE + Agent Cursor + analyzer / language server.

- Setup (usuário): [`README.md`](README.md)
- Mantenedores: [`docs/product/DEVELOPER.md`](docs/product/DEVELOPER.md)
- Cursor local: [`.cursor/README.md`](.cursor/README.md)
- Produto: [`docs/product/`](docs/product/)
- Arquitetura: [`docs/product/architecture/ARCHITECTURE.md`](docs/product/architecture/ARCHITECTURE.md)
- Roadmap: [PDR-004](docs/product/pdr/PDR-004-paridade-ux.md) · [PDR-005](docs/product/pdr/PDR-005-compiler-e-language-server.md) · [PDR-006](docs/product/pdr/PDR-006-agent-analyzer.md) · [PDR-008](docs/product/pdr/PDR-008-projeto-relatorio.md) · [PDR-010](docs/product/pdr/PDR-010-escopo-projeto-relatorio.md) · [ADR-006](docs/product/adr/ADR-006-roadmap-opcoes-1-2-3.md) · [ADR-007](docs/product/adr/ADR-007-formato-projeto-relatorio.md)

## Skills (`lsp-<ação>`)

| Skill | Quando |
|-------|--------|
| [lsp-linguagem](.cursor/skills/lsp-linguagem/SKILL.md) | Sintaxe / padrões da linguagem |
| [lsp-gerar](.cursor/skills/lsp-gerar/SKILL.md) | Fluxo antes/depois de gerar `.lsp` |
| [lsp-compilar](.cursor/skills/lsp-compilar/SKILL.md) | Pré-compilação com IDs (ex-`lsp-validar`) |
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
| `docs/gerador-relatorios/` | Modelo mental do Gerador de Relatórios | público |
| `docs/banco-senior-base/` | Contrato/exemplo + SQL para gerar catálogo **local** | público (sem `catalog.json` completo) |
| `docs/banco-senior/` | Overlay de cliente (Demobile / empresa) | **gitignore** |
| `docs/senior/` | Regras / fluxo local | **gitignore** |

## Segurança

Não publicar `docs/banco-senior/` nem `docs/senior/` em remoto público.  
Não versionar `docs/banco-senior-base/catalog.json` (dicionário completo); no git só o exemplo + receitas ([PDR-009](docs/product/pdr/PDR-009-catalogo-base-overlay.md)).

## Licença e reuso

- MIT: [`LICENSE`](LICENSE) (créditos obrigatórios ao redistribuir).
- Terceiros / referência ao llutti: [`CREDITS.md`](CREDITS.md) · política em [PDR-001](docs/product/pdr/PDR-001-plataforma-lsp.md).

