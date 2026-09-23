---
name: copiar-regra-relatorio
description: Junta o .lsp do evento ativo (ou todos) para clipboard/arquivo — paridade IDE.
---

Preparar texto das **regras** do projeto de relatório (paridade **Copiar Regra** / **Visualizar Todas as Regras**).

## Entrada

- Padrão: arquivo `.lsp` do evento em foco (ex. `Pre-Selecao.lsp`).
- Se o usuário pedir “todas”: concatenar todos os `.lsp` sob o root do `relatorio.json`, com cabeçalho por path.

## Saída

1. Bloco Markdown ou arquivo temporário com o conteúdo.
2. Avisar que a IDE também tem o comando Palette correspondente.
3. Sugerir **`/compilar-lsp`** na pasta do relatório antes de colar no Gerador Senior.

**Não** gerar `.GER`.
