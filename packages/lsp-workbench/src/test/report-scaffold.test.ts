import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, it } from "node:test";
import { buildMultiTrechoExport, parseMultiTrechoImport, scaffoldFromMultiTrecho, scaffoldRelatorioProject, secaoTipoFromNome } from "../domain/report-scaffold";
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

  it("cria multiplas secoes informadas", () => {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), "lsp-rel-"));
    const root = scaffoldRelatorioProject({
      parentDir: parent,
      codigo: "TST003",
      descricao: "Multi",
      secoes: ["Detalhe_Transportadora", "Subtitulo_CodTra", "Total_Geral"],
    });
    assert.ok(fs.existsSync(path.join(root, "Secoes", "Detalhe_Transportadora", "secao.json")));
    assert.ok(fs.existsSync(path.join(root, "Secoes", "Subtitulo_CodTra", "antes-imprimir.lsp")));
    assert.ok(fs.existsSync(path.join(root, "Secoes", "Total_Geral", "depois-imprimir.lsp")));
    const meta = JSON.parse(fs.readFileSync(path.join(root, "relatorio.json"), "utf8"));
    assert.equal(meta.detalhePrincipal, "Detalhe_Transportadora");
    const sub = JSON.parse(
      fs.readFileSync(path.join(root, "Secoes", "Subtitulo_CodTra", "secao.json"), "utf8")
    );
    assert.equal(sub.tipo, "Subtitulo");
    assert.equal(secaoTipoFromNome("Total_Geral"), "Total_Geral");
    fs.rmSync(parent, { recursive: true, force: true });
  });

  it("importa dump multi-trecho", () => {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), "lsp-rel-"));
    const dump = [
      "--------------------------------------------------------------------------------",
      "Código: 1 - Descrição: ModeloGerador_Funções Globais",
      "--------------------------------------------------------------------------------",
      "",
      "@ funcoes @",
      "",
      "--------------------------------------------------------------------------------",
      "Código: 2 - Descrição: ModeloGerador_Inicialização",
      "--------------------------------------------------------------------------------",
      "",
      "@ init @",
      "",
      "--------------------------------------------------------------------------------",
      "Código: 3 - Descrição: Detalhe_Transportadora_Antes Imprimir",
      "--------------------------------------------------------------------------------",
      "",
      "vaX = \"antes\";",
      "",
      "--------------------------------------------------------------------------------",
      "Código: 4 - Descrição: Detalhe_Transportadora_Depois Imprimir",
      "--------------------------------------------------------------------------------",
      "",
      "vaY = \"depois\";",
      "",
      "--------------------------------------------------------------------------------",
      "Código: 5 - Descrição: Detalhe_Transportadora_Na Impressão",
      "--------------------------------------------------------------------------------",
      "",
      "@ ignorar @",
      "",
    ].join("\n");

    const parsed = parseMultiTrechoImport(dump);
    assert.equal(parsed.chunks.length, 4);
    assert.equal(parsed.ignoredNaImpressao.length, 1);

    const root = scaffoldFromMultiTrecho({
      parentDir: parent,
      codigo: "RDCGXXX",
      descricao: "Importado",
      text: dump,
    });
    assert.ok(fs.existsSync(path.join(root, "Definicao", "Funcoes-Globais.lsp")));
    assert.match(
      fs.readFileSync(path.join(root, "Definicao", "Funcoes-Globais.lsp"), "utf8"),
      /funcoes/
    );
    assert.match(
      fs.readFileSync(
        path.join(root, "Secoes", "Detalhe_Transportadora", "antes-imprimir.lsp"),
        "utf8"
      ),
      /vaX/
    );
    assert.match(
      fs.readFileSync(
        path.join(root, "Secoes", "Detalhe_Transportadora", "depois-imprimir.lsp"),
        "utf8"
      ),
      /vaY/
    );
    assert.match(fs.readFileSync(path.join(root, "README.md"), "utf8"), /Na Impress/);
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

  it("SEM001 nao alerta var Definir na Inicializacao usada em secao", () => {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), "lsp-rel-"));
    const root = scaffoldRelatorioProject({
      parentDir: parent,
      codigo: "TST004",
      descricao: "Cross-file SEM001",
    });
    const initPath = path.join(root, "Definicao", "Inicializacao.lsp");
    const secaoPath = path.join(root, "Secoes", "Detalhe_1", "antes-imprimir.lsp");
    fs.writeFileSync(
      initPath,
      "Definir Alfa vaMosLog;\nvaMosLog = \"logs/teste.log\";\n",
      "utf8"
    );
    fs.writeFileSync(
      secaoPath,
      'Definir Alfa vaMsg;\nvaMsg = "ok";\nGravarArquivo(vaMosLog, vaMsg);\n',
      "utf8"
    );

    const opts = loadReportAnalyzeOpts(secaoPath)!;
    assert.ok(
      opts.knownGlobals.some((n) => n.toLowerCase() === "vamoslog"),
      `knownGlobals deveria incluir vaMosLog; got ${opts.knownGlobals.join(",")}`
    );

    const hits = analyzeLsp(fs.readFileSync(secaoPath, "utf8"), {
      reportContext: opts.reportContext,
      knownGlobals: opts.knownGlobals,
    });
    assert.equal(
      hits.filter((h) => h.id === "SEM001" && /vamoslog/i.test(h.message)).length,
      0,
      hits.map((h) => `${h.id}:${h.message}`).join(" | ")
    );

    // Ainda alerta se a var não existir em nenhum peer
    const orphan = analyzeLsp(
      'Definir Alfa vaLocal;\nvaLocal = vaNaoExiste;\n',
      {
        reportContext: opts.reportContext,
        knownGlobals: opts.knownGlobals,
      }
    );
    assert.ok(orphan.some((h) => h.id === "SEM001" && /vanaoexiste/i.test(h.message)));

    fs.rmSync(parent, { recursive: true, force: true });
  });
});
