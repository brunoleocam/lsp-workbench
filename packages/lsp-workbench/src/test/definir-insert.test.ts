import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildDefinirInsertEdit,
  definirStatement,
  findDefinirInsertAfterLine,
  tipoFromPrefix,
} from "../definir-insert";
import { analyzeLsp } from "../diagnostics";

describe("definir-insert", () => {
  it("tipoFromPrefix", () => {
    assert.equal(tipoFromPrefix("vnCasas"), "Numero");
    assert.equal(tipoFromPrefix("vaNome"), "Alfa");
  });

  it("inserir após último Definir do arquivo", () => {
    const src = "Definir Numero vnX;\nDefinir Alfa vaY;\nvnCasas = 2;\n";
    assert.equal(findDefinirInsertAfterLine(src, 2), 1);
    const edit = buildDefinirInsertEdit(src, 2, "vnCasas");
    assert.equal(edit.afterLine, 1);
    assert.match(edit.text, /Definir Numero vnCasas;/);
  });

  it("definirStatement", () => {
    assert.equal(definirStatement("vnCasas"), "Definir Numero vnCasas;");
  });
});

describe("SEM001 range", () => {
  it("sublinha só o identificador", () => {
    const src = 'Definir Alfa vaX;\nvaX = vaNome;\n';
    const hits = analyzeLsp(src);
    const sem = hits.find((h) => h.id === "SEM001");
    assert.ok(sem);
    assert.equal(sem!.startCol !== undefined, true);
    assert.equal(sem!.endCol !== undefined, true);
    const line = src.split("\n")[sem!.line];
    assert.equal(line.slice(sem!.startCol!, sem!.endCol!), "vaNome");
  });
});
