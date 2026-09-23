# PDR-008 — Projeto de Relatório (Gerador no Workbench)

| Campo | Valor |
|-------|-------|
| Status | Aceito — P0–P4 MVP |
| Data | 2026-09-21 |
| Commands | `/gerar-relatorio`, `/importar-relatorio`, `lspWorkbench.gerarRelatorio`, `lspWorkbench.importarRelatorio`, copiar regra / export multi-trecho |
| Relacionados | [ADR-007](../adr/ADR-007-formato-projeto-relatorio.md), [docs/gerador-relatorios](../../gerador-relatorios/), PDR-002, PDR-007 |

## Problema

Regras de relatório no Senior vivem em dezenas de eventos (Pré-Seleção, Detalhe Antes/Depois, …). O Workbench tratava `.lsp` isolado; o dev não tinha manifesto de Entrada/seções nem validação de API no evento certo. Não há descompilação útil de `.GER`.

## Decisão

1. **Projeto multi-arquivo** por relatório (`RDCGXXX/`) com `relatorio.json`, `Definicao/` e `Secoes/<Nome>/`.
2. JSON **só semântico** (Tabela Base, Classificação, `E*`). Layout visual fora do MVP.
3. Scaffold via **`/gerar-relatorio`** / **`lspWorkbench.gerarRelatorio`** (lista de seções) e import via **`/importar-relatorio`** / **`lspWorkbench.importarRelatorio`** (dump multi-trecho).
4. Diagnostics **GER*** + completion `Tabela.Campo` via catálogo local (PDR-007).
5. Cópia manual para o Senior (clipboard / export multi-trecho); sem round-trip `.GER`.

## Formato

Ver [ADR-007](../adr/ADR-007-formato-projeto-relatorio.md) e schemas em [`docs/gerador-relatorios/schema/`](../../gerador-relatorios/schema/).

Validação: `report-scaffold.test.ts` (árvore em temp) + smokes GER* no MANIFEST.

## Critérios de aceite

| ID | Critério | Estado |
|----|----------|--------|
| REL-01 | `/gerar-relatorio` ou comando VS Code cria árvore válida | MVP |
| REL-02 | Analyzer resolve evento pelo path e emite GER* | MVP |
| REL-03 | `E*` de `Entrada.json` não geram SEM001 falso | MVP |
| REL-04 | Completion de colunas da `tabelaBase` quando catálogo existe | MVP |
| REL-05 | Copiar regra atual / export multi-trecho | MVP |
| REL-06 | Sem editor visual / descompilador `.GER` | Explicitamente fora |
| REL-07 | Importar dump “Visualizar Todas as Regras” → árvore ADR-007 | MVP |

## IDs GER*

Documentados em [`regras-estaticas-lsp.md`](../regras-estaticas-lsp.md) (seção GER).
