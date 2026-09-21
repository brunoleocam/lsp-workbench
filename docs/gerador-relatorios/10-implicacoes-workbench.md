# 10 — Implicações para o LSP Workbench

Inventário evoluiu para **PDR-008** / **ADR-007** (projeto multi-arquivo).

| Doc | Papel |
|-----|--------|
| [PDR-008](../product/pdr/PDR-008-projeto-relatorio.md) | Produto: scaffold, GER*, completion, copiar |
| [ADR-007](../product/adr/ADR-007-formato-projeto-relatorio.md) | Formato de pastas + JSON semântico |
| [schema/](schema/) | `relatorio` / `entrada` / `secao` |

## Problema

Um relatório não é “um `.lsp`”. É manifesto + N eventos. O Workbench precisa de **contexto de relatório**.

## Decisão de produto (MVP)

1. Pasta `<CODIGO>/` com `Definicao/` + `Secoes/<Nome>/`.
2. JSON só semântico (Tabela Base, Entrada, Classificação).
3. Diagnostics **GER*** + `E*` conhecidos + completion de colunas.
4. Copiar para o Senior manualmente; sem `.GER`.

## Oportunidades (status)

| Item | Status |
|------|--------|
| Outline / multi-arquivo | MVP (pastas + README) |
| Validação API no evento | GER001–GER004 |
| Nomes de seção | GER003 / GER004 |
| `E*` | via `Entrada.json` → `knownGlobals` |
| `Cancel` contextual | hover docs; RUL019 já cobre literais |
| Snippets scaffold | `/gerar-relatorio` + comando VS Code |
| Dual-pane / sync Senior | Fora |
| Descompilador `.GER` | Fora |

## Critério de valor

1. Achar a regra certa (arquivo por evento).
2. Evitar API no evento errado.
3. Nomes de seção/`E*` consistentes + campos do banco local.
