import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatLsp } from "../formatter";
import { analyzeLsp } from "../diagnostics";

describe("formatLsp", () => {
  it("EXT-FMT-01 indents with 2 spaces", () => {
    const src = `Se (vnX > 0) {\nMensagem(Retorna, "ok");\n}`;
    const out = formatLsp(src, { indentSize: 2 });
    assert.match(out, /^Se \(vnX > 0\) \{/m);
    assert.match(out, /^  Mensagem/m);
  });

  it("EXT-FMT-03 preserves @ comments", () => {
    const src = `@ comentario @\nDefinir Numero vnX;`;
    const out = formatLsp(src);
    assert.match(out, /@ comentario @/);
  });
});

describe("analyzeLsp", () => {
  it("EXT-DIA-01 missing semicolon", () => {
    const hits = analyzeLsp(`Definir Numero vnX\nvnX = 1;`);
    assert.ok(hits.some((h) => h.id === "SYN001"));
  });

  it("EXT-DIA-02 Retorna", () => {
    const hits = analyzeLsp(`Retorna;`);
    assert.ok(hits.some((h) => h.id === "RUL007"));
  });

  it("EXT-DIA-03 compound condition", () => {
    const hits = analyzeLsp(`Se (a > 0 e b < 10) {\n}`);
    assert.ok(hits.some((h) => h.id === "SYN003"));
  });

  it("DEM001 when table missing from local catalog", () => {
    const hits = analyzeLsp(`vaSql = "SELECT * FROM E999ZZZ";`, {
      catalogTableNames: ["E120PED"],
    });
    assert.ok(hits.some((h) => h.id === "DEM001" && /E999ZZZ/.test(h.message)));
  });

  it("DEM001 silent when table is in catalog", () => {
    const hits = analyzeLsp(`vaSql = "SELECT * FROM E120PED";`, {
      catalogTableNames: ["E120PED"],
    });
    assert.ok(!hits.some((h) => h.id === "DEM001"));
  });

  it("DEM001 not emitted without catalog option", () => {
    const hits = analyzeLsp(`vaSql = "SELECT * FROM E999ZZZ";`);
    assert.ok(!hits.some((h) => h.id === "DEM001"));
  });
});
