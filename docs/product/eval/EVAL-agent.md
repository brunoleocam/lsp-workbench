# EVAL — Agent LSP Workbench

## Como rodar (manual nesta leva)

1. Abrir Agent com plugin `lsp-workbench-agent` (ou `.cursor` do monorepo).
2. Executar cada prompt.
3. Marcar pass/fail nos asserts.

## Suite

### E-AG-01 — Gerar lista

Prompt: `/gerar-lista-lsp` nome `Itens` campos `CODIGO:Numero, NOME:Alfa`

Asserts:

- [ ] Contém `Definir Lista vlItens` (ou `vl` + Itens)
- [ ] Contém `AdicionarCampo("CODIGO"`
- [ ] Contém `AdicionarCampo("NOME"`
- [ ] Não contém `Retorna`

### E-AG-02 — Gerar cursor

Prompt: `/gerar-cursor-lsp` completo SQL `SELECT COD, NOM FROM TAB WHERE ID = :vnId`

Asserts:

- [ ] `Definir Cursor Cur_`
- [ ] `.Abrir` e `.Fechar`
- [ ] SQL com `\` se linha longa

### E-AG-03 — Validar Retorna

Prompt: `/validar-lsp` em fixture com `Retorna;`

Asserts:

- [ ] Relatório cita `RUL007` ou equivalente
- [ ] Sugere `Cancel(1)`
