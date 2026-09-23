# Configuracao Cursor - LSP Workbench (workspace)

Harness local do monorepo (espelha o Agent publico).

## Skills

Padrao `lsp-<acao>`: `lsp-linguagem`, `lsp-gerar`, `lsp-compilar`, `lsp-depurar`, `lsp-revisar`, `lsp-formatar`, `lsp-refatorar`, `lsp-logs`, `lsp-banco`, `lsp-contexto`, `lsp-mcps`.

| Rapido | Estatico | Fluxo |
|--------|----------|-------|
| `@lsp-revisar` | `/compilar-lsp` | `/depurar-lsp` |

## Commands

`/compilar-lsp`, `/depurar-lsp`, `/formatar-lsp`, `/refatorar-lsp`, `/gerar-lista-lsp`, `/gerar-cursor-lsp`, `/gerar-http-lsp`, `/gerar-relatorio`, `/escopo-relatorio`, `/copiar-regra-relatorio`.

## Pacotes

| Pacote | Path |
|--------|------|
| Extensao | `packages/lsp-workbench` |
| Agent | `packages/lsp-workbench-agent` |
| Analyzer | `packages/lsp-analyzer` |
| Language Server | `packages/lsp-language-server` |

Mantenedores: [`docs/product/DEVELOPER.md`](../docs/product/DEVELOPER.md).
