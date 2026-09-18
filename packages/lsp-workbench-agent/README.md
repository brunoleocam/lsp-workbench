# LSP Workbench Agent

Plugin Cursor (Agent) do **LSP Workbench**: rules, skills e commands para a [Linguagem Senior de Programação](https://documentacao.senior.com.br/tecnologia).

Complementa a extensão **LSP Workbench** (IDE). Escopo: sintaxe, padrões e geradores da linguagem — não inclui dicionários Oracle nem regras de cliente.

## Commands

| Command | Função |
|---------|--------|
| `/validar-lsp` | Regras + sintaxe + semântica (IDs) |
| `/refatorar-lsp` | Estrutura, braces, relatório de lógica |
| `/formatar-lsp` | Layout canônico |
| `/gerar-lista-lsp` | Lista dinâmica a partir dos campos |
| `/gerar-cursor-lsp` | Cursor simples/completo (+ SQL) |
| `/gerar-http-lsp` | Chamada HTTP + parse JSON/XML |

## Skills (`lsp-<ação>`)

`@lsp-linguagem` · `@lsp-gerar` · `@lsp-validar` · `@lsp-formatar` · `@lsp-refatorar` · `@lsp-revisar` · `@lsp-logs`

## Escopo

| Sim | Não |
|-----|-----|
| Sintaxe e padrões LSP | Dicionários / regras de cliente |
| Cursores, SQL/HTTP na linguagem | Dump Oracle privado |

## Licença

MIT — [LICENSE](LICENSE).

Docs de produto: [docs/product](../../docs/product/) (monorepo).
