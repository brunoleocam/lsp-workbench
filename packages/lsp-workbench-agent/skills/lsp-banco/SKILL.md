---
name: lsp-banco
description: Ao definir tabelas, colunas, chaves, JOINs, enums ou SQL Oracle do ERP Senior, consultar o catálogo local (docs/banco-senior-base e overlay docs/banco-senior se existir) antes de gerar LSP.
---

# Consulta ao modelo de dados – catálogo local

**Obrigatório** quando a tarefa envolver tabela (`E*`/`R*`/`USU_*`), coluna, JOIN, enum ou SQL Oracle em contexto LSP.

## Ordem de leitura

1. **`docs/banco-senior-base/README.md`** — gerar `catalog.json` (R996/R998) e contrato JSON.
2. Overlay de cliente (se existir no workspace): **`docs/banco-senior/`**.
3. Sem catálogo: dizer que não há dicionário local; orientar `scripts/catalog-from-r996-tsv.mjs` — **não inventar**.

## Extensão IDE

- Setting: `lsp.catalog.path` (PDR-009).
- Completion `Tabela.Campo` e DEM001 dependem do JSON local.

## Anti-padrões

- Inventar coluna/enum sem evidência local.
- Assumir overlay Demobile em clone público sem essas pastas.
