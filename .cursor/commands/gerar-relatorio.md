Gerar um **projeto de relatório** multi-arquivo (PDR-008) no workspace.

## Entrada (pedir se faltar)

1. **Sigla** do relatório (ex.: `RDCG183`) — só letras, números e `_`
2. **Descrição** / nome amigável
3. **Categoria** (opcional, ex.: `CG`, `PS`)
4. Pasta destino (default: raiz do workspace)

## Saída

Criar a árvore (ADR-007):

```text
<SIGLA>/
  relatorio.json
  Definicao/
    Entrada.json
    Funcoes-Globais.lsp
    Inicializacao.lsp
    Pre-Selecao.lsp
    Selecao.lsp
    Finalizacao.lsp
    Imprimir-Pagina.lsp
  Secoes/Detalhe_1/
    secao.json
    antes-imprimir.lsp
    depois-imprimir.lsp
  README.md
```

Preferir o comando da extensão **LSP Workbench: Gerar Projeto de Relatório** (`lspWorkbench.gerarRelatorio`) se o usuário estiver no VS Code/Cursor com a extensão.

Se criar arquivos manualmente, seguir schemas em `docs/gerador-relatorios/schema/` e o modelo mental em `docs/gerador-relatorios/`.

**Não** gerar layout visual nem `.GER`. Preencher `tabelaBase` em `secao.json` quando o usuário informar a tabela (skill `@lsp-banco` / catálogo local).

Resumo curto: path criado + próximos passos (preencher Entrada / Tabela Base / colar no Senior).
