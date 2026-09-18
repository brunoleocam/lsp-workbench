import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { LSP_FUNCTION_CATALOG, functionsMatchingPrefix } from "../function-catalog";
import { OVERRIDE_EXTRA_LABELS } from "../function-catalog.overrides";
import { EXTRACTED_FUNCTION_LABELS } from "../function-catalog.generated";

const fixturePath = path.join(__dirname, "..", "..", "fixtures", "extracted-functions.json");

describe("function-catalog coverage", () => {
  it("todo nome extraído de docs/lsp está no catálogo mergeado", () => {
    const catalogLabels = new Set(LSP_FUNCTION_CATALOG.map((e) => e.label.toLowerCase()));
    const missing = EXTRACTED_FUNCTION_LABELS.filter((l) => !catalogLabels.has(l.toLowerCase()));
    assert.deepEqual(missing, [], `faltam no catálogo: ${missing.join(", ")}`);
  });

  it("JSON de fixtures bate com EXTRACTED_FUNCTION_LABELS", () => {
    const raw = JSON.parse(fs.readFileSync(fixturePath, "utf8")) as {
      labels: string[];
      count: number;
    };
    assert.equal(raw.count, raw.labels.length);
    assert.deepEqual([...raw.labels].sort(), [...EXTRACTED_FUNCTION_LABELS].sort());
  });

  it("overrides extras (Cancel(1|2|3), Pare, Continue) existem", () => {
    const labels = new Set(LSP_FUNCTION_CATALOG.map((e) => e.label));
    for (const extra of OVERRIDE_EXTRA_LABELS) {
      assert.ok(labels.has(extra), `faltou override ${extra}`);
    }
  });

  it("prefixos-chave dos blocos do plano", () => {
    const labels = LSP_FUNCTION_CATALOG.map((e) => e.label);
    const has = (re: RegExp) => labels.some((l) => re.test(l));

    assert.ok(has(/^Http/i), "HTTP");
    assert.ok(has(/^InsClauSQL/i), "relatórios InsClauSQL*");
    assert.ok(labels.includes("UltimoDia"));
    assert.ok(labels.includes("RetDiaSemana"));
    assert.ok(labels.includes("RetornaAscII"));
    assert.ok(labels.includes("RetiraAcentuacao"));
    assert.ok(has(/^VrfAbr/i), "validação VrfAbr*");
    assert.ok(has(/^Encriptar$|^Desencriptar$|^GeraHash$/i), "criptografia");
    assert.ok(labels.includes("IntParaStr"));
    assert.ok(labels.includes("StrParaInt"));
    assert.ok(labels.includes("AnoBissexto"));
    assert.ok(has(/^Extenso/i), "Extenso*");
    assert.ok(labels.includes("AdicionaDadosGrade"));
    assert.ok(labels.includes("AlteraControle"));
  });

  it("Mens → Mensagem primeiro; Http → família Http*", () => {
    const mens = functionsMatchingPrefix("Mens");
    assert.ok(mens.length >= 1);
    assert.equal(mens[0]!.label, "Mensagem");

    const http = functionsMatchingPrefix("Http");
    assert.ok(http.length >= 5, `Http* esperava >=5, veio ${http.length}`);
    assert.ok(http.every((e) => e.label.toLowerCase().startsWith("http")));
  });

  it("catálogo tem ao menos 180 builtins (docs/lsp)", () => {
    assert.ok(
      LSP_FUNCTION_CATALOG.length >= 180,
      `catálogo pequeno demais: ${LSP_FUNCTION_CATALOG.length}`
    );
  });
});
