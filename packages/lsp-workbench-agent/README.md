# LSP Workbench Agent

Plugin Cursor (Agent) do **LSP Workbench**: rules, skills e commands para a [Linguagem Senior de Programação](https://documentacao.senior.com.br/tecnologia).

Complementa a extensão **LSP Workbench** (IDE / Marketplace). Escopo: sintaxe, padrões e geradores — sem dicionário Oracle embutido (use catálogo local / `@lsp-banco`).

## Commands

| Command | Função | Paridade IDE |
|---------|--------|--------------|
| `/compilar-lsp` | Pré-compilação com IDs (+ DEM/GER) | Problems + QF |
| `/depurar-lsp` | Resumo + ordem de execução + cursores/SQL | (Agent) |
| `/formatar-lsp` | Layout canônico | Format Document |
| `/refatorar-lsp` | Estrutura + relatório de lógica | Refactors / QF |
| `/gerar-lista-lsp` | Lista dinâmica | Snippets |
| `/gerar-cursor-lsp` | Cursor (+ SQL) | Snippets |
| `/gerar-http-lsp` | HTTP + parse JSON/XML | Snippets |
| `/gerar-relatorio` | Scaffold relatório (PDR-008) | Gerar Projeto de Relatório |
| `/importar-relatorio` | Import dump multi-trecho → árvore ADR-007 | Importar Relatório |
| `/escopo-relatorio` | Explicar escopo do relatório | Mostrar Escopo |
| `/copiar-regra-relatorio` | Juntar `.lsp` do evento / todos | Copiar / Visualizar Regras |

## Skills (`lsp-<ação>`)

`@lsp-linguagem` · `@lsp-gerar` · `@lsp-compilar` · `@lsp-depurar` · `@lsp-revisar` · `@lsp-formatar` · `@lsp-refatorar` · `@lsp-logs` · `@lsp-banco` · `@lsp-contexto`

| Skill | Quando |
|-------|--------|
| `@lsp-revisar` | Checklist ~30s |
| `@lsp-compilar` | Relatório completo + analyzer |
| `@lsp-depurar` | Entender fluxo / cursores / resultado |
| `@lsp-gerar` | Gerar/alterar `.lsp` (incl. catálogo PDR-009) |
| `@lsp-banco` | Tabelas/colunas via catálogo local |
| `@lsp-contexto` | `lsp.contexts` / escopo de relatório |

## Escopo

| Sim | Não |
|-----|-----|
| Sintaxe e padrões LSP | Dump Oracle privado embutido |
| Cursores, SQL/HTTP | Assumir overlay de cliente sem pasta |
| Relatório (scaffold + GER*) | Layout visual / `.GER` |

## Licença

MIT — [LICENSE](LICENSE).

Docs: [docs/product](../../docs/product/) · [PUBLISH.md](PUBLISH.md) · [CONTRIBUTING.md](CONTRIBUTING.md).
