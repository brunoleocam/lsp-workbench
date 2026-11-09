import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  analyzeLsp,
  builtinFunctionNames,
  findCustomCalls,
  functionCatalogDivergences,
  LSP_FUNCTION_CATALOG,
  type LspFunctionEntry,
  mergeFunctionCatalog,
  normalizeParamType,
  parseExtraFunctionCatalog,
  parseSignatureParams,
} from "../index";

const entry = (label: string) => LSP_FUNCTION_CATALOG.find((e) => e.label === label);

describe("normalizeParamType", () => {
  it("normaliza variações de caixa e acento", () => {
    assert.equal(normalizeParamType("alfa"), "Alfa");
    assert.equal(normalizeParamType("Alfanumérico"), "Alfa");
    assert.equal(normalizeParamType("NUMERO"), "Numero");
    assert.equal(normalizeParamType("Número"), "Numero");
    assert.equal(normalizeParamType("data"), "Data");
    assert.equal(normalizeParamType("Lista"), "Lista");
    assert.equal(normalizeParamType("cursor"), "Cursor");
  });

  it("tipo desconhecido ou ausente → undefined", () => {
    assert.equal(normalizeParamType("?"), undefined);
    assert.equal(normalizeParamType("Grid"), undefined);
    assert.equal(normalizeParamType(undefined), undefined);
  });
});

describe("parseSignatureParams", () => {
  it("lê tipo, End e nome", () => {
    assert.deepEqual(parseSignatureParams("Funcao Potencia(Numero Base, Numero Expoente, Numero End Resultado);"), [
      { name: "Base", tipo: "Numero", out: false },
      { name: "Expoente", tipo: "Numero", out: false },
      { name: "Resultado", tipo: "Numero", out: true },
    ]);
  });

  it("aceita caixa baixa, prefixo de sistema e espaços irregulares", () => {
    assert.deepEqual(parseSignatureParams("ERP · ProcuraEnter(Alfa StrProcura, alfa end StrImp,alfa end StrResto)"), [
      { name: "StrProcura", tipo: "Alfa", out: false },
      { name: "StrImp", tipo: "Alfa", out: true },
      { name: "StrResto", tipo: "Alfa", out: true },
    ]);
  });

  it("parâmetro sem tipo fica com tipo undefined", () => {
    assert.deepEqual(parseSignatureParams("Mensagem(Tipo, Texto)"), [
      { name: "Tipo", tipo: undefined, out: false },
      { name: "Texto", tipo: undefined, out: false },
    ]);
  });

  it("sem parênteses ou lista vazia", () => {
    assert.equal(parseSignatureParams("Potencia"), undefined);
    assert.deepEqual(parseSignatureParams("DataHoje()"), []);
  });
});

describe("catálogo embutido com End estruturado (AC-030)", () => {
  it("Potencia: 3º parâmetro é saída do tipo Numero", () => {
    const p = entry("Potencia")?.params;
    assert.equal(p?.length, 3);
    assert.equal(p?.[2]?.out, true);
    assert.equal(p?.[2]?.tipo, "Numero");
    assert.equal(p?.[0]?.out, false);
  });

  it("ProcuraEnter: End em caixa baixa vira out", () => {
    const p = entry("ProcuraEnter")?.params;
    assert.deepEqual(p?.map((x) => x.out), [false, true, true]);
  });

  it("todas as entradas do embutido têm origin docs", () => {
    assert.ok(LSP_FUNCTION_CATALOG.every((e) => e.origin === "docs"));
  });
});

/** Funções inventadas — nenhum dado extraído de binário Senior. */
const BASE: LspFunctionEntry[] = [
  {
    label: "FakeSomar",
    insertText: "FakeSomar(${1:<A>}, ${2:<B>});",
    detail: "ERP · FakeSomar(Numero A, Numero B)",
    documentation:
      "**FakeSomar**\n`Funcao FakeSomar(Numero A, Numero B);`\n\nSoma dois números.\n\n**Exemplo**\n```\nFakeSomar(1, 2);\n```\n\n_Fonte: [doc](https://example.com/fakesomar)_",
    kind: "function",
    isSnippet: true,
    system: "ERP",
    params: [
      { name: "A", tipo: "Numero", description: "Primeira parcela", out: false },
      { name: "B", tipo: "Numero", description: "Segunda parcela", out: false },
    ],
    origin: "docs",
  },
  {
    label: "FakeSoNosso",
    insertText: "FakeSoNosso();",
    detail: "FakeSoNosso()",
    documentation: "**FakeSoNosso**\nSó na doc.",
    kind: "function",
    origin: "docs",
  },
];

const EXTRA_JSON = {
  $schema: "lsp-workbench-functions/v1",
  functions: {
    fakesomar: {
      nome: "FakeSomar",
      assinatura: "Funcao FakeSomar(Numero a, Numero b, Numero End Resultado);",
      params: [
        { tipo: "numero", saida: false, nome: "a" },
        { tipo: "numero", saida: false, nome: "b" },
        { tipo: "numero", saida: true, nome: "Resultado" },
      ],
      variantes: [
        [
          { tipo: "numero", saida: false, nome: "a" },
          { tipo: "numero", saida: false, nome: "b" },
          { tipo: "numero", saida: true, nome: "Resultado" },
        ],
        [{ tipo: "alfa", saida: true, nome: "Texto" }],
      ],
      origem: ["algum\\binario.exe"],
    },
    fakesoextra: {
      nome: "FakeSoExtra",
      assinatura: "Funcao FakeSoExtra(Alfa Linha);",
      params: [{ tipo: "alfa", saida: false, nome: "Linha" }],
    },
  },
};

describe("parseExtraFunctionCatalog", () => {
  it("lê o envelope v1", () => {
    const extra = parseExtraFunctionCatalog(EXTRA_JSON);
    assert.equal(extra?.functions.length, 2);
    const somar = extra?.functions.find((f) => f.name === "FakeSomar");
    assert.deepEqual(somar?.params[2], { name: "Resultado", tipo: "Numero", out: true });
    assert.equal(somar?.variants.length, 2);
  });

  it("aceita o mapa cru, sem envelope", () => {
    assert.equal(parseExtraFunctionCatalog(EXTRA_JSON.functions)?.functions.length, 2);
  });

  it("variantes ausentes = [params]", () => {
    const f = parseExtraFunctionCatalog(EXTRA_JSON)?.functions.find((x) => x.name === "FakeSoExtra");
    assert.deepEqual(f?.variants, [f?.params]);
  });

  it("conteúdo inválido → undefined", () => {
    assert.equal(parseExtraFunctionCatalog(null), undefined);
    assert.equal(parseExtraFunctionCatalog([1, 2]), undefined);
    assert.equal(parseExtraFunctionCatalog({ foo: 1 }), undefined);
    assert.equal(parseExtraFunctionCatalog({ functions: {} }), undefined);
  });

  it("o exemplo público do contrato é válido", () => {
    const path = join(__dirname, "..", "..", "..", "..", "docs", "product", "schema", "functions.example.json");
    const extra = parseExtraFunctionCatalog(JSON.parse(readFileSync(path, "utf8")));
    assert.equal(extra?.functions.length, 3);
  });
});

describe("mergeFunctionCatalog (AC-031)", () => {
  const extra = parseExtraFunctionCatalog(EXTRA_JSON)!;
  const merged = mergeFunctionCatalog(BASE, extra);
  const byLabel = (l: string) => merged.find((e) => e.label === l);

  it("função nos dois: estrutura do extra, texto nosso", () => {
    const e = byLabel("FakeSomar")!;
    assert.equal(e.origin, "merged");
    assert.equal(e.system, "ERP");
    assert.deepEqual(
      e.params?.map((p) => [p.name, p.tipo, p.out]),
      [
        ["a", "Numero", false],
        ["b", "Numero", false],
        ["Resultado", "Numero", true],
      ]
    );
    assert.equal(e.params?.[0]?.description, "Primeira parcela");
    assert.equal(e.variants?.length, 2);
    assert.equal(e.detail, "ERP · FakeSomar(Numero a, Numero b, Numero End Resultado)");
    assert.equal(e.insertText, "FakeSomar(${1:<a>}, ${2:<b>}, ${3:<Resultado>});");
    assert.match(e.documentation, /`Funcao FakeSomar\(Numero a, Numero b, Numero End Resultado\);`/);
    assert.doesNotMatch(e.documentation, /Funcao FakeSomar\(Numero A, Numero B\)/);
    assert.match(e.documentation, /Soma dois números/);
    assert.match(e.documentation, /FakeSomar\(1, 2\)/);
    assert.match(e.documentation, /example\.com\/fakesomar/);
  });

  it("função só nossa permanece igual", () => {
    assert.deepEqual(byLabel("FakeSoNosso"), BASE[1]);
  });

  it("função só do extra entra sem doc e sem origem do binário", () => {
    const e = byLabel("FakeSoExtra")!;
    assert.equal(e.origin, "extra");
    assert.equal(e.system, undefined);
    assert.equal(e.detail, "FakeSoExtra(Alfa Linha)");
    assert.equal(e.insertText, "FakeSoExtra(${1:<Linha>});");
    assert.match(e.documentation, /Sem documentação pública \(catálogo extra\)/);
    assert.doesNotMatch(e.documentation, /binario\.exe/);
  });

  it("não remove nenhuma função do embutido e não altera a entrada", () => {
    assert.equal(merged.length, 3);
    assert.equal(BASE[0]?.params?.length, 2);
  });

  it("função do catálogo efetivo não é tratada como chamada de função do usuário", () => {
    const src = "FakeSoExtra(vnX);\n";
    assert.equal(findCustomCalls(src).length, 1);
    const effective = mergeFunctionCatalog(LSP_FUNCTION_CATALOG, extra);
    assert.equal(findCustomCalls(src, builtinFunctionNames(effective)).length, 0);
    assert.ok(Array.isArray(analyzeLsp(src, { functionCatalog: effective })));
  });

  it("divergências entre embutido e extra são listadas", () => {
    assert.deepEqual(functionCatalogDivergences(BASE, extra), ["FakeSomar"]);
  });
});
