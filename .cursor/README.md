# Configuração Cursor – LSP Workbench (workspace)

Harness local do monorepo (espelha o Agent + Demóbile).

## Skills

Padrão `lsp-<ação>`: `lsp-linguagem`, `lsp-gerar`, `lsp-validar`, `lsp-formatar`, `lsp-refatorar`, `lsp-revisar`, `lsp-logs`, `lsp-demobile`, `lsp-banco`, `lsp-mcps`.

## Commands

`/validar-lsp`, `/formatar-lsp`, `/refatorar-lsp`, `/gerar-lista-lsp`, `/gerar-cursor-lsp`, `/gerar-http-lsp`, (+ utilitários Demóbile).

## Pacotes

| Pacote | Path |
|--------|------|
| Extensão | `packages/lsp-workbench` |
| Agent | `packages/lsp-workbench-agent` |
| Demóbile | `packages/lsp-workbench-demobile` (gitignored) |

Install Demóbile: `scripts/install-demobile-plugin.ps1`.
