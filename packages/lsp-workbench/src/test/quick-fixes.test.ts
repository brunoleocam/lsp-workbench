import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyRul007Fix, findRul007Ranges } from "../quick-fixes";

describe("quick-fixes RUL007", () => {
  it("replaces Retorna; with Cancel(1);", () => {
    assert.equal(applyRul007Fix("  Retorna;"), "  Cancel(1);");
  });

  it("preserves Mensagem(Retorna, ...)", () => {
    const line = 'Mensagem(Retorna, "ok");';
    assert.equal(findRul007Ranges(line).length, 0);
    assert.equal(applyRul007Fix(line), line);
  });

  it("finds range of Retorna;", () => {
    const ranges = findRul007Ranges("  Retorna;");
    assert.equal(ranges.length, 1);
    assert.equal(ranges[0].start, 2);
  });
});
