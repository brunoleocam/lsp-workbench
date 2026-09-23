---
name: gerar-relatorio
description: Scaffold de projeto de relatório multi-arquivo (PDR-008 / ADR-007).
---

Gerar um **projeto de relatório** multi-arquivo no workspace.

## Entrada (pedir se faltar)

1. **Sigla** (ex.: `RDCGXXX`) — letras, números e `_`
2. **Descrição** / nome amigável
3. **Categoria** (opcional, ex.: `CG`)
4. **Seções** (opcional, vírgula) — ex.: `Detalhe_Transportadora, Subtitulo_CodTra, Total_Geral` (vazio → `Detalhe_1`)
5. Pasta destino (default: raiz do workspace)

## Saída

Árvore ADR-007: `relatorio.json`, `Definicao/`, `Secoes/<Nome>/` (uma pasta por seção), `README.md`.

Preferir o comando da extensão **LSP Workbench: Gerar Projeto de Relatório** se disponível.

Para importar um dump “Visualizar Todas as Regras”: **LSP Workbench: Importar Relatório** / `/importar-relatorio`.

Schemas: `docs/gerador-relatorios/schema/`. **Não** gerar layout visual nem `.GER`.

Próximos passos: **`@lsp-contexto`**, editar Pré-Seleção, **`/compilar-lsp`** na pasta do relatório.
