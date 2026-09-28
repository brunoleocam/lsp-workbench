---
name: lsp-banco
description: Ao definir tabelas, colunas, chaves, JOINs, enums ou SQL Oracle do ERP Senior, ler o catalog.json resolvido pela extensão LSP Workbench antes de gerar LSP.
---

# Consulta ao modelo de dados – catalog.json

**Obrigatório** quando a tarefa envolver tabela (`E*`/`R*`/`USU_*`), coluna, JOIN, enum ou SQL Oracle em contexto LSP.

## Ordem de leitura

A extensão resolve o arquivo nesta ordem. Leia o primeiro que existir:

1. `lsp.catalog.path` em `.vscode/settings.json`.
2. No projeto, se existir: `docs/banco-senior/.generated/catalog.json`, depois `docs/banco-senior-base/.generated/catalog.json`, depois `docs/banco-senior-base/catalog.json`.

## Extensão IDE

- Completion `Tabela.Campo` e DEM001 usam esse mesmo `catalog.json`.
- Sem arquivo: dizer que não há dicionário. Não inventar coluna, enum nem JOIN.

## Anti-padrões

- Inventar coluna/enum sem ler o `catalog.json`.
- Procurar `docs/banco-senior` ou scripts de catálogo em outro repositório. Essas pastas não vão na instalação da extensão.
