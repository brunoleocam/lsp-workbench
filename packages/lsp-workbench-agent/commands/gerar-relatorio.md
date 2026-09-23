---
name: gerar-relatorio
description: Scaffold de projeto de relatório multi-arquivo (PDR-008 / ADR-007).
---

Gerar um **projeto de relatório** multi-arquivo no workspace.

## Entrada (pedir se faltar)

1. **Sigla** (ex.: `RDCG183`) — letras, números e `_`
2. **Descrição** / nome amigável
3. **Categoria** (opcional, ex.: `CG`)
4. Pasta destino (default: raiz do workspace)

## Saída

Árvore ADR-007: `relatorio.json`, `Definicao/`, `Secoes/Detalhe_1/`, `README.md`.

Preferir o comando da extensão **LSP Workbench: Gerar Projeto de Relatório** se disponível.

Schemas: `docs/gerador-relatorios/schema/`. **Não** gerar layout visual nem `.GER`.

Próximos passos: **`@lsp-contexto`**, editar Pré-Seleção, **`/compilar-lsp`** na pasta do relatório.
