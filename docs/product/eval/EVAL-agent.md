# EVAL — Agent LSP Workbench

## Como rodar (manual nesta leva)

1. Abrir Agent com plugin `lsp-workbench-agent` (ou `.cursor` do monorepo).
2. Compilar analyzer: `cd packages/lsp-analyzer && npm run compile`
3. Executar cada prompt / script.
4. Marcar pass/fail nos asserts.

## Suite

### E-AG-01 — Gerar lista

Prompt: `/gerar-lista-lsp` nome `Itens` campos `CODIGO:Numero, NOME:Alfa`

Asserts:

- [ ] Contém `Definir Lista vlItens` (ou `vl` + Itens)
- [ ] Contém `AdicionarCampo("CODIGO"`
- [ ] Contém `AdicionarCampo("NOME"`
- [ ] Não contém `Retorna`
- [ ] Membros de Lista só os de [reference-membros.md](../../packages/lsp-workbench-agent/skills/lsp-linguagem/reference-membros.md)

### E-AG-02 — Gerar cursor

Prompt: `/gerar-cursor-lsp` completo SQL `SELECT COD, NOM FROM TAB WHERE ID = :vnId`

Asserts:

- [ ] `Definir Cursor Cur_`
- [ ] `.AbrirCursor` / `.FecharCursor` (ou padrão documentado)
- [ ] SQL com `\` se linha longa
- [ ] Membros Cursor só os canônicos (reference-membros)

### E-AG-03 — Validar Retorna (analyzer)

Prompt: `/compilar-lsp` **ou** CLI:

```powershell
node scripts/analyze-lsp.mjs packages/lsp-workbench/fixtures/smoke-sem.lsp
# e um arquivo com Retorna; (criar temp se preciso)
```

Asserts:

- [ ] Relatório/CLI cita `ANL010` e/ou `RUL007`
- [ ] Sugere `Cancel(1)`

### E-AG-04 — Format determinístico

```powershell
node scripts/format-lsp.mjs packages/lsp-workbench/fixtures/00-ok-clean.lsp
```

Asserts:

- [ ] Exit 0; saída indentada com 2 espaços; sem mudar lógica

### E-AG-05 — Fixture extensão smoke

```powershell
node scripts/analyze-lsp.mjs packages/lsp-workbench/fixtures
```

Asserts:

- [ ] Arquivos OK ou só ANL* esperados; sem crash do CLI
