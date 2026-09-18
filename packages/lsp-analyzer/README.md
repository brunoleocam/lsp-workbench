# @lsp-workbench/analyzer

Núcleo puro de análise da Linguagem Senior (sem `vscode`).

## Status

**0.3.0** — lexer → parser/AST → semantic (`ANL*`) + **`analyzeLsp`** (lint SYN/RUL/FUN/SEM/SQL/DEM em `src/lint/`).

## Uso

```ts
import { analyze, analyzeLsp, format, ANALYZER_VERSION } from "@lsp-workbench/analyzer";

const { diagnostics } = analyze(source); // só ANL*
const hits = analyzeLsp(source, { ignoreIds: ["RUL010"] }); // suite completa
const pretty = format(source, { indentSize: 2 });
```

## Dev

```powershell
cd packages/lsp-analyzer
npm install
npm test
```

Consumido pela extensão e pelo Language Server / Worker.
