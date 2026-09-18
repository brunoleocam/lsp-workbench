# PDR-005 — Analyzer e Language Server (Opções 2 e 3)

| Campo | Valor |
|-------|-------|
| Status | Aceito — Opção 2 **0.2.0** + Opção 3 foundation **0.1.0** (LS+Worker, default off) |
| Data | 2026-09-18 |
| Roadmap | [ADR-006](../adr/ADR-006-roadmap-opcoes-1-2-3.md) |
| Pré-requisito | Opção 1 (PDR-004) concluída |

## Problema

Heurísticas em `diagnostics.ts` cobrem regras Demóbile (SYN/RUL/…), mas tipagem fina, schema/Tabela, unused real e isolamento de processo sob carga pedem um núcleo de análise reutilizável e, depois, um Language Server opcional.

## Opção 2 — Analyzer (`packages/lsp-analyzer`)

### Escopo

- Package **puro** (zero `vscode`): lexer → parser/AST (com recovery) → semantic mínimo.
- API pública: `analyze(source, opts)`, `format(source, opts)`, `tokenize`, `parse`.
- A extensão (e o LS) consomem a API.
- Migrar gradualmente regras de `diagnostics.ts` para o analyzer quando a AST permitir.

### Entregue (0.2.0)

- Lexer com comentários `@…@` e `/*…*/`
- Parser/AST com recovery
- Diagnostics: **ANL001** / **ANL002** (braces), **ANL010** (`Retorna`), **ANL011** (`e`/`ou`)
- `format` por indentação de chaves
- Extensão faz merge ANL* em `analyzeLsp` (dedupe vs RUL007 / SYN003 / SYN008)

### Não-objetivos da foundation Opção 2

- Tipagem completa / unused / schema
- Language Server (Opção 3)
- Trocar IDs canônicos SYN/RUL/… por outra família

### Aceite Opção 2 (foundation)

- [x] Package compilável + testes
- [x] Extensão consome analyzer sem regressão RUL*
- [ ] Migração ampla das regras SYN/RUL para AST (backlog)

## Opção 3 — Language Server + Worker

### Escopo

- `vscode-languageclient` na extensão; server Node importando `lsp-analyzer`.
- Worker (`worker_threads`) para sessões de `analyze`.
- Snippets/grammar permanecem contribs da extensão.
- **Sem i18n** (fora de escopo).

### Entregue (foundation 0.1.0)

- `packages/lsp-language-server`: `server.ts` + `compiler-worker.ts`
- Extensão: `lsp.server.enabled` (default **false**)
- Com LS on: push diagnostics (`source: LSP Analyzer`); format/completion rica continuam in-process
- Fallback sync se o Worker falhar

### Aceite Opção 3 (completo — ainda aberto)

- [ ] Paridade UX da Opção 1 via LS (não só diagnostics)
- [ ] Smoke F5 + métrica de não-bloqueio em arquivo grande

## Ordem

```text
PDR-004 (UX) → PDR-005 Opção 2 (analyzer) → PDR-005 Opção 3 (LS/Worker)
         ↓
    PDR-006 (Agent consome analyzer) · PDR-007 (bridge Demóbile)
```
