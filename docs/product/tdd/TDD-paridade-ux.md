# TDD — Paridade UX (PDR-004)

Princípio: teste que falha → mínimo → refatorar. Runner: `packages/lsp-workbench` → `npm test`.

## ACC-MEM — Membros Cursor / Lista

| ID | Caso | Expectativa |
|----|------|-------------|
| ACC-MEM-01 | Após `Cur_X.` | Sugere AbrirCursor, FecharCursor, Proximo, Achou, NaoAchou, UsaAbrangencia, SQL |
| ACC-MEM-02 | Após `vlX.` | Sugere métodos Lista (AdicionarCampo, Adicionar, …) e props (IDA, FDA, …) |
| ACC-MEM-03 | Campo via `AdicionarCampo("FOO", …)` | Completion oferece `FOO` no mesmo arquivo |
| ACC-MEM-04 | Variável não-Cursor/Lista | Não oferece membros Cursor/Lista |

## ACC-TOK — Semantic tokens

| ID | Caso | Expectativa |
|----|------|-------------|
| ACC-TOK-01 | Função elegível | Token tipo function |
| ACC-TOK-02 | Variável Definir | Token tipo variable |
| ACC-TOK-03 | Membro `.AbrirCursor` | Token tipo method / property |

## ACC-SNP — Snippets

| ID | Caso | Expectativa |
|----|------|-------------|
| ACC-SNP-01 | Prefixos `se`, `definir`, `SQL_Criar`, `lista`, `cursor` | Snippets contribuídos existem |
| ACC-SNP-02 | Corpo usa `{ }` | Sem `Inicio`/`Fim` nos snippets padrão |

## ACC-GRM — Grammar

| ID | Caso | Expectativa |
|----|------|-------------|
| ACC-GRM-01 | Keyword `Definir` / `Se` | Escopo keyword na TextMate |
| ACC-GRM-02 | Nome do catálogo SENIOR (ex. Mensagem) | Presente na grammar gerada ou lista |

## ACC-SYS — Sistemas

| ID | Caso | Expectativa |
|----|------|-------------|
| ACC-SYS-01 | system HCM no contexto | Builtins HCM entram no completion (ou stub documentado) |
| ACC-SYS-02 | Sem system | Só SENIOR |

## ACC-SQLF — Format SQL

| ID | Caso | Expectativa |
|----|------|-------------|
| ACC-SQLF-01 | `embeddedSql.enabled=false` | SQL literal intacto |
| ACC-SQLF-02 | enabled + ExecSql elegível | SQL formatado; LSP layout preserva |
| ACC-SQLF-03 | Concat dinâmica | no-op |

## ACC-OUT — Outline

| ID | Caso | Expectativa |
|----|------|-------------|
| ACC-OUT-01 | Definir Funcao + vars | DocumentSymbol lista funções e variáveis file-scope |

## ACC-REF — Refactors

| ID | Caso | Expectativa |
|----|------|-------------|
| ACC-REF-01 | Wrap seleção em `Se` | CodeAction Refactor |
| ACC-REF-02 | Toggle Inicio/Fim ↔ `{ }` | Equivalente SYN004 + refactor dedicado |
| ACC-REF-03 | `\` multilinha → `+` | Cadeia concatenada |

Ver também [TDD-extension.md](TDD-extension.md) (casos base + PDR-003).
