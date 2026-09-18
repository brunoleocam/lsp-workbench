# @lsp-workbench/analyzer (Opção 2)

Núcleo puro de análise da Linguagem Senior (sem `vscode`).

## Status

**0.2.0** — lexer (comentários `@…@` / `/*…*/`) → parser/AST com recovery → semantic mínimo (`ANL001`/`ANL002` braces, `ANL010` Retorna, `ANL011` `e`/`ou`) + `format` por indentação de chaves.

## Uso

```ts
import { analyze, format, tokenize, ANALYZER_VERSION } from "@lsp-workbench/analyzer";

const { diagnostics, tokens, ast } = analyze(source, { ignoreIds: ["ANL002"] });
const pretty = format(source, { indentSize: 2 });
```

## API

| Export | Descrição |
|--------|-----------|
| `analyze(source, opts?)` | Tokens + AST + diagnostics |
| `format(source, opts?)` | Indentação simples por profundidade de `{`/`}` |
| `tokenize` / `parse` | Lexer e parser expostos |
| `ANALYZER_VERSION` | `"0.2.0"` |

## Dev

```powershell
cd packages/lsp-analyzer
npm install
npm test
```

Consumido pela extensão LSP Workbench (`file:../lsp-analyzer`) e, na Opção 3, pelo Language Server / Worker.
