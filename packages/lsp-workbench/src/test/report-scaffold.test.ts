import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, it } from "node:test";
import { buildMultiTrechoExport, scaffoldRelatorioProject } from "../domain/report-scaffold";
import { loadReportAnalyzeOpts } from "../domain/report-project-loader";
import { analyzeLsp } from "../diagnostics";

describe("report scaffold", () => {
  it("cria arvore e export multi-trecho", () => {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), "lsp-rel-"));
    const root = scaffoldRelatorioProject({
      parentDir: parent,
      codigo: "TST001",
      descricao: "Teste",
      categoria: "XX",
    });
    assert.ok(fs.existsSync(path.join(root, "relatorio.json")));
    assert.ok(fs.existsSync(path.join(root, "Definicao", "Pre-Selecao.lsp")));
    assert.ok(fs.existsSync(path.join(root, "Secoes", "Detalhe_1", "secao.json")));

    const exportText = buildMultiTrechoExport(root);
    assert.match(exportText, /ModeloGerador_Pré-Seleção|ModeloGerador_Pre-Selecao|Pré-Seleção/);
    assert.match(exportText, /Detalhe_1_Antes Imprimir/);

    const prePath = path.join(root, "Definicao", "Pre-Selecao.lsp");
    const opts = loadReportAnalyzeOpts(prePath);
    assert.ok(opts);
    assert.equal(opts!.reportContext.eventKind, "pre-selecao");
    assert.ok(opts!.knownGlobals.includes("ETitulo"));

    fs.rmSync(parent, { recursive: true, force: true });
  });

  it("GER001 ao analisar antes-imprimir com InsClauSQL", () => {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), "lsp-rel-"));
    const root = scaffoldRelatorioProject({
      parentDir: parent,
      codigo: "TST002",
      descricao: "Teste GER",
    });
    const fp = path.join(root, "Secoes", "Detalhe_1", "antes-imprimir.lsp");
    fs.writeFileSync(fp, 'InsClauSQLWhere("Detalhe_1", aSQL);\n', "utf8");
    const opts = loadReportAnalyzeOpts(fp)!;
    const hits = analyzeLsp(fs.readFileSync(fp, "utf8"), {
      reportContext: opts.reportContext,
      knownGlobals: opts.knownGlobals,
    });
    assert.ok(hits.some((h) => h.id === "GER001"));
    fs.rmSync(parent, { recursive: true, force: true });
  });
});
