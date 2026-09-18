# PDR-007 — Bridge catálogo local → IDE

| Campo | Valor |
|-------|-------|
| Status | **Concluído** (P0–P2) |
| Data | 2026-09-18 |
| Artefato | Extensão (consumidor) + script gerador + plugin local gitignored |
| Relacionados | ADR-001, PDR-003, `lsp.demobile.catalogPath` |

## Problema

O repo público não versiona dicionário Oracle / regras de cliente. Sem um índice local, a IDE não completa nem alerta tabelas E*/R*/USU_*.

## Decisão

1. Script gera JSON **local** (gitignored) a partir de `docs/banco-senior` quando existir.
2. Extensão lê `lsp.demobile.catalogPath` (default: `docs/banco-senior/.generated/catalog.json`).
3. Plugin local (gitignored) pode expor commands Cursor; não entra no remoto público.

## Entregue

| Item | Artefato |
|------|----------|
| Gerador | `scripts/build-local-catalog.mjs` |
| Completion | tabelas do JSON (no-op se ausente) |
| DEM001 | tabela citada ausente do catálogo |
| Commands | no package local `lsp-workbench-demobile` (gitignore) |

## Contrato JSON

Ver comentários em `packages/lsp-workbench/src/domain/demobile-catalog.ts` (version, tables[], columns[]).
