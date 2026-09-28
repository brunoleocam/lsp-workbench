# Configuracao Cursor - LSP Workbench (workspace)

Harness local do monorepo (espelha o Agent publico).

O GitHub Copilot no VS Code nao le esta pasta. O espelho fica em [`.github/`](../.github/copilot-instructions.md) (instrucoes, skills e prompts). Depois de editar rules, skills ou commands, rode `node scripts/sync-copilot-from-cursor.mjs`.

## Skills

Padrao `lsp-<acao>`: `lsp-linguagem`, `lsp-gerar`, `lsp-compilar`, `lsp-depurar`, `lsp-revisar`, `lsp-formatar`, `lsp-refatorar`, `lsp-logs`, `lsp-banco`, `lsp-contexto`, `lsp-mcps`.

| Rapido | Estatico | Fluxo |
|--------|----------|-------|
| `@lsp-revisar` | `/compilar-lsp` | `/depurar-lsp` |

## Commands

`/compilar-lsp`, `/depurar-lsp`, `/formatar-lsp`, `/refatorar-lsp`, `/gerar-lista-lsp`, `/gerar-cursor-lsp`, `/gerar-http-lsp`, `/gerar-relatorio`, `/escopo-relatorio`, `/copiar-regra-relatorio`, `/configurar-workspace`.

## Pacotes

| Pacote | Path |
|--------|------|
| Extensao | `packages/lsp-workbench` |
| Agent | `packages/lsp-workbench-agent` |
| Analyzer | `packages/lsp-analyzer` |
| Language Server | `packages/lsp-language-server` |

Mantenedores: [`docs/product/DEVELOPER.md`](../docs/product/DEVELOPER.md).
