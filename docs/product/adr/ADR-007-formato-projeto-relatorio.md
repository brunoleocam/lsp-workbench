# ADR-007 — Formato multi-arquivo de projeto de relatório

## Status

Aceito (2026-09-21)

## Contexto

O export Senior multi-trecho (`Código: N - Descrição: …`) é legível, mas ruim como fonte primária de edição. Layout e `.GER` não são descompiláveis de forma útil. Precisamos de um formato no workspace que:

- separe eventos em arquivos;
- declare Entrada e seções para validação/completion;
- permita copiar cada regra para o Gerador Senior.

## Decisão

### Árvore canônica

```text
<CODIGO>/
  relatorio.json
  Definicao/
    Entrada.json
    Funcoes-Globais.lsp
    Inicializacao.lsp
    Pre-Selecao.lsp
    Selecao.lsp
    Finalizacao.lsp
    Imprimir-Pagina.lsp
  Secoes/
    <NomeSecao>/
      secao.json
      antes-imprimir.lsp
      depois-imprimir.lsp
  README.md
```

- Nomes de arquivo **ASCII sem espaços** (`Pre-Selecao.lsp`, `antes-imprimir.lsp`).
- Nome Senior da seção = nome da pasta (ex. `Detalhe_Transportadora`).
- Controles `_Na Impressao` **não** entram no scaffold padrão.

### JSON semântico (MVP)

| Arquivo | Inclui | Não inclui |
|---------|--------|------------|
| `relatorio.json` | codigo, descricao, categoria, tipoRelatorio, detalhePrincipal, **contextoExtra** (PDR-010) | margens, fonte, DPI |
| `Entrada.json` | parâmetros `E*` | UI de edição Senior |
| `secao.json` | tipo, tabelaBase, classificacao, secaoLigSql, imprimir | moldura, salto página, cores |

Schemas: [`docs/gerador-relatorios/schema/`](../../gerador-relatorios/schema/).

### Camadas

- Resolução de projeto + GER* → `packages/lsp-analyzer` (puro).
- Scaffold / clipboard / completion colunas → `packages/lsp-workbench`.
- Prompt Agent → `.cursor/commands/gerar-relatorio.md` (+ espelho no agent).

## Consequências

- Validação contextual sem emular joins do Senior.
- Catálogo local continua fora do VSIX / gitignore no público (PDR-007 / PDR-009).
- Export multi-trecho é **artefato de saída**, não fonte de verdade.
- Props visuais podem ser adicionadas depois sem quebrar o contrato semântico (`$schema` versionado).
- Escopo de símbolos: pasta do relatório (+ `contextoExtra`) isola Ctrl+Espaço de irmãos ([PDR-010](../pdr/PDR-010-escopo-projeto-relatorio.md)).

## Relacionados

- [PDR-008](../pdr/PDR-008-projeto-relatorio.md)
- [PDR-010](../pdr/PDR-010-escopo-projeto-relatorio.md)
- [docs/gerador-relatorios](../../gerador-relatorios/)
- ADR-005, ADR-006, PDR-007
