Fazer um **code review** das alterações LSP feitas nesta conversa (ou no arquivo/trecho em foco).

1. Validar o código contra as regras LSP: use o checklist da skill **lsp-revisar** (condições compostas, parâmetros só Numero, retorno por parâmetro, conversões, Cancel(1), concatenação, etc.). Para validação sistemática com relatório, use a skill **lsp-compilar**. Consulte @lsp-nucleo.mdc e @lsp-limites.mdc se necessário.
2. Avaliar **impacto**: as alterações podem afetar outras partes do código? (chamadas à função/regra alterada, variáveis globais, outros arquivos .lsp que usam o mesmo fluxo?)
3. Se a mudança for grande ou em vários arquivos, considere usar um **subagent** (mcp_task, generalPurpose) com o prompt de validar conforme skill lsp-compilar e revisar impacto no restante do código.

Ao final, listar: itens OK, itens a corrigir e sugestões de impacto.
