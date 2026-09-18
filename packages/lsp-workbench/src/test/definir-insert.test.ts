import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildDefinirInsertEdit,
  DEFINIR_TYPE_ORDER,
  definirStatement,
  findDefinirFuncaoInsertAfterLine,
  findDefinirInsertAfterLine,
  tipoFromPrefix,
} from "../definir-insert";
import { analyzeLsp } from "../diagnostics";

describe("definir-insert", () => {
  it("tipoFromPrefix", () => {
    assert.equal(tipoFromPrefix("vnCasas"), "Numero");
    assert.equal(tipoFromPrefix("vaNome"), "Alfa");
  });

  it("ordem canônica Numero→…→Funcao", () => {
    assert.deepEqual([...DEFINIR_TYPE_ORDER], [
      "Numero",
      "Alfa",
      "Data",
      "Lista",
      "Tabela",
      "Grid",
      "Cursor",
      "Funcao",
    ]);
  });

  it("inserir Numero junto dos outros Numero (antes de Alfa)", () => {
    const src = "Definir Numero vnX;\nDefinir Alfa vaY;\nvnCasas = 2;\n";
    const edit = buildDefinirInsertEdit(src, 2, "vnCasas");
    assert.equal(edit.afterLine, 0);
    assert.match(edit.text, /Definir Numero vnCasas;/);
  });

  it("inserir Alfa após Numero e antes de Cursor", () => {
    const src = "Definir Numero vnX;\nDefinir Cursor Cur_X;\nvnX = 1;\n";
    assert.equal(findDefinirInsertAfterLine(src, 2, "Alfa"), 0);
  });

  it("Definir Funcao após variáveis", () => {
    const src =
      "Definir Numero vnX;\nDefinir Alfa vaY;\nFuncao soImpl(Numero vnA); {\n}\n";
    assert.equal(findDefinirFuncaoInsertAfterLine(src), 1);
  });

  it("definirStatement", () => {
    assert.equal(definirStatement("vnCasas"), "Definir Numero vnCasas;");
  });
});

describe("SEM001 range", () => {
  it("sublinha só o identificador", () => {
    const src = "Definir Alfa vaX;\nvaX = vaNome;\n";
    const hits = analyzeLsp(src);
    const sem = hits.find((h) => h.id === "SEM001");
    assert.ok(sem);
    assert.equal(sem!.startCol !== undefined, true);
    assert.equal(sem!.endCol !== undefined, true);
    const line = src.split("\n")[sem!.line];
    assert.equal(line.slice(sem!.startCol!, sem!.endCol!), "vaNome");
  });
});
