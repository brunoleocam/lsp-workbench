# PDR-005 — Compiler e Language Server (Opções 2 e 3)

| Campo | Valor |
|-------|-------|
| Status | Aceito — Opção 2 foundation + **Opção 3 foundation** (LS+Worker, default off) |
| Data | 2026-09-18 |
| Roadmap | [ADR-006](../adr/ADR-006-roadmap-opcoes-1-2-3.md) |
| Pré-requisito | Opção 1 (PDR-004) concluída |

## Problema

Heurísticas cobrem regras Demóbile, mas não tipagem fina, Tabela/schema, unused real nem isolamento de processo sob carga. llutti resolve isso com compiler + LS + Worker.

## Opção 2 — Compiler (`packages/lsp-analyzer`)

### Escopo

- Package **puro** (zero `vscode`): lexer → parser/AST (com recovery) → semantic mínimo.
- API pública: `analyze(source, opts)`, `format(source, opts)`, símbolos, tokens.
- A extensão (e depois o LS) só consome a API.
- Migrar gradualmente regras de `diagnostics.ts` para o analyzer quando a AST permitir.

### Não-objetivos da primeira entrega Opção 2

- Paridade 1:1 com códigos `LSP####` do llutti
- Language Server
- Copiar parser do llutti

### Aceite Opção 2

- Package compilável + testes de lexer/parser em fixtures próprias.
- Extensão chama analyzer para pelo menos um caminho (ex.: parse errors SYN) sem regressão RUL*.

## Opção 3 — Language Server + Worker + i18n

### Escopo

- `vscode-languageclient` na extensão; server Node importando `lsp-analyzer`.
- Worker (`worker_threads`) para sessões de compile.
- i18n (`package.nls*.json`) pt-BR (+ es se necessário).
- Extensão vira thin client; snippets/grammar permanecem contribs.

### Pré-requisito

- Opção 2 estável (API analyzer congelada o suficiente).

### Aceite Opção 3

- Mesmos features UX da Opção 1 via LS.
- Smoke F5 sem regressão; métrica de não-bloqueio da UI em arquivo grande (baseline a documentar).

### Status implementação (2026-09-18)

**Foundation Opção 3 landed** em `packages/lsp-language-server`:

- `server.ts` + `compiler-worker.ts` (`worker_threads`) + i18n (`package.nls*.json`)
- Extensão: `lsp.server.enabled` (default **false**) inicia `LanguageClient` → `out/server.js`
- Com LS off, Opção 1 in-process permanece o caminho estável
- Ainda **não** é aceite completo (paridade UX via LS / métrica UI) — só a fundação LS+Worker

## Ordem

```text
PDR-004 (UX) → PDR-005 Opção 2 (analyzer) → PDR-005 Opção 3 (LS/Worker)
```
