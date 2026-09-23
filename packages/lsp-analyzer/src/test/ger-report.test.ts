import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzeLsp,
  buildReportContext,
  eventKindFromRelPath,
  findReportRoot,
  isReportProjectLayout,
  parseRelatorioMeta,
  sectionNameFromRelPath,
  type DiagnosticHit,
} from "../index";

describe("report-project paths", () => {
  it("infere Pre-Selecao", () => {
    assert.equal(eventKindFromRelPath("Definicao/Pre-Selecao.lsp"), "pre-selecao");
  });
  it("infere antes-imprimir", () => {
    assert.equal(
      eventKindFromRelPath("Secoes/Detalhe_1/antes-imprimir.lsp"),
      "antes-imprimir"
    );
    assert.equal(sectionNameFromRelPath("Secoes/Detalhe_1/antes-imprimir.lsp"), "Detalhe_1");
  });

  it("findReportRoot exige layout Definicao|Secoes", () => {
    const files = new Set([
      "C:/ws/RDCGXXX/relatorio.json",
      "C:/ws/RDCGXXX/Definicao",
      "C:/ws/RDCGXXX/Definicao/Pre-Selecao.lsp",
      "C:/ws/orphan/relatorio.json",
    ]);
    const exists = (p: string) => files.has(p.replace(/\\/g, "/"));
    assert.equal(
      findReportRoot("C:/ws/RDCGXXX/Definicao/Pre-Selecao.lsp", exists),
      "C:/ws/RDCGXXX"
    );
    assert.equal(findReportRoot("C:/ws/orphan/x.lsp", exists), undefined);
    assert.ok(isReportProjectLayout("C:/ws/RDCGXXX", exists));
    assert.ok(!isReportProjectLayout("C:/ws/orphan", exists));
  });

  it("parseRelatorioMeta lê contextoExtra", () => {
    const meta = parseRelatorioMeta(
      JSON.stringify({
        codigo: "RDCGXXX",
        contextoExtra: ["../FUNCOES", "  ", 1, "../shared.lsp"],
      })
    );
    assert.equal(meta.codigo, "RDCGXXX");
    assert.deepEqual(meta.contextoExtra, ["../FUNCOES", "../shared.lsp"]);
  });
});

describe("GER diagnostics", () => {
  const sections = ["Detalhe_1", "Adicional_X"];

  it("GER001 fora da Pre-Selecao", () => {
    const hits = analyzeLsp(`InsClauSQLWhere("Detalhe_1", aSQL);\n`, {
      reportContext: buildReportContext({
        relPath: "Secoes/Detalhe_1/antes-imprimir.lsp",
        sectionNames: sections,
      }),
    });
    assert.ok(hits.some((h: DiagnosticHit) => h.id === "GER001"));
  });

  it("Pre-Selecao ok sem GER001", () => {
    const hits = analyzeLsp(`InsClauSQLWhere("Detalhe_1", aSQL);\n`, {
      reportContext: buildReportContext({
        relPath: "Definicao/Pre-Selecao.lsp",
        sectionNames: sections,
      }),
    });
    assert.ok(!hits.some((h: DiagnosticHit) => h.id === "GER001"));
  });

  it("GER002 ListaSecao na Pre-Selecao", () => {
    const hits = analyzeLsp(`ListaSecao("Adicional_X");\n`, {
      reportContext: buildReportContext({
        relPath: "Definicao/Pre-Selecao.lsp",
        sectionNames: sections,
      }),
    });
    assert.ok(hits.some((h: DiagnosticHit) => h.id === "GER002"));
  });

  it("GER003 secao inexistente", () => {
    const hits = analyzeLsp(`ListaSecao("Adicional_Y");\n`, {
      reportContext: buildReportContext({
        relPath: "Secoes/Detalhe_1/antes-imprimir.lsp",
        sectionNames: sections,
      }),
    });
    assert.ok(hits.some((h: DiagnosticHit) => h.id === "GER003"));
  });

  it("GER004 secao SQL desconhecida", () => {
    const hits = analyzeLsp(`InsClauSQLWhere("Detalhe_Z", aSQL);\n`, {
      reportContext: buildReportContext({
        relPath: "Definicao/Pre-Selecao.lsp",
        sectionNames: sections,
      }),
    });
    assert.ok(hits.some((h: DiagnosticHit) => h.id === "GER004"));
  });

  it("knownGlobals evita SEM001 em E* da Entrada", () => {
    const hits = analyzeLsp(`Definir Alfa vaX;\nvaX = ETitulo;\n`, {
      knownGlobals: ["ETitulo"],
    });
    assert.ok(!hits.some((h: DiagnosticHit) => h.id === "SEM001" && /ETitulo/i.test(h.message)));
  });

  it("E* ausente da Entrada gera SEM001 no relatório", () => {
    const hits = analyzeLsp(`Definir Alfa vaX;\nvaX = ETitulos;\n`, {
      knownGlobals: ["ETitulo"],
    });
    assert.ok(hits.some((h: DiagnosticHit) => h.id === "SEM001" && /ETitulos/i.test(h.message)));
  });

  it("E012FAM (tabela) nao e SEM001 de Entrada", () => {
    const hits = analyzeLsp(`Definir Alfa vaX;\nvaX = "E012FAM.CODEMP";\n`, {
      knownGlobals: ["ETitulo"],
    });
    assert.ok(!hits.some((h: DiagnosticHit) => h.id === "SEM001" && /E012FAM/i.test(h.message)));
  });
});
