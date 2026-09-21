# PDR-007 — Bridge catálogo local → IDE

| Campo | Valor |
|-------|-------|
| Status | **Concluído** (P0–P2) |
| Data | 2026-09-18 |
| Artefato | Extensão (consumidor) + script gerador |
| Relacionados | ADR-001, PDR-003 |

## Problema

O repo público não versiona dicionário Oracle / regras de cliente. Sem um índice local, a IDE não completa nem alerta tabelas E*/R*/USU_*.

## Decisão

1. Script gera JSON **local** (gitignored) a partir de **base pública** + **overlay de cliente** ([PDR-009](PDR-009-catalogo-base-overlay.md)).
2. Extensão lê o caminho via Settings; se vazio, tenta overlay gerado e depois base gerada.
3. Se nenhum arquivo existir, completion/diagnóstico de catálogo ficam no-op (sem erro).

## Entregue

| Item | Artefato |
|------|----------|
| Gerador | `scripts/build-local-catalog.mjs` (merge base + overlay) |
| Contrato / exemplo | `docs/banco-senior-base/` (`catalog.example.json`; `catalog.json` gitignore) |
| Overlay cliente | `docs/banco-senior/` (gitignore) |
| Completion | tabelas/colunas do JSON |
| DEM001 | tabela citada ausente do catálogo |

## Contrato JSON

Contrato: `version`, `tables[]`, `columns[]`, `sources[]` — implementação no domínio da extensão (`packages/lsp-workbench/src/domain/`).

Ver evolução em [PDR-009](PDR-009-catalogo-base-overlay.md).