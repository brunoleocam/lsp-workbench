/** Overrides curados — vencem o catálogo gerado (snippets / docs ricos). */
import type { LspFunctionEntry } from "./function-catalog.types";

export const LSP_FUNCTION_CATALOG_OVERRIDES: LspFunctionEntry[] = [
  {
    label: "Mensagem",
    insertText: "Mensagem(${1|Retorna,Erro,Advertencia|}, ${2:vaTexto});",
    detail: "Mensagem(Tipo, Alfa) — exibir diálogo",
    documentation:
      "**Mensagem(Tipo, texto)**\n\n- `Retorna` / `Erro` / `Advertencia` = tipo (não é comando de saída)\n- Passe só variável Alfa (sem `+` no argumento)\n\n```lsp\nvaMsg = \"Concluído\";\nMensagem(Retorna, vaMsg);\n```",
    isSnippet: true,
  },
  {
    label: "Cancel",
    insertText: "Cancel(${1|1,2,3|});",
    detail: "Cancel(1|2|3) — interromper regra",
    documentation:
      "**Cancel(n)** — só `1`, `2` ou `3`.\n\n| Código | Uso |\n|--------|-----|\n| **1** | Interromper regra / erro (padrão em tela e funções) |\n| **2** | Relatório: imprime `ValStr`/`ValRet` e sai |\n| **3** | Relatório: fórmula — exclui registro atual |\n\nEm eventos de tela, qualquer `n` só cancela a regra.",
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
    insertText: "EstaNulo(${1:vaDado}, ${2:vnEhNulo});\nSe (${2:vnEhNulo} = 0) {\n  $0\n}",
    detail: "EstaNulo(Alfa, Numero End) — fora do Se",
    documentation:
      "1º param **Alfa** (não Data). Não use `Se (EstaNulo(...)=0)`.\n\n```lsp\nEstaNulo(vaDado, vnEhNulo);\nSe (vnEhNulo = 0) { … }\n```",
    isSnippet: true,
  },
  {
    label: "FormatarData",
    insertText: 'FormatarData(${1:vnDataHora}, "${2:dd/mm/yyyy}", ${3:vaSaida});',
    detail: "FormatarData(Numero, máscara, Alfa End)",
    documentation:
      "1º arg **Numero** (não `vd*`). Máscara em minúsculas: `dd/mm/yyyy`.",
    isSnippet: true,
  },
  {
    label: "CodData",
    insertText: "${1:vdData} = CodData(${2:vnDia}, ${3:vnMes}, ${4:vnAno});",
    detail: "CodData(dia, mes, ano) — retorna Data",
    documentation: "Atribuição: `vd = CodData(15, 8, 1990);`",
    isSnippet: true,
  },
  {
    label: "Truncar",
    insertText: "${1:vnResultado} = Truncar(${2:vnValor});",
    detail: "Truncar(Numero) — retorna inteiro",
    documentation: "Usa atribuição. Para casas: `TruncarDecimal`.",
    isSnippet: true,
  },
  {
    label: "Abrir",
    insertText: 'Abrir(${1:vaArquivo}, "${2:R}");',
    detail: "Abrir(caminho, modo) — arquivo",
    documentation: "Arquivo (não cursor). Parear com `Fechar`. Modos típicos: `R`/`W`/`A`.",
    isSnippet: true,
  },
  {
    label: "ArqExiste",
    insertText: "${1:vnExiste} = ArqExiste(${2:vaCaminho});",
    detail: "ArqExiste(caminho) — retorna Numero",
    documentation: "1 se existe, 0 caso contrário.",
    isSnippet: true,
  },
  {
    label: "SQL_Criar",
    insertText: "SQL_Criar(${1:vaCur});",
    detail: "SQL_Criar(Alfa handle)",
    documentation:
      "Handle deve ser `Definir Alfa`. Ordem: Criar → Usar* → DefinirComando → Abrir → Fechar → Destruir. Para o pipeline completo, use o seed **Cursor completo** (Ctrl+Espaço).",
    isSnippet: true,
  },
  {
    label: "SQL_DefinirComando",
    insertText: "SQL_DefinirComando(${1:vaCur}, ${2:vaSQL});",
    detail: "SQL_DefinirComando(handle, Alfa SQL)",
    documentation: "Define o comando SQL do handle. Depois: AbrirCursor → loop EOF → Fechar → Destruir.",
    isSnippet: true,
  },
  {
    label: "SQL_AbrirCursor",
    insertText: "SQL_AbrirCursor(${1:vaCur});",
    detail: "SQL_AbrirCursor(handle)",
    documentation: "Abre o cursor do handle criado com SQL_Criar.",
    isSnippet: true,
  },
  {
    label: "SQL_Proximo",
    insertText: "SQL_Proximo(${1:vaCur});",
    detail: "SQL_Proximo(handle)",
    documentation: "Avança para o próximo registro. Usar dentro do loop `SQL_EOF(...) = 0`.",
    isSnippet: true,
  },
  {
    label: "SQL_FecharCursor",
    insertText: "SQL_FecharCursor(${1:vaCur});",
    detail: "SQL_FecharCursor(handle)",
    documentation: "Fecha o cursor. Depois: SQL_Destruir.",
    isSnippet: true,
  },
  {
    label: "SQL_Destruir",
    insertText: "SQL_Destruir(${1:vaCur});",
    detail: "SQL_Destruir(handle)",
    documentation: "Libera o handle. Sempre após FecharCursor.",
    isSnippet: true,
  },
  {
    label: "SQL_EOF",
    insertText: "SQL_EOF(${1:vaCur})",
    detail: "SQL_EOF(handle) — 0 = há registro",
    documentation:
      "```lsp\nEnquanto (SQL_EOF(vaCur) = 0) {\n  …\n  SQL_Proximo(vaCur);\n}\n```",
    isSnippet: true,
  },
  {
    label: "SQL_UsarAbrangencia",
    insertText: "SQL_UsarAbrangencia(${1:vaCur}, 0);",
    detail: "SQL_UsarAbrangencia(handle, 0) — nativo",
    documentation: "Antes de DefinirComando, junto com UsarSQLSenior2(0), para JOIN/subquery.",
    isSnippet: true,
  },
  {
    label: "SQL_UsarSQLSenior2",
    insertText: "SQL_UsarSQLSenior2(${1:vaCur}, 0);",
    detail: "SQL_UsarSQLSenior2(handle, 0) — nativo",
    documentation: "Antes de DefinirComando, junto com UsarAbrangencia(0).",
    isSnippet: true,
  },
  {
    label: "ExecSQLEx",
    insertText: "ExecSQLEx(${1:vaSQL}, ${2:vnRet});",
    detail: "ExecSQLEx(SQL, Numero End) — 0=sucesso",
    documentation: "**0** = sucesso, **1** = erro (não inverter).",
    isSnippet: true,
  },
  {
    label: "SQL_RetornarAlfa",
    insertText: 'SQL_RetornarAlfa(${1:vaCur}, "${2:CAMPO}", ${3:vaDestino});',
    detail: "SQL_RetornarAlfa(handle, campo, Alfa End)",
    documentation: "Destino local `va*` (não parâmetro `p*`).",
    isSnippet: true,
  },
  {
    label: "SQL_RetornarInteiro",
    insertText: 'SQL_RetornarInteiro(${1:vaCur}, "${2:CAMPO}", ${3:vnDestino});',
    detail: "SQL_RetornarInteiro(handle, campo, Numero End)",
    documentation: "Destino local `vn*` (não `p*`).",
    isSnippet: true,
  },
  {
    label: "SQL_RetornarData",
    insertText: 'SQL_RetornarData(${1:vaCur}, "${2:CAMPO}", ${3:vdDestino});',
    detail: "SQL_RetornarData(handle, campo, Data End)",
    documentation: "Destino local `vd*` (não parâmetro).",
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
    insertText: "CaracterParaAlfa(${1:13}, ${2:vaChar});",
    detail: "CaracterParaAlfa(Numero, Alfa End) — ex.: Enter=13",
    documentation:
      "Substitui `Chr` (inexistente).\n\n```lsp\nCaracterParaAlfa(13, vaEnter);\n```",
    isSnippet: true,
  },
  {
    label: "RestoDivisao",
    insertText: "RestoDivisao(${1:vnA}, ${2:vnB}, ${3:vnResto});",
    detail: "RestoDivisao(a, b, Numero End) — substitui %",
    documentation: "Operador `%` não existe → use RestoDivisao.",
    isSnippet: true,
  },
  {
    label: "DataHora",
    insertText: "DataHora(${1:vnDataHora});",
    detail: "DataHora(Numero End) — instante numérico",
    documentation:
      "Obtém instante como Numero (para `FormatarData`).\n\n```lsp\nDataHora(vnDH);\nFormatarData(vnDH, \"dd/mm/yyyy\", vaSaida);\n```",
    isSnippet: true,
  },
  {
    label: "ValorElementoJson",
    insertText: 'ValorElementoJson(${1:vaJSON}, "${2:grupo}", "${3:campo}", ${4:vaValor});',
    detail: "ValorElementoJson(json, grupo, campo, Alfa End)",
    documentation: 'Lê campo JSON. Grupo vazio `""` = raiz.',
    isSnippet: true,
  },
];

/** Labels extras só em overrides (não exigidos no JSON extraído). */
export const OVERRIDE_EXTRA_LABELS = ["Cancel(1)", "Cancel(2)", "Cancel(3)", "Pare", "Continue"];
