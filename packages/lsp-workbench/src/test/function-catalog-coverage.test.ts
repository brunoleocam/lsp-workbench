import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { LSP_FUNCTION_CATALOG, functionsMatchingPrefix } from "../function-catalog";
import { OVERRIDE_EXTRA_LABELS } from "../function-catalog.overrides";
import { EXTRACTED_FUNCTION_LABELS } from "../function-catalog.generated";
import {
  formatParamHover,
  orderedCatalogParams,
  snippetParamNames,
} from "../catalog-param-docs";

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

  it("ConverteMascara documenta o enum de tipoDado", () => {
    const e = LSP_FUNCTION_CATALOG.find((x) => x.label === "ConverteMascara");
    assert.ok(e);
    assert.match(e.documentation, /`1`: Número/);
    assert.match(e.documentation, /`2`: Dinheiro/);
    assert.match(e.documentation, /`3`: Data/);
    assert.match(e.documentation, /`4`: Hora/);
    assert.match(e.documentation, /`5`: Alfa/);
    assert.match(e.documentation, /tipo de dado ser 5/);
    assert.match(e.documentation, /Caso seja um CPF/);
    assert.match(e.documentation, /999\.999\.999-99/);
    assert.match(e.documentation, /99\.999\.999\/9999-99/);
    assert.match(e.documentation, /R030Fil\.TipIns = 3/);
    assert.match(e.insertText, /\$\{1:<Tipo_Dado>\}/);
  });

  it("ConverteMascara mostra Numero no helper e não passa o enum ao Alfa", () => {
    const e = LSP_FUNCTION_CATALOG.find((x) => x.label === "ConverteMascara");
    assert.ok(e);
    assert.match(e.insertText, /\$\{1:<Tipo_Dado>\}/);
    assert.match(e.insertText, /\$\{3:<Alfa_Origem\/Destino>\}/);
    assert.doesNotMatch(e.insertText, /Numero Tipo_dado/);
    const ordered = orderedCatalogParams(
      e.documentation,
      snippetParamNames(e.insertText),
      e.params
    );
    assert.equal(ordered[0]?.tipo, "Numero");
    assert.match(ordered[0]?.documentation ?? "", /Número/);
    assert.equal(ordered[2]?.tipo, "Alfa");
    assert.doesNotMatch(ordered[2]?.documentation ?? "", /Número/);
    assert.match(formatParamHover(e.label, ordered[0]!), /\(Numero\)/);
  });

  it("AdicionaComponenteModelo mostra tipo e descrição no snippet e no helper", () => {
    const e = LSP_FUNCTION_CATALOG.find((x) => x.label === "AdicionaComponenteModelo");
    assert.ok(e);
    assert.match(e.insertText, /\$\{1:<CodMod>\}/);
    assert.match(e.documentation, /\(Alfa\) — Código do modelo/);
    const ordered = orderedCatalogParams(
      e.documentation,
      snippetParamNames(e.insertText),
      e.params
    );
    const hover = formatParamHover(e.label, ordered[0]!);
    assert.match(hover, /\(Alfa\)/);
    assert.match(hover, /Código do modelo/);
  });

  it("nenhum snippet grava Numero/Alfa como se fosse código", () => {
    const bad = LSP_FUNCTION_CATALOG.filter((e) =>
      /\$\{\d+:(?:Numero|Alfa|Data|Lista)\s/.test(e.insertText)
    );
    assert.deepEqual(
      bad.map((e) => e.label),
      []
    );
  });

  it("outras funções com código numérico entram no detalhe", () => {
    const doc = (label: string) => {
      const e = LSP_FUNCTION_CATALOG.find((x) => x.label === label);
      assert.ok(e, label);
      return e.documentation;
    };
    assert.match(doc("GeraHash"), /SHA-256/);
    assert.match(doc("PegarTipoVar"), /tipo Alfa/);
    assert.match(doc("RetDiaSemana"), /Domingo/);
    assert.match(doc("AnoBissexto"), /não for bissexto/);
    assert.match(doc("ConverteCodificacaoString"), /não suportados/);
    assert.match(doc("SQL_BOF"), /posição BOF/);
    assert.match(doc("SQL_EOF"), /EOF/);
  });

  it("catálogo unificado inclui HCM + ERP (máxima cobertura)", () => {
    assert.ok(
      LSP_FUNCTION_CATALOG.length >= 900,
      `catálogo unificado pequeno demais: ${LSP_FUNCTION_CATALOG.length}`
    );
    const labels = new Set(LSP_FUNCTION_CATALOG.map((e) => e.label));
    assert.ok(labels.has("AcuEveCol"), "HCM AcuEveCol");
    assert.ok(labels.has("ComposicaoProduto"), "ERP ComposicaoProduto");
  });
});
