import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  completionLabels,
  getLspCompletionSeeds,
  getLspCompletionSeedsMatching,
  getStructuralSeedsMatching,
} from "../completion-seeds";
import {
  compareCompletionSortText,
  completionSortText,
} from "../completion-rank";
import { functionsMatchingPrefix, systemVarsMatchingPrefix } from "../function-catalog";
import { completionOriginLabel } from "../completion-labels";

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

  it("prefix Tam: TamanhoAlfa antes de TamanhoStr (alfabético)", () => {
    const labels = functionsMatchingPrefix("Tam").map((e) => e.label);
    assert.ok(labels.includes("TamanhoAlfa"), `Tam → ${labels.join(", ")}`);
    assert.ok(labels.includes("TamanhoStr"), `Tam → ${labels.join(", ")}`);
    assert.ok(
      labels.indexOf("TamanhoAlfa") < labels.indexOf("TamanhoStr"),
      `ordem: ${labels.filter((l) => l.startsWith("Tamanho")).join(", ")}`
    );
  });

  it("prefixo vazio lista snippets/comandos estruturais", () => {
    const all = getStructuralSeedsMatching("").map((s) => s.label);
    assert.ok(all.includes("Definir"));
    assert.ok(all.includes("Se"));
    assert.ok(all.includes("Cursor simples"));
    assert.ok(all.includes("Cursor completo"));
  });

  it("prefix D/De/Def sugere Definir (comando estrutural)", () => {
    for (const p of ["D", "De", "Def", "Defi", "Defin"]) {
      const cmds = getStructuralSeedsMatching(p).map((s) => s.label);
      assert.ok(cmds.includes("Definir"), `${p} → ${cmds.join(", ")}`);
    }
  });

  it("prefix S/Se sugere Se (comando estrutural)", () => {
    for (const p of ["S", "Se"]) {
      const cmds = getStructuralSeedsMatching(p).map((s) => s.label);
      assert.ok(cmds.includes("Se"), `${p} → ${cmds.join(", ")}`);
    }
  });

  it("prefixo mais longo reduz candidatos (Def ⊂ D)", () => {
    const d = new Set(getStructuralSeedsMatching("D").map((s) => s.label));
    const def = new Set(getStructuralSeedsMatching("Def").map((s) => s.label));
    assert.ok(def.size <= d.size);
    assert.ok([...def].every((x) => d.has(x)));
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

  it("prefix Cod → vars de sistema; vazio lista todas", () => {
    const empty = systemVarsMatchingPrefix("").map((v) => v.name);
    assert.ok(empty.includes("CodEmp"));
    assert.ok(empty.length >= 15);
    const cod = systemVarsMatchingPrefix("Cod").map((v) => v.name);
    assert.deepEqual(cod, ["CodEmp", "CodFil", "CodUsu"]);
  });

  it("rótulos de origem do suggest", () => {
    assert.equal(completionOriginLabel("sistema"), "Sistema");
    assert.equal(completionOriginLabel("senior"), "Senior");
    assert.equal(completionOriginLabel("snippet"), "Snippet");
  });
});
describe("completion-rank", () => {
  it("ordem: match exato → variável → função → comando", () => {
    const exact = completionSortText("command", "Se", "Se");
    const variable = completionSortText("variable", "vaStatus", "S");
    const fn = completionSortText("function", "SelecionaImpressora", "S");
    const cmd = completionSortText("command", "Senao", "S");
    assert.ok(compareCompletionSortText(exact, variable) < 0);
    assert.ok(compareCompletionSortText(variable, fn) < 0);
    assert.ok(compareCompletionSortText(fn, cmd) < 0);
  });

  it("dentro da faixa, ordem alfabética (TamanhoAlfa antes de TamanhoStr)", () => {
    const alfa = completionSortText("function", "TamanhoAlfa", "Tam");
    const str = completionSortText("function", "TamanhoStr", "Tam");
    assert.ok(compareCompletionSortText(alfa, str) < 0);
  });
});
