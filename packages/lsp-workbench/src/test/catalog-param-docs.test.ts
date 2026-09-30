import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  docsForSnippetParams,
  formatParamHover,
  orderedCatalogParams,
  snippetParamNames,
} from "../catalog-param-docs";

const CONVERTE = `**ConverteMascara**
\`ConverteMascara(<tipoDado>, <valorOrigem>, <alfaDestino>, <mascara>);\`

**Parâmetros**
- \`tipoDado\`: Código que determina o tipo do valor de origem
  - \`1\`: Número
  - \`2\`: Dinheiro (valor)
  - \`3\`: Data
  - \`4\`: Hora
  - \`5\`: Alfa
- \`valorOrigem\`: Campo/Variável/Valor a ser convertido
- \`alfaDestino\`: Variável que receberá o resultado da conversão
- \`mascara\`: Especifica o formato de apresentação do resultado
`;

describe("catalog-param-docs", () => {
  it("tipoDado leva o enum aninhado", () => {
    const names = snippetParamNames(
      "ConverteMascara(${1:tipoDado}, ${2:valorOrigem}, ${3:alfaDestino}, ${4:mascara});"
    );
    const docs = docsForSnippetParams(CONVERTE, names);
    const tipo = docs.get("tipodado");
    assert.ok(tipo);
    assert.match(tipo, /Número/);
    assert.match(tipo, /Dinheiro/);
    assert.match(tipo, /Alfa/);
    assert.doesNotMatch(docs.get("mascara") ?? "", /Número/);
  });

  it("algoritmo de GeraHash recebe a lista solta", () => {
    const md = `**GeraHash**

**Algoritmos Suportados**
- \`1\`: MD5 (128 bits)
- \`3\`: SHA-256 (256 bits)
`;
    const docs = docsForSnippetParams(md, ["texto", "algoritmo", "hash"]);
    assert.match(docs.get("algoritmo") ?? "", /SHA-256/);
  });

  it("pDia de RetDiaSemana recebe os dias", () => {
    const md = `**RetDiaSemana**

**Parâmetros**
- \`pData\`: Variável numérica que recebe a data atual
- \`pDia\`: Variável numérica que retorna o dia da semana da data atual

**Valores de retorno**
- 0 = Domingo
- 1 = Segunda-feira
`;
    const docs = docsForSnippetParams(md, ["pData", "pDia"]);
    assert.match(docs.get("pdia") ?? "", /Domingo/);
    assert.doesNotMatch(docs.get("pdata") ?? "", /Domingo/);
  });

  it("observa tipo 5 gruda em tipoDado e p1 herda o parâmetro data", () => {
    const md = `${CONVERTE}
**Observação**
No caso de o tipo de dado ser 5 (Alfa), valorOrigem vai como 0.
`;
    const docs = docsForSnippetParams(md, ["tipoDado", "valorOrigem", "alfaDestino", "mascara"]);
    assert.match(docs.get("tipodado") ?? "", /tipo de dado ser 5/);
    assert.doesNotMatch(docs.get("mascara") ?? "", /tipo de dado ser 5/);

    const ano = `**Parâmetros**
- \`data\`: Data base
- \`bissexto\`: Indicador
  - 0: se o ano não for bissexto
  - 1: se o ano for bissexto
`;
    const aligned = docsForSnippetParams(ano, ["p1", "bissexto"]);
    assert.match(aligned.get("p1") ?? "", /Data base/);
    assert.match(aligned.get("bissexto") ?? "", /bissexto/);
  });

  it("lê (Tipo) — descrição", () => {
    const md = `**Parâmetros**
- \`CodMod\` (Alfa) — Código do modelo.
- \`CodEtg\` (Numero) — Código do estágio.
`;
    const params = orderedCatalogParams(md, ["Alfa CodMod", "Numero CodEtg"]);
    assert.equal(params[0]?.tipo, "Alfa");
    assert.match(params[0]?.documentation ?? "", /Código do modelo/);
    assert.equal(params[1]?.tipo, "Numero");
    const hover = formatParamHover("AdicionaComponenteModelo", params[0]!);
    assert.match(hover, /\(Alfa\)/);
    assert.match(hover, /Código do modelo/);
  });

  it("Dica gruda só no argumento citado", () => {
    const md = `**Parâmetros**
- \`texto\`: Origem
- \`decimal\`: Destino
**Dica**
Não grave direto em \`decimal\`.
`;
    const params = orderedCatalogParams(md, ["texto", "decimal"]);
    assert.doesNotMatch(params[0]?.documentation ?? "", /direto/);
    assert.match(params[1]?.documentation ?? "", /direto/);
  });
});
