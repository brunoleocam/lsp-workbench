# @lsp-workbench/analyzer (Opção 2)

Núcleo puro de análise da Linguagem Senior (sem `vscode`).

## Status

Fundação 0.1.0: `tokenize` + `analyze` (balanceamento `{`/`}`).  
Parser/AST/semantic completos: próximas levas (PDR-005).

## Uso

```ts
import { analyze, tokenize } from "@lsp-workbench/analyzer";

const { diagnostics, tokens } = analyze(source);
```

## Dev

```powershell
cd packages/lsp-analyzer
npm install
npm test
```

Consumido pela extensão (Opção 1 continua in-process) e, na Opção 3, pelo Language Server / Worker.
