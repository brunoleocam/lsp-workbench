import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzeLsp,
  buildEffectiveFunctionCatalog,
  type DiagnosticHit,
  LSP_FUNCTION_CATALOG,
  type LspFunctionEntry,
} from "../index";

const EXTRA = JSON.stringify({
  functions: {
    intparaalfa: {
      nome: "IntParaAlfa",
      assinatura: "Funcao IntParaAlfa(Numero Origem, Alfa end Retorno);",
      params: [
        { tipo: "numero", saida: false, nome: "Origem" },
        { tipo: "alfa", saida: true, nome: "Retorno" },
      ],
    },
    tamanhoalfa: {
      nome: "TamanhoAlfa",
      assinatura: "Funcao TamanhoAlfa(alfa Origem, numero end Tam);",
      params: [
        { tipo: "alfa", saida: false, nome: "Origem" },
        { tipo: "numero", saida: true, nome: "Tam" },
      ],
    },
  },
});

const withExtra = buildEffectiveFunctionCatalog(EXTRA, LSP_FUNCTION_CATALOG).catalog;

function fun(src: string, id: string, functionCatalog = withExtra): DiagnosticHit[] {
  return analyzeLsp(src, { functionCatalog }).filter((h) => h.id === id);
}

const funDocs = (src: string, id: string) => fun(src, id, LSP_FUNCTION_CATALOG);

describe("FUN010 — função não declarada (AC-040)", () => {
  it("aviso sem catálogo extra, erro com ele", () => {
    const src = "FuncaoQueNaoExiste(1);\n";
    const semExtra = funDocs(src, "FUN010");
    assert.equal(semExtra.length, 1);
    assert.equal(semExtra[0].severity, "warning");
    assert.equal(semExtra[0].message, 'Falta declaração do "Label/Função" = "FuncaoQueNaoExiste"');
    assert.equal(semExtra[0].startCol, 0);
    assert.equal(semExtra[0].endCol, "FuncaoQueNaoExiste".length);
    const comExtra = fun(src, "FUN010");
    assert.equal(comExtra.length, 1);
    assert.equal(comExtra[0].severity, "error");
  });

  it("função local, embutido, constante e método de cursor/lista não disparam", () => {
    const src = [
      "Definir Funcao Minha();",
      "Definir Cursor Cur;",
      "Definir Lista vlL;",
      "Minha();",
      'Mensagem(Erro, "x");',
      "Cur.AbrirCursor();",
      'vlL.AdicionarCampo("X", Alfa);',
      "Se ((vnA > 0) e (vnB < 1)) { Cancel(1); }",
      "Funcao Minha(); { vnA = 1; }",
      "",
    ].join("\n");
    assert.deepEqual(funDocs(src, "FUN010"), []);
  });

  it("Arredondar e Chr ficam só com FUN005 / RUL012", () => {
    const hits = analyzeLsp("Arredondar(vnA, 2);\nvaT = Chr(13);\n");
    assert.equal(hits.filter((h) => h.id === "FUN010").length, 0);
    assert.equal(hits.filter((h) => h.id === "FUN005").length, 1);
    assert.equal(hits.filter((h) => h.id === "RUL012").length, 1);
  });

  it("função de outro arquivo do escopo fica com FUN009, não FUN010", () => {
    const scopedExternal = new Map([["outra", { fileName: "b.lsp" }]]);
    const hits = analyzeLsp("Outra();\n", { scopedExternal }).filter((h) => h.id === "FUN010");
    assert.deepEqual(hits, []);
  });

  it("ignora chamada dentro de string e comentário, inclusive SQL com \\ seguido de espaços", () => {
    const src = [
      '@ Foo(1) @',
      'vaSql = "SELECT NVL(A, 0) \\   ',
      '  FROM X WHERE UPPER(B) = 1";',
      "/* Bar(2); */",
      "",
    ].join("\n");
    assert.deepEqual(funDocs(src, "FUN010"), []);
  });
});

describe("FUN011 — número de argumentos (AC-041)", () => {
  it("faixa do embutido: Cancel(1, 2) e Retorna(a, b)", () => {
    const cancel = funDocs("Cancel(1, 2);\n", "FUN011");
    assert.equal(cancel.length, 1);
    assert.equal(cancel[0].message, 'Muitos parâmetros na chamada da função "Cancel"');
    assert.equal(funDocs("Retorna(vnA, vnB);\n", "FUN011").length, 1);
    assert.deepEqual(funDocs("Retorna(vnA);\nRetorna();\nCancel(1);\n", "FUN011"), []);
  });

  it("faltam parâmetros: IntParaAlfa(vn) com catálogo extra; só a doc pública não basta", () => {
    const src = "Definir Numero vn;\nIntParaAlfa(vn);\n";
    const hits = fun(src, "FUN011");
    assert.equal(hits.length, 1);
    assert.equal(hits[0].message, 'Faltam parâmetros na chamada da função "IntParaAlfa"');
    assert.deepEqual(funDocs(src, "FUN011"), []);
  });

  it("RUL019 continua valendo e não vira FUN011", () => {
    const hits = analyzeLsp("Cancel(5);\n");
    assert.equal(hits.filter((h) => h.id === "RUL019").length, 1);
    assert.equal(hits.filter((h) => h.id === "FUN011").length, 0);
  });

  it("chamada em várias linhas conta os argumentos até o ) correspondente", () => {
    const src = "Definir Numero vn;\nDefinir Alfa vaS;\nIntParaAlfa(vn,\n  vaS);\n";
    assert.deepEqual(fun(src, "FUN011"), []);
  });
});

describe("FUN012 — tipo do argumento (AC-042)", () => {
  it("Alfa declarado em parâmetro Numero do catálogo extra", () => {
    const src = "Definir Alfa vaTexto;\nDefinir Alfa vaSaida;\nIntParaAlfa(vaTexto, vaSaida);\n";
    const hits = fun(src, "FUN012");
    assert.equal(hits.length, 1);
    assert.equal(
      hits[0].message,
      'valor "vaTexto" (ALFA) para o parâmetro "Origem" (NUMERO) são incompatíveis'
    );
    assert.equal(hits[0].line, 2);
    assert.equal(hits[0].startCol, "IntParaAlfa(".length);
  });

  it("literal numérico em parâmetro Alfa", () => {
    assert.equal(fun("TamanhoAlfa(5, vnTam);\n", "FUN012").length, 1);
  });

  it("'X' passa nos dois tipos e Data conta como Numero", () => {
    const src = [
      "Definir Data vdHoje;",
      "Definir Alfa vaS;",
      "IntParaAlfa('X', vaS);",
      "TamanhoAlfa('X', vnTam);",
      "IntParaAlfa(vdHoje, vaS);",
      'TamanhoAlfa("abc", vnTam);',
      "",
    ].join("\n");
    assert.deepEqual(fun(src, "FUN012"), []);
  });

  it("sem Definir não infere tipo pelo prefixo (o Senior assume Numero implícito)", () => {
    assert.deepEqual(fun("IntParaAlfa(vaX, vaS);\n", "FUN012"), []);
  });

  it("sem catálogo extra não checa tipo (a doc pública tem tipos errados)", () => {
    const src = "Definir Numero vn;\nDefinir Alfa vaS;\nIntParaAlfa(vn, vaS);\n";
    assert.deepEqual(funDocs(src, "FUN012"), []);
  });
});

describe("FUN013 / FUN014 — argumento de saída (AC-043)", () => {
  it("expressão no parâmetro de saída", () => {
    const src = "Definir Numero vn;\nDefinir Alfa vaA;\nDefinir Alfa vaB;\nIntParaAlfa(vn, vaA + vaB);\n";
    const hits = fun(src, "FUN013");
    assert.equal(hits.length, 1);
    assert.equal(
      hits[0].message,
      'valor "vaA + vaB" (ALFA) para o parâmetro "Retorno" (ALFA) não pode ser uma expressão'
    );
  });

  it("constante no parâmetro de saída", () => {
    const hits = fun('IntParaAlfa(vn, "x");\n', "FUN013");
    assert.equal(hits.length, 1);
    assert.match(hits[0].message, /não pode ser constante$/);
  });

  it("campo de cursor → FUN014; Tabela.Campo e variável indexada passam", () => {
    const src = [
      "Definir Cursor Cur;",
      "Definir Alfa vaVet[3];",
      "IntParaAlfa(vn, Cur.Campo);",
      "IntParaAlfa(vn, E075PRO.DESPRO);",
      "IntParaAlfa(vn, vaVet[1]);",
      "",
    ].join("\n");
    const cursor = fun(src, "FUN014");
    assert.equal(cursor.length, 1);
    assert.equal(cursor[0].line, 2);
    assert.equal(
      cursor[0].message,
      'valor "Cur.Campo" (?) para o parâmetro "Retorno" (ALFA) não pode ser campo de cursor'
    );
    assert.deepEqual(fun(src, "FUN013"), []);
  });

  it("End da doc pública alimenta FUN013 sem checar nº nem tipo", () => {
    const docsOnly: LspFunctionEntry = {
      label: "MinhaDoc",
      insertText: "MinhaDoc($1, $2);",
      detail: "MinhaDoc(Numero Entrada, Alfa End Saida)",
      documentation: "",
      params: [
        { name: "Entrada", tipo: "Numero" },
        { name: "Saida", tipo: "Alfa", out: true },
      ],
      origin: "docs",
    };
    const catalog = [...LSP_FUNCTION_CATALOG, docsOnly];
    const src = "Definir Alfa vaT;\nMinhaDoc(1, vaT + vaT);\nMinhaDoc(1);\nMinhaDoc(vaT, vaT);\n";
    assert.equal(fun(src, "FUN013", catalog).length, 1);
    assert.deepEqual(fun(src, "FUN011", catalog), []);
    assert.deepEqual(fun(src, "FUN012", catalog), []);
  });

  it("ignoreIds desliga as checagens de chamada", () => {
    const hits = analyzeLsp("FuncaoQueNaoExiste(1);\nCancel(1, 2);\n", ["FUN010", "FUN011"]);
    assert.equal(hits.filter((h) => /^FUN01[01]$/.test(h.id)).length, 0);
  });
});
