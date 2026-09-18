import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  completionLabels,
  getLspCompletionSeeds,
  getLspCompletionSeedsMatching,
} from "../completion-seeds";
import { functionsMatchingPrefix } from "../function-catalog";

describe("completion", () => {
  it("does not offer bare Retorna as a command label", () => {
    assert.equal(completionLabels().includes("Retorna"), false);
  });

  it("offers Cancel for interruption", () => {
    const cancel = getLspCompletionSeeds().find((s) => s.label === "Cancel");
    assert.ok(cancel);
    assert.match(cancel!.insertText, /Cancel\(/);
    assert.ok(completionLabels().includes("Cancel(1)"));
    assert.ok(completionLabels().includes("Cancel(2)"));
    assert.ok(completionLabels().includes("Cancel(3)"));
  });

  it("Mensagem may use Retorna only as message type in snippet", () => {
    const msg = getLspCompletionSeeds().find((s) => s.label === "Mensagem");
    assert.ok(msg);
    assert.match(msg!.insertText, /Mensagem\(/);
    assert.match(msg!.insertText, /Retorna/);
  });

  it("prefix M / Mens sugere Mensagem", () => {
    const m = functionsMatchingPrefix("M").map((e) => e.label);
    assert.ok(m.includes("Mensagem"));
    assert.ok(m.includes("MontaData") || m.includes("Maiuscula") || m.includes("Minuscula"));
    const mens = getLspCompletionSeedsMatching("Mens");
    assert.equal(mens[0]?.label, "Mensagem");
  });

  it("offers truncate family", () => {
    const labels = completionLabels();
    for (const name of ["Truncar", "TruncarDecimal", "TruncarValor"]) {
      assert.ok(labels.includes(name), `faltou ${name}`);
    }
  });

  it("offers rounding substitutes", () => {
    const labels = completionLabels();
    for (const name of ["Arredonda", "ArredondaABNT", "ArredondarValor"]) {
      assert.ok(labels.includes(name), `faltou ${name}`);
    }
  });
});
