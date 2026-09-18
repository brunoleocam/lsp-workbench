# ADR-003 — Config unificada `lsp.*`

## Status

Aceito

## Decisão

Mesmas chaves para extensão (settings.json) e Agent (`lsp.config.json` na raiz do workspace quando existir):

| Chave | Default | Notas |
|-------|---------|-------|
| `lsp.format.enabled` | true | |
| `lsp.format.indentSize` | 2 | |
| `lsp.format.useTabs` | false | |
| `lsp.format.maxParamsPerLine` | 4 | |
| `lsp.format.braceStyle` | `sameLine` | |
| `lsp.format.embeddedSql.enabled` | false | **Reserva** — formatação SQL embutido ainda não implementada |
| `lsp.format.embeddedSql.dialect` | `sql` | Dialeto pretendido (sem efeito até a feature) |
| `lsp.refactor.defaultBlockStyle` | `braces` | |
| `lsp.diagnostics.ignoreIds` | [] | Unido a `lsp.contexts[].diagnostics.ignoreIds` |
| `lsp.symbols.scope` | `project` | `project` \| `file` \| `mixed` |
| `lsp.contexts` | [] | `files` = união com `filePattern` |
| `lsp.fallback.defaultSystem` | `""` | Status bar SingleFile; catálogo por sistema ainda só SENIOR |
| `lsp.semantic.embeddedSqlHighlight.enabled` | false | **Reserva** — highlight SQL dedicado |

Agent `@lsp-formatar` lê `lsp.config.json` se presente; senão usa defaults.
