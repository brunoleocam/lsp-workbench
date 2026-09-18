# EVAL — Paridade UX (PDR-004)

Checklist manual + automatizado após cada leva. Automatizado: `cd packages/lsp-workbench && npm test`.

## P0 — Membros e tokens

- [ ] `Cur_Ped.` → membros Cursor no Ctrl+Espaço
- [ ] `vlItens.` → membros Lista + campo de `AdicionarCampo`
- [ ] Semantic highlight distingue função custom / variável (tema com semantic highlighting on)

## P1 — Snippets, grammar, sistemas, SQL

- [ ] Snippets `se`, `definir alfa`, `SQL_Criar`, `ExecSQLEx` inserem blocos `{ }`
- [ ] Colorização de builtins do catálogo (Mensagem, HttpGet, …)
- [ ] Contexto `system: HCM` altera completion (ou mensagem “catálogo stub”)
- [ ] Format Document com `lsp.format.embeddedSql.enabled: true` em fixture SQL elegível

## P2 — Outline e refactors

- [ ] Outline mostra funções e variáveis
- [ ] Refactor “Envolver com Se” / toggle braces / concatenar `\`

## Regressão (sempre)

- [ ] `npm test` verde
- [ ] Smoke MANIFEST (`EVAL-extension.md`)
- [ ] FUN009 + import Quick Fix
- [ ] README + CHANGELOG da leva atualizados

## Fixtures a adicionar (por leva)

| Fixture | Leva |
|---------|------|
| `parity-cursor-lista.lsp` | P0 |
| `parity-semantic.lsp` | P0 |
| `parity-sql-embed.lsp` | P1 |
| `parity-outline.lsp` | P2 |
