---
name: lsp-banco
description: Ao definir tabelas, colunas, chaves, JOINs, enumerações ou SQL Oracle do ERP Senior, consultar o catálogo local (docs/banco-senior-base e overlay docs/banco-senior se existir) antes de responder ou gerar LSP.
---

# Consulta ao modelo de dados – catálogo local

**Obrigatório** sempre que a tarefa envolver:

- Nome de **tabela** (ex.: `E120PED`, `E140IPV`, `USU_*`, `R996*`),
- **Colunas**, tipos, chaves primárias/estrangeiras,
- **JOINs**, filtros por empresa/filial/pedido/NF/título,
- **Enumerações** / listas de valores de campo,
- **SQL** (SELECT/INSERT/UPDATE) contra o Oracle do Senior em contexto LSP.

**Ferramenta/MCP:** nenhuma — evidência nos arquivos do workspace.

## Ordem de leitura (mínimo útil)

1. **`docs/banco-senior-base/README.md`** — como gerar `catalog.json` (R996/R998) e contrato do JSON.
2. Se existir overlay de cliente (gitignore no repo público):
   - **`docs/banco-senior/README.md`** e markdowns de domínio/tabelas.
3. Sem `catalog.json` / overlay: dizer que não há dicionário local; não inventar colunas — orientar a gerar via `scripts/catalog-from-r996-tsv.mjs` (ver `docs/banco-senior-base/`).

## Integração com a extensão

- Setting: `lsp.catalog.path` (opcional; senão resolve paths PDR-009).
- Completion `Tabela.Campo` e DEM001 dependem do catálogo local.

## O que não fazer

- Inventar coluna, tipo ou valor de enum sem evidência no catálogo/markdown local.
- Assumir overlay Demobile ou de outro cliente em clone público sem essas pastas.
