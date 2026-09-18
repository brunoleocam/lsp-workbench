# @lsp-workbench/language-server (Opção 3)

Language Server Node + `worker_threads`. Consome [`@lsp-workbench/analyzer`](../lsp-analyzer).

## Status

Fundação **0.1.0** — LS + Worker + push diagnostics (`source: "LSP Analyzer"`).  
Default na extensão: **desligado** (`lsp.server.enabled: false` → Opção 1 in-process).  
Sem i18n (strings fixas em pt/en técnico no código).

## Arquitetura

```text
VS Code / Cursor
  └─ LanguageClient (vscode-languageclient)   [opt-in]
       └─ server.ts (vscode-languageserver)
            ├─ TextDocuments sync Full
            ├─ publishDiagnostics
            └─ Worker (compiler-worker.ts)
                 └─ analyze() @lsp-workbench/analyzer
```

Se o Worker falhar, o server faz **fallback sync** `analyze()` no mesmo processo.

## Dev

```powershell
cd packages/lsp-analyzer
npm install
npm run compile

cd ../lsp-language-server
npm install
npm test
```

Entry: `out/server.js` (bin `lsp-workbench-language-server`).

## Como habilitar (extensão)

1. Compile analyzer + language-server + extensão.
2. Em Settings: `lsp.server.enabled` = `true`.
3. Recarregue a janela (Reload Window).
4. Diagnósticos do analyzer passam a vir do LS (`LSP Analyzer`); providers in-process (format, completion rica, etc.) permanecem na extensão nesta fundação.
