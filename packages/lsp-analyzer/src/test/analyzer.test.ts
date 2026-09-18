import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyze, tokenize } from "../index.js";

describe("lsp-analyzer foundation", () => {
  it("tokenizes keywords", () => {
    const toks = tokenize("Definir Numero vnX;");
    assert.ok(toks.some((t) => t.kind === "keyword" && /^Definir$/i.test(t.value)));
  });

  it("detects unbalanced braces", () => {
    const { diagnostics } = analyze("Se (1) {\n  x;\n");
    assert.ok(diagnostics.some((d) => d.id === "ANL002"));
  });

  it("ok balanced", () => {
    const { diagnostics } = analyze("Se (1) {\n  x;\n}\n");
    assert.equal(diagnostics.length, 0);
  });
});
