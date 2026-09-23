# LSP Workbench Agent

Plugin Cursor (Agent) do **LSP Workbench**: rules, skills e commands para a [Linguagem Senior de Programação](https://documentacao.senior.com.br/tecnologia).

Complementa a extensão **LSP Workbench** (IDE / Marketplace). Escopo: sintaxe, padrões e geradores da linguagem — não inclui dicionários Oracle nem regras de cliente.

## Commands

| Command | Função | Paridade IDE |
|---------|--------|--------------|
| `/compilar-lsp` | Pré-compilação: SYN/RUL/FUN/SEM/SQL/ANL (+ DEM/GER) | Problems + QF |
| `/formatar-lsp` | Layout canônico | Format Document |
| `/refatorar-lsp` | Estrutura, braces, relatório de lógica | Refactors / QF |
| `/gerar-lista-lsp` | Lista dinâmica a partir dos campos | Snippets / completion |
| `/gerar-cursor-lsp` | Cursor simples/completo (+ SQL) | Snippets |
| `/gerar-http-lsp` | Chamada HTTP + parse JSON/XML | Snippets |
| `/gerar-relatorio` | Scaffold projeto de relatório (PDR-008) | **Gerar Projeto de Relatório** |

## Skills (`lsp-<ação>`)

`@lsp-linguagem` · `@lsp-gerar` · `@lsp-compilar` · `@lsp-formatar` · `@lsp-refatorar` · `@lsp-revisar` · `@lsp-logs`

| Skill | Quando |
|-------|--------|
| `@lsp-compilar` | Relatório com IDs (ex-`@lsp-validar`) |
| `@lsp-revisar` | Checklist curto pré-compilação |
| `@lsp-gerar` | Gerar `.lsp` do zero (depois `/compilar-lsp`) |

## Escopo

| Sim | Não |
|-----|-----|
| Sintaxe e padrões LSP | Dicionários / regras de cliente |
| Cursores, SQL/HTTP na linguagem | Dump Oracle privado |
| Projeto de relatório (scaffold + GER*) | Layout visual / `.GER` |

## Licença

MIT — [LICENSE](LICENSE).

Docs: [docs/product](../../docs/product/) · publicar: [PUBLISH.md](PUBLISH.md).
