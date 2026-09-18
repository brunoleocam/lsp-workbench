# LSP Workbench (extensão)

Extensão VS Code/Cursor do **LSP Workbench** para a Linguagem Senior de Programação.

Versão atual: **0.1.3** · Language id: **`senior-lsp`** (`.lsp` / `.lspt`)

## Roadmap

| Fase | Conteúdo | Doc |
|------|----------|-----|
| **1** | Paridade UX (membros, tokens, snippets, grammar, sistemas, SQL, Outline, refactors) | [PDR-004](../../docs/product/pdr/PDR-004-paridade-ux.md) |
| **2** | Compiler `lsp-analyzer` | [PDR-005](../../docs/product/pdr/PDR-005-compiler-e-language-server.md) |
| **3** | Language Server + Worker | PDR-005 |

Arquitetura: [ARCHITECTURE.md](../../docs/product/architecture/ARCHITECTURE.md) · [ADR-005](../../docs/product/adr/ADR-005-clean-architecture-nucleo-puro.md)

## Dev

```powershell
cd packages/lsp-workbench
npm install
npm test
```

Na raiz do monorepo: **Run and Debug** → *Run LSP Workbench Extension* (F5). Guia: [`docs/product/LOCAL-TEST.md`](../../docs/product/LOCAL-TEST.md).

## Status (0.1.3)

| Área | Estado |
|------|--------|
| Grammar TextMate | Básica (P1b enriquecer) |
| Snippets | `lista`, `cursor` (P1a expandir) |
| Format Document | Indent / braces |
| Diagnósticos | SYN / RUL / FUN / SEM / SQL |
| Quick Fixes | Amplos + import FUN009 |
| Completion | Builtins SENIOR + custom (PDR-003); membros P0 |
| Hover / Signature / Go to Def | Sim |
| Escopos / contextos | project / file / mixed |
| Semantic tokens | P0b |
| Catálogos HCM / ACESSO / ERP | P1c |
| Format / highlight SQL | P1d |
| Outline / Refactors | P2 |

Changelog: [`CHANGELOG.md`](CHANGELOG.md)

## Settings principais

| Chave | Default | Notas |
|-------|---------|-------|
| `lsp.symbols.scope` | `project` | Escopo de símbolos |
| `lsp.contexts` | `[]` | Contextos nomeados |
| `lsp.fallback.defaultSystem` | `""` | Status bar; catálogo por sistema em P1c |
| `lsp.format.*` | (ADR-003) | `embeddedSql.*` ativa em P1d |
| `lsp.diagnostics.ignoreIds` | `[]` | + por contexto |
| `lsp.semantic.embeddedSqlHighlight.enabled` | `false` | Reserva / P1d |

## Comandos

- Criar / Editar / Remover Contexto
- Adicionar / Remover do Contexto
- Alternar Escopo de Símbolos
- Selecionar Sistema (Fallback)

## Qualidade

- SOLID, Clean Code, Clean Architecture (domínio sem `vscode`).
- TDD: [TDD-paridade-ux.md](../../docs/product/tdd/TDD-paridade-ux.md)
- Eval: [EVAL-paridade-ux.md](../../docs/product/eval/EVAL-paridade-ux.md)
