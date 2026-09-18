import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  arredondarRewriteOptions,
  formatarDataMaskOptions,
  truncarRewriteOptions,
} from "../rewrite-options";
import { applyFun005Fix, applyFun006Fix } from "../quick-fixes";

describe("rewrite-options", () => {
  it("Truncar(vnX, vnY) first option is assignment Truncar", () => {
    const opts = truncarRewriteOptions("Truncar(vnX, vnY);");
    assert.equal(opts[0].label, "Truncar");
    assert.equal(opts[0].insertText, "vnY = Truncar(vnX);");
  });

  it("Arredondar(vnX, 2, vnY) → Arredonda(vnX, 2) sem vnCasas", () => {
    const opts = arredondarRewriteOptions("Arredondar(vnX, 2, vnY);");
    assert.equal(opts[0].label, "Arredonda");
    assert.equal(opts[0].insertText, "Arredonda(vnX, 2);");
    assert.ok(!opts[0].insertText.includes("vnCasas"));
    for (const o of opts) {
      assert.ok(!/=\s*Arredonda/i.test(o.insertText), `não deve atribuir: ${o.insertText}`);
    }
  });

  it("Arredondar(vnX) → Arredonda(vnX, <vnDecimais>) com aviso", () => {
    const opts = arredondarRewriteOptions("Arredondar(vnX);");
    assert.equal(opts[0].label, "Arredonda");
    assert.match(opts[0].insertText, /Arredonda\(vnX, \$\{1:vnDecimais\}\);/);
    assert.equal(opts[0].needsDecimaisWarning, true);
    assert.equal(opts[0].isSnippet, true);
    assert.match(opts[0].detail, /<vnDecimais>/);
  });

  it("Arredonda(vnX) preserva vnX e deixa Decimais pendente", () => {
    const opts = arredondarRewriteOptions("Arredonda(vnX);");
    assert.equal(opts[0].insertText, "Arredonda(vnX, ${1:vnDecimais});");
    assert.ok(!opts[0].insertText.includes("vnValor"));
    assert.ok(!/,\s*2\)/.test(opts[0].insertText));
  });

  it("applyFun005Fix literal", () => {
    assert.equal(applyFun005Fix("Arredondar(vnX, 2, vnY);"), "Arredonda(vnX, 2);");
    assert.ok(!/=\s*Arredonda/.test(applyFun005Fix("Arredondar(vnX, 2, vnY);")));
  });

  it("applyFun006Fix preserva argumento e usa vnDecimais", () => {
    assert.equal(applyFun006Fix("Arredonda(vnX);"), "Arredonda(vnX, vnDecimais);");
  });

  it("formatarDataMaskOptions", () => {
    const opts = formatarDataMaskOptions("DD/MM/YYYY");
    assert.ok(opts);
    assert.equal(opts![0].insertText, '"dd/mm/yyyy"');
  });
});
