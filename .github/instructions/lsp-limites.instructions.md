---
description: "Limitações críticas da LSP (parâmetros, retorno, FormatarData, conversões, concatenação, funções inexistentes)."
applyTo: "**/*.lsp"
---

# LSP – Limitações críticas

- **Parâmetros:** só `Numero`. Alfa/Data/Lista via variáveis globais ou códigos numéricos.
- **Retorno:** sempre por parâmetro (ex.: `TamanhoAlfa(vaTexto, vnTamanho);`). Não usar como `vnTamanho = TamanhoAlfa(vaTexto)`.
- **Nulos:** `EstaNulo(vaDado, vnEhNulo);` depois `Se (vnEhNulo = 0)` — não comparar a função na condição.
- **FormatarData:** aceita apenas Numero; usar `DataHora(vnDataHora); FormatarData(vnDataHora, "dd/MM/yyyy", vaData)`.
- **Campos com ponto:** permitido quando a doc do parâmetro diz Campo/Variável (ex.: `IntParaAlfa(E900COP.NUMORP, vaNum);`, também Alfa ou Data). Se a descrição fala só em variável de retorno, use intermediária antes de gravar em grid.
- **Grids/tabelas:** destino de conversão que a doc trata só como variável (ex.: `AlfaParaDecimal`) passa por variável intermediária antes de gravar no grid.
- **Concatenação:** só Alfa + Alfa; converter número com `IntParaAlfa` antes.
- **Cancel(1):** usar para interromper após erro; não existe `Retorna`.
- **CopiarAlfa:** modifica a variável original; copiar para outra antes se precisar preservar.
- **Mensagem:** não passar JSON/XML ou strings muito grandes para `Mensagem` (pode travar); usar resumo ou trecho em variável Alfa.
- **Retorno direto:** a maioria das funções usa parâmetro de retorno; exceções que retornam valor diretamente incluem `ArqExiste(vaCaminho)`, `Abrir(...)`, `CodData(...)`; consulte `docs/lsp/` quando em dúvida.
- **Pare** (não Break). **RestoDivisao** (não %). **CaracterParaAlfa(13, vaEnter)** (não \n). Sem `Chr()`, `Truncar()`.
- **ExecSQLEx:** retorno invertido – `0 = sucesso`, `1 = erro` (diferente de muitas APIs). Usar `Se (vnRetorno = 0)` para sucesso.
- **WebService filho (arquivos):** ao abrir arquivo em caminho de rede (`\\servidor\pasta`), pode falhar quando invocado como filho; usar fallback para pasta local (ex.: `logs/` do projeto). Preferir abertura inline no início do programa.
- **Nomes de funções (Senior):** comprimento máximo **30** caracteres. Evitar **dígitos** nos nomes (ex.: código de tipo `100`, `950`); preferir descrição curta (`BuscarAgendPeriodo`, `ProcessarEvtReagend`).
