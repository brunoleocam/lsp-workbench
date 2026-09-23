---
name: escopo-relatorio
description: Mostra/explica o escopo do projeto de relatório aberto (paridade IDE).
---

Explicar o **escopo** do projeto de relatório em foco (paridade com **Mostrar Escopo do Relatório**).

## Passos

1. Localizar `relatorio.json` subindo diretórios a partir do arquivo ativo.
2. Listar:
   - root do relatório
   - pastas `Definicao/` e `Secoes/*`
   - `contextoExtra` (se houver)
3. Lembrar: Ctrl+Espaço / FUN009 na IDE usam **só** esse escopo (não irmãos).
4. Se não achar `relatorio.json`, sugerir `/gerar-relatorio` ou **`@lsp-contexto`** (modos arquivo/contexto).

Resposta curta em Markdown (árvore + extras).
