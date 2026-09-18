# Language Server stub (Opção 3)

Pasta reservada para o Language Server + Worker (PDR-005 / ADR-006).

**Não iniciar implementação completa até a Opção 2 (`packages/lsp-analyzer`) estar estável.**

Planejado:

- `server.ts` — `vscode-languageserver`
- `compiler-worker.ts` — `worker_threads` chamando `@lsp-workbench/analyzer`
- Client em `packages/lsp-workbench` via `vscode-languageclient`

Enquanto isso, a extensão permanece **in-process** (Opção 1).
