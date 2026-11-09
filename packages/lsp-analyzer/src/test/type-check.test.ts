import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeLsp, catalogColumnValueType, type DiagnosticHit } from "../index";

const DECL = "Definir Alfa va;\nDefinir Numero vn;\nDefinir Data vd;\nDefinir Cursor Cur;\n";
const DECL_LINES = 4;

function typ(body: string, opts: Parameters<typeof analyzeLsp>[1] = {}): DiagnosticHit[] {
  return analyzeLsp(DECL + body, opts).filter((h) => /^TYP00\d$/.test(h.id));
}

describe("TYP001 — atribuição Alfa × Numero (AC-050)", () => {
  it("Alfa recebendo número e Numero recebendo texto", () => {
    const a = typ("va = 1;\n");
    assert.equal(a.length, 1);
    assert.equal(a[0].id, "TYP001");
    assert.equal(a[0].message, "tipos incompatíveis: ALFA e NUMERO");
    assert.equal(a[0].line, DECL_LINES);
    assert.equal(a[0].startCol, 0);
    assert.equal(a[0].endCol, 2);
    const n = typ('vn = "x";\n');
    assert.equal(n.length, 1);
    assert.equal(n[0].message, "tipos incompatíveis: NUMERO e ALFA");
  });

  it("concatenação de Alfa, Data como Numero e 'X' não disparam", () => {
    const src = 'va = va + "x";\nvd = vn + 1;\nvn = vd;\nvn = \'A\';\nva = \'A\';\n';
    assert.deepEqual(typ(src), []);
  });

  it("++ e -= com Alfa", () => {
    assert.equal(typ("va++;\n")[0]?.message, "tipos incompatíveis: ALFA e NUMERO");
    assert.equal(typ("vn -= va;\n")[0]?.message, "tipos incompatíveis: ALFA e NUMERO");
    assert.deepEqual(typ('va += "x";\nvn += 1;\nvn++;\n'), []);
  });

  it("parâmetro de Funcao tem o tipo da assinatura", () => {
    const hits = typ('Funcao F(Numero vnP); {\n  vnP = "x";\n}\n');
    assert.equal(hits.length, 1);
    assert.equal(hits[0].id, "TYP001");
  });

  it("Tabela.Campo usa o tipo do catálogo de banco; sem catálogo, nada", () => {
    const catalogColumnTypes = new Map([["E075PRO.CODPRO", "Alfa" as const]]);
    assert.equal(typ("E075PRO.CodPro = 1;\n", { catalogColumnTypes })[0]?.id, "TYP001");
    assert.deepEqual(typ("E075PRO.CodPro = 1;\n"), []);
  });

  it("campo de cursor e variável sem Definir têm tipo desconhecido", () => {
    assert.deepEqual(typ('Cur.CodPro = 1;\nvn = Cur.DesPro;\nvaSemDefinir = 1;\nvaSemDefinir = "x";\n'), []);
  });

  it("Para: inicialização e passo são atribuições", () => {
    assert.equal(typ("Para (va = 1; vn < 10; vn++) { vn = 1; }\n")[0]?.id, "TYP001");
    assert.deepEqual(typ("Para (vn = 1; vn <= 10; vn++) { va = \"x\"; }\n"), []);
  });
});

describe("TYP002 — comparação e operador com Alfa (AC-050)", () => {
  it("comparação Alfa × Numero no Se, grifando o operador", () => {
    const hits = typ("Se (va = 1) { vn = 1; }\n");
    assert.equal(hits.length, 1);
    assert.equal(hits[0].id, "TYP002");
    assert.equal(hits[0].message, "tipos incompatíveis: ALFA e NUMERO");
    assert.equal(hits[0].startCol, "Se (va ".length);
  });

  it("operador aritmético com Alfa", () => {
    const mul = typ("vn = va * 2;\n");
    assert.equal(mul.length, 1);
    assert.equal(mul[0].id, "TYP002");
    assert.equal(mul[0].message, "Variáveis alfanuméricas ou operadores não compatíveis *");
    assert.equal(typ('va = va - "x";\n')[0]?.message, "Variáveis alfanuméricas ou operadores não compatíveis -");
    assert.equal(typ("vn = -va;\n")[0]?.message, "Variáveis alfanuméricas ou operadores não compatíveis -");
  });

  it("Alfa + Numero dentro de argumento de função", () => {
    const hits = typ('Mensagem(Erro, "Total: " + vn);\n');
    assert.equal(hits.length, 1);
    assert.equal(hits[0].id, "TYP002");
    assert.equal(hits[0].message, "tipos incompatíveis: ALFA e NUMERO");
  });

  it("comparações compatíveis e condições compostas não disparam", () => {
    const src = [
      "Se ((va = \"x\") e (vn > 0)) { vn = 1; }",
      "Se ((vd >= vn) ou (va <> 'S')) { vn = 1; }",
      "Enquanto (Cur.Achou) { Cur.Proximo(); }",
      "Se (vn) { vn = 0; }",
      "",
    ].join("\n");
    assert.deepEqual(typ(src), []);
  });
});

describe("TYP003 — condição Alfa (AC-052)", () => {
  it("Se (va) e Enquanto (va)", () => {
    const se = typ("Se (va) { vn = 1; }\n");
    assert.equal(se.length, 1);
    assert.equal(se[0].id, "TYP003");
    assert.equal(se[0].message, "Variáveis alfanuméricas ou operadores não compatíveis na condição");
    assert.equal(typ("Enquanto (va) { vn = 1; }\n")[0]?.id, "TYP003");
  });
});

describe("TYP — robustez", () => {
  it("ignora texto em string, comentário e SQL de cursor", () => {
    const src = '@ va = 1; @\n/* vn = "x"; */\nCur.SQL "SELECT A FROM B WHERE C = 1";\nva = "vn = 1";\n';
    assert.deepEqual(typ(src), []);
  });

  it("comando que o checador não entende é ignorado", () => {
    assert.deepEqual(typ("VaPara Fim_Regra;\nFim_Regra:\nExecSQL vaSql;\n"), []);
  });

  it("ignoreIds desliga TYP*", () => {
    const hits = analyzeLsp(DECL + "va = 1;\nvn = va * 2;\nSe (va) { vn = 1; }\n", [
      "TYP001",
      "TYP002",
      "TYP003",
    ]);
    assert.equal(hits.filter((h) => h.id.startsWith("TYP")).length, 0);
  });
});

describe("catalogColumnValueType", () => {
  it("mapeia os tipos do catálogo de banco", () => {
    assert.equal(catalogColumnValueType("Alfa(14)"), "Alfa");
    assert.equal(catalogColumnValueType("Número(15,2)"), "Numero");
    assert.equal(catalogColumnValueType("Data"), "Numero");
    assert.equal(catalogColumnValueType("Hora"), "Numero");
    assert.equal(catalogColumnValueType("TRtPhyString"), "Alfa");
    assert.equal(catalogColumnValueType("TRtPhyDate"), "Numero");
    assert.equal(catalogColumnValueType("?"), undefined);
    assert.equal(catalogColumnValueType(undefined), undefined);
  });
});
