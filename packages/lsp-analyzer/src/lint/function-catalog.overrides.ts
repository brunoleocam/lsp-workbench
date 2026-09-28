/** Overrides curados — vencem o catálogo gerado (snippets / docs ricos). */
import type { LspFunctionEntry } from "./function-catalog.types";

export const LSP_FUNCTION_CATALOG_OVERRIDES: LspFunctionEntry[] = [
  {
    label: "ConverteMascara",
    insertText:
      "ConverteMascara(${1:<Tipo_Dado>}, ${2:<Valor_Origem>}, ${3:<Alfa_Origem/Destino>}, ${4:<Mascara>});",
    detail: "ConverteMascara(<Tipo_Dado>, <Valor_Origem>, <Alfa_Origem/Destino>, <Mascara>);",
    documentation: `**ConverteMascara**

\`ConverteMascara(<Tipo_Dado>, <Valor_Origem>, <Alfa_Origem/Destino>, <Mascara>);\`

Esta função converte um valor de entrada (numérico, data, hora ou cadeia de caracteres) para o tipo de dado cadeia de caracteres.

**Parâmetros**

- \`<Tipo_Dado>\` (Numero) — Valor numérico. Código que determina o tipo do valor de origem. Use um destes códigos:
  - \`1\`: Número
  - \`2\`: Dinheiro (valor)
  - \`3\`: Data
  - \`4\`: Hora
  - \`5\`: Alfa
- \`<Valor_Origem>\` (Numero) — Valor numérico. Campo, variável ou valor a ser convertido. No tipo 5, passe 0
- \`<Alfa_Origem/Destino>\` (Alfa) — Variável Alfa. No tipo 5 entra com o Alfa original e, depois da conversão, recebe o resultado
- \`<Mascara>\` (Alfa) — Formato do resultado. CPF: \`999.999.999-99\`. CGC: \`99.999.999/9999-99\`

**Observação**

Caso seja um CPF, o número que deve ser apresentado em um relatório deve usar a máscara \`999.999.999-99\`. Caso seja CGC, deve ser apresentado com a máscara \`99.999.999/9999-99\`.

No caso de o tipo de dado ser 5 (Alfa), o parâmetro \`Valor_Origem\` é passado como 0 (zero) e o parâmetro \`Alfa_Origem/Destino\` receberá o campo do tipo Alfa a ser convertido e, após a conversão, receberá o resultado da conversão.

**Exemplo**

\`\`\`lsp
Definir Alfa VinscrStr[18];

Se (R030Fil.TipIns = 1) @ CGC @
  ConverteMascara (1,R030Fil.NumCgc,VInscrStr,"99.999.999/9999-99");
Senao
  Se (R030Fil.TipIns = 3) @ CPF @
    ConverteMascara (1,R030Fil.NumCgc,VInscrStr,"999.999.999-99");
\`\`\``,
    isSnippet: true,
    params: [
      {
        name: "<Tipo_Dado>",
        tipo: "Numero",
        description: "Valor numérico. Código que determina o tipo do valor de origem",
      },
      {
        name: "<Valor_Origem>",
        tipo: "Numero",
        description:
          "Valor numérico. Campo, variável ou valor a ser convertido. No tipo 5, passe 0",
      },
      {
        name: "<Alfa_Origem/Destino>",
        tipo: "Alfa",
        description:
          "Variável Alfa. No tipo 5 entra com o Alfa original e, depois da conversão, recebe o resultado",
      },
      {
        name: "<Mascara>",
        tipo: "Alfa",
        description: "CPF: 999.999.999-99. CGC: 99.999.999/9999-99",
      },
    ],
  },
  {
    label: "Mensagem",
    insertText: "Mensagem(${1|Retorna,Erro,Advertencia|}, ${2:<vaTexto>});",
    detail: "Mensagem(Tipo, Alfa) — exibir diálogo",
    documentation:
      "**Mensagem(Tipo, texto)**\n\n**Parâmetros**\n- `Tipo`: Tipo do diálogo (não é comando de saída)\n  - `Retorna`: informação\n  - `Erro`: erro\n  - `Advertencia`: aviso\n- `vaTexto` (Alfa) — Variável Alfa. Sem concatenar (`+`) no argumento\n\n```lsp\nvaMsg = \"Concluído\";\nMensagem(Retorna, vaMsg);\n```",
    isSnippet: true,
  },
  {
    label: "Cancel",
    insertText: "Cancel(${1|1,2,3|});",
    detail: "Cancel(1|2|3) — interromper regra",
    documentation:
      "**Cancel(n)** — só `1`, `2` ou `3`.\n\n**Parâmetros**\n- `n` (Numero) — Código de cancelamento\n  - `1`: Interromper regra / erro (padrão em tela e funções)\n  - `2`: Relatório: imprime `ValStr`/`ValRet` e sai\n  - `3`: Relatório: fórmula — exclui o registro atual\n\nEm eventos de tela, qualquer `n` só cancela a regra.",
    kind: "keyword",
    isSnippet: true,
  },
  {
    label: "Cancel(1)",
    insertText: "Cancel(1);",
    detail: "Interromper execução (padrão após erro)",
    documentation:
      "Cancela a regra. Em relatório: cancela impressão do controle / exclui detalhe conforme o evento.\n\nUse após `Mensagem(Erro, …)`.",
    kind: "keyword",
  },
  {
    label: "Cancel(2)",
    insertText: "Cancel(2);",
    detail: "Relatório: imprimir ValStr/ValRet e sair",
    documentation:
      "Gerador de Relatórios — controles descrição/numérico.\n\n```lsp\nValStr = vaTexto;\nCancel(2);\n```\n\nOu `ValRet = vnValor; Cancel(2);`",
    kind: "keyword",
  },
  {
    label: "Cancel(3)",
    insertText: "Cancel(3);",
    detail: "Relatório: excluir registro (fórmula)",
    documentation:
      "Só em controles de **fórmula** (ordenação por fórmula): exclui o registro atual do relatório (efeito semelhante a Cancel(1) em Seleção/Antes_de_Imprimir).",
    kind: "keyword",
  },
  {
    label: "Pare",
    insertText: "Pare;",
    detail: "Sair do loop (Para/Enquanto)",
    documentation: "Só dentro de `Para` / `Enquanto`. Fora do loop use `Cancel(1);`.",
    kind: "keyword",
  },
  {
    label: "Continue",
    insertText: "Continue;",
    detail: "Próxima iteração do loop",
    documentation: "Pula para a próxima iteração de `Para` / `Enquanto`.",
    kind: "keyword",
  },
  {
    label: "EstaNulo",
    insertText: "EstaNulo(${1:<vaDado>}, ${2:<vnEhNulo>});\nSe (${2:<vnEhNulo>} = 0) {\n  $0\n}",
    detail: "EstaNulo(Alfa, Numero End) — fora do Se",
    documentation:
      "**Parâmetros**\n- `vaDado` (Alfa) — Alfa a testar (não Data)\n- `vnEhNulo` (Numero) — Numero End. `0` = tem valor; qualquer outro = nulo\n\nNão use `Se (EstaNulo(...)=0)`.\n\n```lsp\nEstaNulo(vaDado, vnEhNulo);\nSe (vnEhNulo = 0) { … }\n```",
    isSnippet: true,
  },
  {
    label: "FormatarData",
    insertText: 'FormatarData(${1:<vnDataHora>}, "${2:dd/mm/yyyy}", ${3:<vaSaida>});',
    detail: "FormatarData(Numero, máscara, Alfa End)",
    documentation:
      "**Parâmetros**\n- `vnDataHora` (Numero) — Numero devolvido por `DataHora` (não variável Data `vd*`)\n- `mascara` (Alfa) — Alfa em minúsculas, por exemplo `dd/mm/yyyy`\n- `vaSaida` (Alfa) — Alfa End com a data já formatada",
    isSnippet: true,
  },
  {
    label: "CodData",
    insertText: "${1:<vdData>} = CodData(${2:<vnDia>}, ${3:<vnMes>}, ${4:<vnAno>});",
    detail: "CodData(dia, mes, ano) — retorna Data",
    documentation:
      "**Parâmetros**\n- `vnDia` (Numero) — Dia (1–31)\n- `vnMes` (Numero) — Mês (1–12)\n- `vnAno` (Numero) — Ano com 4 dígitos\n\nRetorna Data. Atribuição: `vd = CodData(15, 8, 1990);`",
    isSnippet: true,
  },
  {
    label: "Truncar",
    insertText: "${1:<vnResultado>} = Truncar(${2:<vnValor>});",
    detail: "Truncar(Numero) — retorna inteiro",
    documentation:
      "**Parâmetros**\n- `vnValor` (Numero) — Numero a truncar\n\nRetorna o inteiro por atribuição (`vn = Truncar(vnValor)`). Para casas decimais: `TruncarDecimal`.",
    isSnippet: true,
  },
  {
    label: "Abrir",
    insertText: 'Abrir(${1:<vaArquivo>}, "${2|R,W,A|}");',
    detail: "Abrir(caminho, modo) — arquivo",
    documentation:
      "**Parâmetros**\n- `vaArquivo` (Alfa) — Caminho do arquivo (não é cursor)\n- `modo` (Alfa) — Modo de abertura\n  - `R`: leitura\n  - `W`: escrita\n  - `A`: acrescentar ao fim\n\nParear com `Fechar`.",
    isSnippet: true,
  },
  {
    label: "ArqExiste",
    insertText: "${1:<vnExiste>} = ArqExiste(${2:<vaCaminho>});",
    detail: "ArqExiste(caminho) — retorna Numero",
    documentation:
      "**Parâmetros**\n- `vaCaminho` (Alfa) — Caminho do arquivo\n\n**Retorno**\n- `1`: o arquivo existe\n- `0`: o arquivo não existe",
    isSnippet: true,
  },
  {
    label: "SQL_Criar",
    insertText: "SQL_Criar(${1:<vaCur>});",
    detail: "SQL_Criar(Alfa handle)",
    documentation:
      "**Parâmetros**\n- `vaCur` (Alfa) — Handle `Definir Alfa`\n\nOrdem: Criar → Usar* → DefinirComando → Abrir → Fechar → Destruir. Para o pipeline completo, use o seed **Cursor completo** (Ctrl+Espaço).",
    isSnippet: true,
  },
  {
    label: "SQL_DefinirComando",
    insertText: "SQL_DefinirComando(${1:<vaCur>}, ${2:<vaSQL>});",
    detail: "SQL_DefinirComando(handle, Alfa SQL)",
    documentation:
      "**Parâmetros**\n- `vaCur` (Alfa) — Handle Alfa\n- `vaSQL` (Alfa) — Comando SQL (variável Alfa, sem concatenar na chamada)\n\nDepois: AbrirCursor → loop EOF → Fechar → Destruir.",
    isSnippet: true,
  },
  {
    label: "SQL_AbrirCursor",
    insertText: "SQL_AbrirCursor(${1:<vaCur>});",
    detail: "SQL_AbrirCursor(handle)",
    documentation: "**Parâmetros**\n- `vaCur` (Alfa) — Handle Alfa criado com `SQL_Criar`",
    isSnippet: true,
  },
  {
    label: "SQL_Proximo",
    insertText: "SQL_Proximo(${1:<vaCur>});",
    detail: "SQL_Proximo(handle)",
    documentation:
      "**Parâmetros**\n- `vaCur` (Alfa) — Handle Alfa\n\nAvança para o próximo registro. Usar dentro do loop `SQL_EOF(...) = 0`.",
    isSnippet: true,
  },
  {
    label: "SQL_FecharCursor",
    insertText: "SQL_FecharCursor(${1:<vaCur>});",
    detail: "SQL_FecharCursor(handle)",
    documentation: "**Parâmetros**\n- `vaCur` (Alfa) — Handle Alfa\n\nFecha o cursor. Depois: `SQL_Destruir`.",
    isSnippet: true,
  },
  {
    label: "SQL_Destruir",
    insertText: "SQL_Destruir(${1:<vaCur>});",
    detail: "SQL_Destruir(handle)",
    documentation: "**Parâmetros**\n- `vaCur` (Alfa) — Handle Alfa\n\nLibera o handle. Sempre após `SQL_FecharCursor`.",
    isSnippet: true,
  },
  {
    label: "SQL_EOF",
    insertText: "SQL_EOF(${1:<vaCur>})",
    detail: "SQL_EOF(handle) — 0 = há registro",
    documentation:
      "**Parâmetros**\n- `vaCur` (Alfa) — Handle Alfa do cursor\n\n**Retorno**\n- `0`: há registro (cursor não está em EOF)\n- `1`: cursor no fim (EOF); campos nulos\n\n```lsp\nEnquanto (SQL_EOF(vaCur) = 0) {\n  …\n  SQL_Proximo(vaCur);\n}\n```",
    isSnippet: true,
  },
  {
    label: "SQL_UsarAbrangencia",
    insertText: "SQL_UsarAbrangencia(${1:<vaCur>}, 0);",
    detail: "SQL_UsarAbrangencia(handle, 0) — nativo",
    documentation:
      "**Parâmetros**\n- `vaCur` (Alfa) — Handle Alfa\n- `modo` (Numero) — Abrangência de usuário. Chamar antes de `SQL_DefinirComando`\n  - `0`: desligada (obrigatório com SQL nativo, JOIN e subquery)\n\nJunto com `SQL_UsarSQLSenior2(vaCur, 0)`.",
    isSnippet: true,
  },
  {
    label: "SQL_UsarSQLSenior2",
    insertText: "SQL_UsarSQLSenior2(${1:<vaCur>}, 0);",
    detail: "SQL_UsarSQLSenior2(handle, 0) — nativo",
    documentation:
      "**Parâmetros**\n- `vaCur` (Alfa) — Handle Alfa\n- `modo` (Numero) — Dialeto do comando. Chamar antes de `SQL_DefinirComando`\n  - `0`: SQL nativo do banco\n  - outro: SQL Senior 2 (padrão do cursor)\n\nJunto com `SQL_UsarAbrangencia(vaCur, 0)` quando for nativo, JOIN ou subquery.",
    isSnippet: true,
  },
  {
    label: "ExecSQLEx",
    insertText: "ExecSQLEx(${1:<vaSQL>}, ${2:<vnRet>});",
    detail: "ExecSQLEx(SQL, Numero End) — 0=sucesso",
    documentation:
      "**Parâmetros**\n- `vaSQL` (Alfa) — Comando SQL\n- `vnRet` (Numero) — Numero End\n  - `0`: sucesso\n  - `1`: erro",
    isSnippet: true,
  },
  {
    label: "SQL_RetornarAlfa",
    insertText: 'SQL_RetornarAlfa(${1:<vaCur>}, "${2:<CAMPO>}", ${3:<vaDestino>});',
    detail: "SQL_RetornarAlfa(handle, campo, Alfa End)",
    documentation:
      "**Parâmetros**\n- `vaCur` (Alfa) — Handle Alfa\n- `CAMPO` (Alfa) — Nome da coluna\n- `vaDestino` (Alfa) — Alfa local de destino (não parâmetro `p*`)",
    isSnippet: true,
  },
  {
    label: "SQL_RetornarInteiro",
    insertText: 'SQL_RetornarInteiro(${1:<vaCur>}, "${2:<CAMPO>}", ${3:<vnDestino>});',
    detail: "SQL_RetornarInteiro(handle, campo, Numero End)",
    documentation:
      "**Parâmetros**\n- `vaCur` (Alfa) — Handle Alfa\n- `CAMPO` (Alfa) — Nome da coluna\n- `vnDestino` (Numero) — Numero local de destino (não parâmetro `p*`)",
    isSnippet: true,
  },
  {
    label: "SQL_RetornarData",
    insertText: 'SQL_RetornarData(${1:<vaCur>}, "${2:<CAMPO>}", ${3:<vdDestino>});',
    detail: "SQL_RetornarData(handle, campo, Data End)",
    documentation:
      "**Parâmetros**\n- `vaCur` (Alfa) — Handle Alfa\n- `CAMPO` (Alfa) — Nome da coluna\n- `vdDestino` (Data) — Data local de destino (não parâmetro)",
    isSnippet: true,
  },
  {
    label: "LimpaGerTabAlf",
    insertText: "LimpaGerTabAlf();",
    detail: "LimpaGerTabAlf() — zera GerTabAlf",
    documentation:
      "Limpa o conteúdo do Registro GerTabAlf.\n\n```lsp\nGerTabAlf[1] = \"xxx\";\nLimpaGerTabAlf();\n```",
    isSnippet: true,
  },
  {
    label: "LimpaGerTabNum",
    insertText: "LimpaGerTabNum();",
    detail: "LimpaGerTabNum() — zera GerTabNum",
    documentation:
      "Limpa o conteúdo do Registro GerTabNum.\n\n```lsp\nGerTabNum[1] = 1;\nLimpaGerTabNum();\n```",
    isSnippet: true,
  },
  {
    label: "CaracterParaAlfa",
    insertText: "CaracterParaAlfa(${1:13}, ${2:<vaChar>});",
    detail: "CaracterParaAlfa(Numero, Alfa End) — ex.: Enter=13",
    documentation:
      "**Parâmetros**\n- `codigo` (Numero) — Código do caractere (Enter = `13`)\n- `vaChar` (Alfa) — Alfa End que recebe o caractere\n\nSubstitui `Chr` (inexistente).\n\n```lsp\nCaracterParaAlfa(13, vaEnter);\n```",
    isSnippet: true,
  },
  {
    label: "RestoDivisao",
    insertText: "RestoDivisao(${1:<vnA>}, ${2:<vnB>}, ${3:<vnResto>});",
    detail: "RestoDivisao(a, b, Numero End) — substitui %",
    documentation:
      "**Parâmetros**\n- `vnA` (Numero) — Dividendo\n- `vnB` (Numero) — Divisor\n- `vnResto` (Numero) — Numero End com o resto\n\nOperador `%` não existe → use `RestoDivisao`.",
    isSnippet: true,
  },
  {
    label: "DataHora",
    insertText: "DataHora(${1:<vnDataHora>});",
    detail: "DataHora(Numero End) — instante numérico",
    documentation:
      "**Parâmetros**\n- `vnDataHora` (Numero) — Numero End com o instante (parte inteira = data, fração = hora)\n\nUse esse Numero em `FormatarData` (não passe Data `vd*`).\n\n```lsp\nDataHora(vnDH);\nFormatarData(vnDH, \"dd/mm/yyyy\", vaSaida);\n```",
    isSnippet: true,
  },
  {
    label: "ValorElementoJson",
    insertText: 'ValorElementoJson(${1:<vaJSON>}, "${2:<grupo>}", "${3:<campo>}", ${4:<vaValor>});',
    detail: "ValorElementoJson(json, grupo, campo, Alfa End)",
    documentation:
      "**Parâmetros**\n- `vaJSON` (Alfa) — Texto JSON\n- `grupo` (Alfa) — Nome do grupo; `\"\"` = raiz\n- `campo` (Alfa) — Nome do campo\n- `vaValor` (Alfa) — Alfa End com o valor lido",
    isSnippet: true,
  },
];

/** Labels extras só em overrides (não exigidos no JSON extraído). */
export const OVERRIDE_EXTRA_LABELS = ["Cancel(1)", "Cancel(2)", "Cancel(3)", "Pare", "Continue"];
