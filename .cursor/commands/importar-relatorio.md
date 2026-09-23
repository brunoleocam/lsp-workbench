---
name: importar-relatorio
description: Importa dump multi-trecho (Visualizar Todas as Regras) para árvore ADR-007.
---

Importar um arquivo no padrão do Gerador (**Código: N - Descrição: …**) e criar o projeto multi-arquivo.

## Entrada

1. Arquivo aberto que case o padrão **ou** pedir seleção de arquivo
2. Sigla (default = nome do arquivo sem extensão, ex. `RDCGXXX`)
3. Descrição
4. Pasta destino

## Saída

Mesma árvore de `/gerar-relatorio`: `relatorio.json`, `Definicao/`, `Secoes/<Nome>/`.

- `ModeloGerador_*` → `Definicao/*.lsp`
- `<Secao>_Antes/Depois Imprimir` → `Secoes/<Secao>/`
- `*_Na Impressão` → listado no README (fora do scaffold)

Preferir **LSP Workbench: Importar Relatório** se disponível.
