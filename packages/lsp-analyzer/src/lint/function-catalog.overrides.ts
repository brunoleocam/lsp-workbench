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
    detail: "Mensagem(Tipo, Alfa) — diálogo; botões em [&…]",
    documentation: `**Mensagem(Tipo, texto)**

Exibe um diálogo. Com botões no texto, atribua o retorno: a ordem dos botões começa em 0.

**Parâmetros**
- \`Tipo\`: Tipo do diálogo (não é comando de saída)
  - \`Retorna\`: informação; aceita botões entre colchetes
  - \`Erro\`: erro
  - \`Advertencia\`: aviso
- \`vaTexto\` (Alfa) — Texto do diálogo. Sem concatenar (\`+\`) no argumento
  - Botões entre colchetes, retorno a partir de 0: \`[&Ok]\` = 0; \`[&Sim,&Não]\` = 0 ou 1; \`[&Voltar,&Avançar, $Cancelar]\` = 0, 1 ou 2
  - \`&\` marca a tecla de atalho
  - \`vnRetorno = Mensagem(Retorna, vaTexto);\`

**Botões**

Entre colchetes, 1 ou mais rótulos. O retorno segue a sequência, iniciando em 0.

\`\`\`lsp
Definir Numero vnRetorno;

vnRetorno = Mensagem(Retorna, "Processo Concluído [&Ok!!!]"); @ vnRetorno = 0 @

vnRetorno = Mensagem(Retorna, "Deseja Sair ? [&Sim,&Não]"); @ 0 = Sim, 1 = Não @

vnRetorno = Mensagem(Retorna, "Escolha uma opção ? [&Voltar,&Avançar, $Cancelar]"); @ 0 = Voltar, 1 = Avançar, 2 = Cancelar @
\`\`\`

\`\`\`lsp
vaMsg = "Concluído";
Mensagem(Retorna, vaMsg);
\`\`\`

Para o usuário digitar um valor, use \`EntradaValor\`.`,
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
    insertText: "SQL_Criar(${1:<objeto>});",
    detail: "SQL_Criar(Alfa End objeto)",
    documentation:
      "**Parâmetros**\n- `objeto` (Alfa End) — Variável `Definir Alfa` que recebe o cursor\n\nCriar antes de qualquer outro comando deste cursor. Ordem: Criar → Usar* → DefinirComando → Definir* → Abrir → Fechar → Destruir.",
    isSnippet: true,
    params: [
      { name: "objeto", tipo: "Alfa", description: "Variável Alfa End que recebe o cursor. Criar antes dos demais comandos" },
    ],
  },
  {
    label: "SQL_DefinirComando",
    insertText: "SQL_DefinirComando(${1:<objeto>}, ${2:<comando>});",
    detail: "SQL_DefinirComando(Alfa objeto, Alfa comando)",
    documentation:
      "**Parâmetros**\n- `objeto` (Alfa) — Cursor criado com `SQL_Criar`\n- `comando` (Alfa) — Comando SQL (SELECT, INSERT ou UPDATE). Variável Alfa, sem concatenar na chamada\n\nSem este comando o cursor abre vazio. Chamar antes de `SQL_AbrirCursor`. `SQL_UsarAbrangencia` e `SQL_UsarSQLSenior2`, se usados, vêm antes desta função.",
    isSnippet: true,
    params: [
      { name: "objeto", tipo: "Alfa", description: "Cursor criado com SQL_Criar" },
      { name: "comando", tipo: "Alfa", description: "Comando SQL que carrega, altera ou insere registros" },
    ],
  },
  {
    label: "SQL_AbrirCursor",
    insertText: "SQL_AbrirCursor(${1:<Objeto>});",
    detail: "SQL_AbrirCursor(Alfa Objeto)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor com comando já definido\n\nAbre a transação com o banco e executa o SQL de `SQL_DefinirComando`. Sem comando definido, a execução é interrompida. Binds `SQL_Definir*` vêm antes desta chamada.",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor. Abre a transação e executa o comando já definido" },
    ],
  },
  {
    label: "SQL_Proximo",
    insertText: "SQL_Proximo(${1:<Objeto>});",
    detail: "SQL_Proximo(Alfa Objeto)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor cuja posição avança\n\nPosiciona o foco no próximo registro. Se o cursor já está em EOF, a execução é interrompida. Use dentro de `SQL_EOF(Objeto) = 0`.",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor. Avança para o próximo registro. Em EOF a execução para" },
    ],
  },
  {
    label: "SQL_FecharCursor",
    insertText: "SQL_FecharCursor(${1:<Objeto>});",
    detail: "SQL_FecharCursor(Alfa Objeto)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor da transação aberta\n\nFecha a pesquisa e libera a transação. O mesmo comando pode ser aberto de novo sem chamar `SQL_DefinirComando` outra vez. Depois: `SQL_Destruir`.",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor. Fecha a transação e libera a pesquisa" },
    ],
  },
  {
    label: "SQL_Destruir",
    insertText: "SQL_Destruir(${1:<objeto>});",
    detail: "SQL_Destruir(Alfa End objeto)",
    documentation:
      "**Parâmetros**\n- `objeto` (Alfa End) — Cursor que sai da memória\n\nChamar quando o cursor não for mais usado, depois de `SQL_FecharCursor`.",
    isSnippet: true,
    params: [
      { name: "objeto", tipo: "Alfa", description: "Cursor Alfa End a liberar da memória" },
    ],
  },
  {
    label: "SQL_EOF",
    insertText: "SQL_EOF(${1:<Objeto>})",
    detail: "SQL_EOF(Alfa Objeto) — 1 = EOF",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor\n\n**Retorno**\n- `1`: cursor na posição EOF (depois do último registro); campos nulos\n- `0`: ainda há registro",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor. 1 se está em EOF, 0 se ainda há registro" },
    ],
  },
  {
    label: "SQL_BOF",
    insertText: "SQL_BOF(${1:<Objeto>})",
    detail: "SQL_BOF(Alfa Objeto) — 1 = posição BOF",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor\n\n**Retorno**\n- `1`: cursor na posição BOF (antes do primeiro registro); campos nulos\n- `0`: cursor não está na posição BOF",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor. 1 se está na posição BOF, 0 caso contrário" },
    ],
  },
  {
    label: "SQL_DefinirAlfa",
    insertText: 'SQL_DefinirAlfa(${1:<Objeto>}, "${2:<Campo>}", ${3:<Valor>});',
    detail: "SQL_DefinirAlfa(Alfa Objeto, Alfa Campo, Alfa Valor)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor que será manipulado\n- `Campo` (Alfa) — Nome do parâmetro no comando SQL, sem `:`. No SQL use `:Campo`\n- `Valor` (Alfa) — Campo, Valor ou Variável que o parâmetro recebe\n\nChamar depois de `SQL_DefinirComando` e antes de `SQL_AbrirCursor`. Ao abrir, o comando é executado.",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor que será manipulado" },
      { name: "Campo", tipo: "Alfa", description: "Nome do parâmetro desejado dentro do comando SQL" },
      { name: "Valor", tipo: "Alfa", description: "Campo, Valor ou Variável Alfa que o parâmetro no comando SQL recebe" },
    ],
  },
  {
    label: "SQL_DefinirInteiro",
    insertText: 'SQL_DefinirInteiro(${1:<Objeto>}, "${2:<Campo>}", ${3:<Valor>});',
    detail: "SQL_DefinirInteiro(Alfa Objeto, Alfa Campo, Numero Valor)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor que será manipulado\n- `Campo` (Alfa) — Nome do parâmetro no comando SQL, sem `:`. No SQL use `:Campo`\n- `Valor` (Numero) — Campo, Valor ou Variável inteiro que o parâmetro recebe\n\nChamar depois de `SQL_DefinirComando` e antes de `SQL_AbrirCursor`. Ao abrir, o comando é executado.",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor que será manipulado" },
      { name: "Campo", tipo: "Alfa", description: "Nome do parâmetro desejado dentro do comando SQL" },
      { name: "Valor", tipo: "Numero", description: "Campo, Valor ou Variável inteiro que o parâmetro no comando SQL recebe" },
    ],
  },
  {
    label: "SQL_DefinirData",
    insertText: 'SQL_DefinirData(${1:<Objeto>}, "${2:<Campo>}", ${3:<Valor>});',
    detail: "SQL_DefinirData(Alfa Objeto, Alfa Campo, Data Valor)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor que será manipulado\n- `Campo` (Alfa) — Nome do parâmetro no comando SQL, sem `:`. No SQL use `:Campo`\n- `Valor` (Data) — Campo, Valor ou Variável Data que o parâmetro recebe\n\nAtribua a data (por exemplo com `CodData`) antes da chamada. Chamar depois de `SQL_DefinirComando` e antes de `SQL_AbrirCursor`.",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor que será manipulado" },
      { name: "Campo", tipo: "Alfa", description: "Nome do parâmetro desejado dentro do comando SQL" },
      { name: "Valor", tipo: "Data", description: "Campo, Valor ou Variável Data que o parâmetro no comando SQL recebe" },
    ],
  },
  {
    label: "SQL_DefinirBlob",
    insertText: 'SQL_DefinirBlob(${1:<Objeto>}, "${2:<Campo>}", ${3:<Valor>});',
    detail: "SQL_DefinirBlob(Alfa Objeto, Alfa Campo, Alfa Valor)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor que será manipulado\n- `Campo` (Alfa) — Nome do parâmetro no comando SQL, sem `:`. No SQL use `:Campo`\n- `Valor` (Alfa) — Campo, Valor ou Variável Alfa com o arquivo blob\n\nChamar depois de `SQL_DefinirComando` e antes de `SQL_AbrirCursor`. Ao abrir, o comando é executado.",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor que será manipulado" },
      { name: "Campo", tipo: "Alfa", description: "Nome do parâmetro desejado dentro do comando SQL" },
      { name: "Valor", tipo: "Alfa", description: "Campo, Valor ou Variável Alfa com o conteúdo do blob" },
    ],
  },
  {
    label: "SQL_DefinirFlutuante",
    insertText: 'SQL_DefinirFlutuante(${1:<Objeto>}, "${2:<Campo>}", ${3:<Valor>});',
    detail: "SQL_DefinirFlutuante(Alfa Objeto, Alfa Campo, Numero Valor)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor que será manipulado\n- `Campo` (Alfa) — Nome do parâmetro no comando SQL, sem `:`. No SQL use `:Campo`\n- `Valor` (Numero) — Campo, Valor ou Variável fracionado (ex.: 1,5) que o parâmetro recebe\n\nChamar depois de `SQL_DefinirComando` e antes de `SQL_AbrirCursor`. Ao abrir, o comando é executado.",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor que será manipulado" },
      { name: "Campo", tipo: "Alfa", description: "Nome do parâmetro desejado dentro do comando SQL" },
      { name: "Valor", tipo: "Numero", description: "Campo, Valor ou Variável fracionado que o parâmetro no comando SQL recebe" },
    ],
  },
  {
    label: "SQL_DefinirBoleano",
    insertText: 'SQL_DefinirBoleano(${1:<Objeto>}, "${2:<Campo>}", ${3:<Valor>});',
    detail: "SQL_DefinirBoleano(Alfa Objeto, Alfa Campo, Numero Valor)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor que será manipulado\n- `Campo` (Alfa) — Nome do parâmetro no comando SQL, sem `:`. No SQL use `:Campo`\n- `Valor` (Numero) — Campo, Valor ou Variável. `1` verdadeiro, `0` falso\n\nChamar depois de `SQL_DefinirComando` e antes de `SQL_AbrirCursor`. Ao abrir, o comando é executado.",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor que será manipulado" },
      { name: "Campo", tipo: "Alfa", description: "Nome do parâmetro desejado dentro do comando SQL" },
      { name: "Valor", tipo: "Numero", description: "Campo, Valor ou Variável. 1 verdadeiro, 0 falso" },
    ],
  },
  {
    label: "SQL_UsarAbrangencia",
    insertText: "SQL_UsarAbrangencia(${1:<Objeto>}, ${2:<usar>});",
    detail: "SQL_UsarAbrangencia(Alfa Objeto, Numero usar)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor\n- `usar` (Numero) — Abrangência de usuário. Chamar antes de `SQL_DefinirComando`\n  - `0`: não aplica\n  - outro número: aplica\n\nO padrão do cursor é aplicar abrangência. Com abrangência ligada, o comando tem de ser SQL Senior 2. SQL nativo exige `usar = 0` e `SQL_UsarSQLSenior2(Objeto, 0)`.",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor. Chamar antes de SQL_DefinirComando" },
      {
        name: "usar",
        tipo: "Numero",
        description: "0 não aplica abrangência; qualquer outro número aplica. O padrão do cursor é aplicar",
      },
    ],
  },
  {
    label: "SQL_UsarSQLSenior2",
    insertText: "SQL_UsarSQLSenior2(${1:<Objeto>}, ${2:<usar>});",
    detail: "SQL_UsarSQLSenior2(Alfa Objeto, Numero usar)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor\n- `usar` (Numero) — Dialeto do comando. Chamar antes de `SQL_DefinirComando`\n  - `0`: sintaxe nativa do banco\n  - diferente de zero: SQL Senior 2\n\nSe a função não for chamada, o cursor usa SQL Senior 2. `SQL_Criar` não herda a opção global da regra. Com nativo, desligue a abrangência antes (`SQL_UsarAbrangencia(Objeto, 0)`); senão a regra para com erro de abrangência.",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor. Chamar antes de SQL_DefinirComando" },
      {
        name: "usar",
        tipo: "Numero",
        description: "0 sintaxe nativa; diferente de zero SQL Senior 2. O padrão, se não chamar, é Senior 2",
      },
    ],
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
    insertText: 'SQL_RetornarAlfa(${1:<Objeto>}, "${2:<Campo>}", ${3:<Valor>});',
    detail: "SQL_RetornarAlfa(Alfa Objeto, Alfa Campo, Alfa End Valor)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor posicionado no registro\n- `Campo` (Alfa) — Nome do campo na tabela\n- `Valor` (Alfa End) — Variável Alfa local que recebe o valor (não parâmetro `p*`)",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor posicionado no registro" },
      { name: "Campo", tipo: "Alfa", description: "Nome do campo na tabela" },
      { name: "Valor", tipo: "Alfa", description: "Variável Alfa End que recebe o valor do campo" },
    ],
  },
  {
    label: "SQL_RetornarInteiro",
    insertText: 'SQL_RetornarInteiro(${1:<Objeto>}, "${2:<Campo>}", ${3:<Valor>});',
    detail: "SQL_RetornarInteiro(Alfa Objeto, Alfa Campo, Numero End Valor)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor posicionado no registro\n- `Campo` (Alfa) — Nome do campo no cursor\n- `Valor` (Numero End) — Variável Numero local que recebe a parte inteira (não parâmetro `p*`)\n\nValor fracionado volta só a parte inteira (5,45 vira 5). Para decimais, use `SQL_RetornarFlutuante`.",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor posicionado no registro" },
      { name: "Campo", tipo: "Alfa", description: "Nome do campo no cursor" },
      { name: "Valor", tipo: "Numero", description: "Variável Numero End. Fracionado devolve só a parte inteira" },
    ],
  },
  {
    label: "SQL_RetornarData",
    insertText: 'SQL_RetornarData(${1:<Objeto>}, "${2:<Campo>}", ${3:<Valor>});',
    detail: "SQL_RetornarData(Alfa Objeto, Alfa Campo, Data End Valor)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor posicionado no registro\n- `Campo` (Alfa) — Nome do campo na tabela\n- `Valor` (Data End) — Variável Data local que recebe o valor (não parâmetro `p*`)",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor posicionado no registro" },
      { name: "Campo", tipo: "Alfa", description: "Nome do campo na tabela" },
      { name: "Valor", tipo: "Data", description: "Variável Data End que recebe o valor do campo" },
    ],
  },
  {
    label: "SQL_RetornarFlutuante",
    insertText: 'SQL_RetornarFlutuante(${1:<Objeto>}, "${2:<Campo>}", ${3:<Valor>});',
    detail: "SQL_RetornarFlutuante(Alfa Objeto, Alfa Campo, Numero End Valor)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor posicionado no registro\n- `Campo` (Alfa) — Nome do campo na tabela\n- `Valor` (Numero End) — Variável Numero local que recebe o valor com decimais (não parâmetro `p*`)\n\nCampo Double usa esta função: o valor pode ser maior do que um inteiro.",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor posicionado no registro" },
      { name: "Campo", tipo: "Alfa", description: "Nome do campo na tabela" },
      { name: "Valor", tipo: "Numero", description: "Variável Numero End. Obrigatória para campo Double" },
    ],
  },
  {
    label: "SQL_RetornarBoleano",
    insertText: 'SQL_RetornarBoleano(${1:<Objeto>}, "${2:<Campo>}", ${3:<Valor>});',
    detail: "SQL_RetornarBoleano(Alfa Objeto, Alfa Campo, Numero End Valor)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor posicionado no registro\n- `Campo` (Alfa) — Nome do campo na tabela\n- `Valor` (Numero End) — Variável Numero local que recebe o flag (não parâmetro `p*`)\n  - `1`: verdadeiro\n  - `0`: falso",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor posicionado no registro" },
      { name: "Campo", tipo: "Alfa", description: "Nome do campo na tabela" },
      { name: "Valor", tipo: "Numero", description: "Variável Numero End. 1 verdadeiro, 0 falso" },
    ],
  },
  {
    label: "SQL_RetornarBlob",
    insertText: 'SQL_RetornarBlob(${1:<Objeto>}, "${2:<Campo>}", ${3:<Valor>});',
    detail: "SQL_RetornarBlob(Alfa Objeto, Alfa Campo, Alfa End Valor)",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor posicionado no registro\n- `Campo` (Alfa) — Nome do campo na tabela\n- `Valor` (Alfa End) — Variável Alfa local que recebe o conteúdo binário (não parâmetro `p*`)",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor posicionado no registro" },
      { name: "Campo", tipo: "Alfa", description: "Nome do campo na tabela" },
      { name: "Valor", tipo: "Alfa", description: "Variável Alfa End com o conteúdo binário do campo" },
    ],
  },
  {
    label: "SQL_RetornarSeNulo",
    insertText: '${1:<vnNulo>} = SQL_RetornarSeNulo(${2:<Objeto>}, "${3:<Campo>}");',
    detail: "SQL_RetornarSeNulo(Alfa Objeto, Alfa Campo) — 1 = nulo",
    documentation:
      "**Parâmetros**\n- `Objeto` (Alfa) — Cursor posicionado no registro\n- `Campo` (Alfa) — Nome do campo na tabela\n\n**Retorno** (por atribuição ou na condição, não por parâmetro End)\n- `1`: o campo é nulo\n- `0`: o campo não é nulo\n\nNão trata Alfa vazio nem número zero como nulo.",
    isSnippet: true,
    params: [
      { name: "Objeto", tipo: "Alfa", description: "Cursor posicionado no registro" },
      { name: "Campo", tipo: "Alfa", description: "Nome do campo na tabela. 1 se nulo, 0 se não nulo" },
    ],
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
