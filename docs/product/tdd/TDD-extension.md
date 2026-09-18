# TDD — Extensão LSP Workbench

## Princípio

Escrever teste que falha → implementar o mínimo → refatorar.

## Casos iniciais (Fase C)

| ID | Caso | Expectativa |
|----|------|-------------|
| EXT-FMT-01 | Indent 2 espaços | Bloco `Se` indentado com 2 espaços |
| EXT-FMT-02 | `braceStyle: sameLine` | `{` na mesma linha do `Se` |
| EXT-FMT-03 | Preservar comentário `@ ... @` | Texto do comentário intacto |
| EXT-DIA-01 | Falta `;` | Diagnostic `SYN001` |
| EXT-DIA-02 | Uso de `Retorna` | Diagnostic `RUL007` |
| EXT-DIA-03 | `Se (a > 0 e b < 10)` | Diagnostic `SYN003` |
| EXT-REF-01 | `Inicio`/`Fim` → braces | Saída só com `{ }` |
| EXT-REF-02 | Literal com `\` → `+` | Cadeia concatenada |

## Casos PDR-003 (símbolos / contexto)

| ID | Caso | Expectativa |
|----|------|-------------|
| ACC-01 | Definir+Funcao | Função elegível no índice |
| ACC-02 | Só Definir ou só Funcao | Não elegível; FUN007 / FUN008 |
| ACC-03 | scope=project, peers | resolvePeerFiles lista workspace |
| ACC-04/05 | FUN009 + import | Diagnóstico + applyImport remove FUN009 |
| ACC-06 | LSPDoc | parseLspDoc preenche summary/params |
| ACC-07 | scope=file | só arquivo atual |
| ACC-08/10 | mixed + contexts | isolamento entre pastas/contextos |
| ACC-files | `files` + pattern | união (pattern continua válido com allowlist) |
| — | mergeIgnoreIds | global ∪ contexto |

Pendentes de teste automatizado: ACC-09 (vars cross-file no completion), ACC-11 (`.txt` associado), ACC-12 (status bar SingleFile).

## Paridade UX (PDR-004)

Casos ACC-MEM / TOK / SNP / GRM / SYS / SQLF / OUT / REF: [`TDD-paridade-ux.md`](TDD-paridade-ux.md).

Runner: `packages/lsp-workbench` → `npm test` (`pdr003-symbols.test.ts` + suites de paridade).
