import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  callSnippetFor,
  importBlockFor,
  parseFileSymbols,
  parseLspDoc,
} from "../document-symbols";
import {
  resolvePeerFiles,
  matchFilePattern,
  contextContainsFile,
  mergeIgnoreIds,
} from "../scope-config";
import { analyzeLsp } from "../diagnostics";
import { applyImportCustomFunction } from "../import-function";
import { findCustomCalls } from "../symbol-scope";

const SOMAR = `/**
 * Soma dois números.
 * @param vnNumero1 Primeiro
 * @param vnNumero2 Segundo
 * @param vnResultado [End] Saída
 * @returns void — via End
 */
Definir Funcao somar(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado);

Definir Numero vnValor1;
Definir Numero vnValor2;
Definir Numero vnSoma;

Funcao somar(Numero vnNumero1, Numero vnNumero2, Numero End vnResultado); {
  vnResultado = vnNumero1 + vnNumero2;
}
`;

describe("PDR-003 document symbols", () => {
  it("ACC-01 eligible when Definir+Funcao", () => {
    const sym = parseFileSymbols(SOMAR);
    const fn = sym.functions.find((f) => f.name === "somar");
    assert.ok(fn);
    assert.equal(fn!.eligible, true);
    assert.equal(fn!.hasDecl, true);
    assert.equal(fn!.hasImpl, true);
    assert.ok(fn!.lspDoc?.summary.includes("Soma"));
    assert.equal(fn!.lspDoc?.params.length, 3);
  });

  it("ACC-02 only Definir → not eligible + FUN007", () => {
    const src = `Definir Funcao somar(Numero vnA, Numero End vnR);\n`;
    const sym = parseFileSymbols(src);
    assert.equal(sym.functions[0]?.eligible, false);
    const hits = analyzeLsp(src);
    assert.ok(hits.some((h) => h.id === "FUN007"));
  });

  it("ACC-02 only Funcao → FUN008", () => {
    const src = `Funcao somar(Numero vnA, Numero End vnR); {\n  vnR = vnA;\n}\n`;
    const hits = analyzeLsp(src);
    assert.ok(hits.some((h) => h.id === "FUN008"));
  });

  it("ACC-06 LSPDoc parse", () => {
    const doc = parseLspDoc(`/**
 * Resumo
 * @param vnX Desc
 * @returns void
 */`);
    assert.equal(doc.summary, "Resumo");
    assert.equal(doc.params[0]?.name, "vnX");
    assert.equal(doc.returns, "void");
  });

  it("call snippet", () => {
    const sym = parseFileSymbols(SOMAR);
    const snip = callSnippetFor(sym.functions[0]!);
    assert.match(snip, /somar\(\$\{1:vnNumero1\}/);
  });

  it("variables file-scope", () => {
    const sym = parseFileSymbols(SOMAR);
    assert.ok(sym.variables.some((v) => v.name === "vnSoma" && v.scope === "file"));
  });
});

describe("PDR-003 scope", () => {
  it("ACC-07 file scope → only self", () => {
    const r = resolvePeerFiles({
      currentFileAbs: "C:/ws/main.lsp",
      workspaceRootAbs: "C:/ws",
      candidateFilesAbs: ["C:/ws/main.lsp", "C:/ws/ops.lsp"],
      settings: { scope: "file", contexts: [], fallbackSystem: "" },
    });
    assert.equal(r.mode, "singleFile");
    assert.deepEqual(r.peers, ["C:/ws/main.lsp"]);
  });

  it("ACC-03 project empty contexts → all peers", () => {
    const r = resolvePeerFiles({
      currentFileAbs: "C:/ws/main.lsp",
      workspaceRootAbs: "C:/ws",
      candidateFilesAbs: ["C:/ws/main.lsp", "C:/ws/ops.lsp"],
      settings: { scope: "project", contexts: [], fallbackSystem: "" },
    });
    assert.equal(r.mode, "scoped");
    assert.equal(r.peers.length, 2);
  });

  it("ACC-08/10 mixed/contexts isolate", () => {
    const contexts = [
      {
        name: "ops",
        rootDir: "operacoes",
        filePattern: "**/*.{lsp,lspt}",
        includeSubdirectories: true,
      },
    ];
    const outside = resolvePeerFiles({
      currentFileAbs: "C:/ws/main.lsp",
      workspaceRootAbs: "C:/ws",
      candidateFilesAbs: ["C:/ws/main.lsp", "C:/ws/operacoes/ops.lsp"],
      settings: { scope: "mixed", contexts, fallbackSystem: "" },
    });
    assert.equal(outside.mode, "singleFile");

    const inside = resolvePeerFiles({
      currentFileAbs: "C:/ws/operacoes/main.lsp",
      workspaceRootAbs: "C:/ws",
      candidateFilesAbs: [
        "C:/ws/operacoes/main.lsp",
        "C:/ws/operacoes/ops.lsp",
        "C:/ws/other.lsp",
      ],
      settings: { scope: "mixed", contexts, fallbackSystem: "" },
    });
    assert.equal(inside.mode, "scoped");
    assert.ok(inside.peers.some((p) => p.includes("ops.lsp")));
    assert.ok(!inside.peers.some((p) => p.includes("other.lsp")));
  });

  it("glob and regex patterns", () => {
    assert.ok(
      matchFilePattern("C:/ws/HR/HR01.lspt", "HR*.lspt", "C:/ws/HR", false)
    );
    assert.ok(
      matchFilePattern(
        "C:/ws/TR/805 - Cadastro.txt",
        "re:^\\d+.*\\.txt$",
        "C:/ws/TR",
        false
      )
    );
  });

  it("files allowlist is union with pattern (not replace)", () => {
    const ctx = {
      name: "ops",
      rootDir: "operacoes",
      filePattern: "**/*.{lsp,lspt}",
      includeSubdirectories: true,
      files: ["extra/main.lsp"],
    };
    assert.ok(
      contextContainsFile("C:/ws/operacoes/ops.lsp", "C:/ws", ctx),
      "pattern match still works when files is set"
    );
    assert.ok(
      contextContainsFile("C:/ws/extra/main.lsp", "C:/ws", ctx),
      "explicit files entry included"
    );
    assert.ok(
      !contextContainsFile("C:/ws/other.lsp", "C:/ws", ctx),
      "outside pattern and allowlist excluded"
    );
  });

  it("mergeIgnoreIds unions global + context", () => {
    assert.deepEqual(mergeIgnoreIds(["RUL007"], ["FUN001", "RUL007"]), [
      "RUL007",
      "FUN001",
    ]);
  });
});

describe("PDR-003 FUN009 + import", () => {
  it("ACC-04/05 cross-file call diagnostic + import", () => {
    const main = `Definir Numero vnA;\nDefinir Numero vnB;\nDefinir Numero vnR;\nsomar(vnA, vnB, vnR);\n`;
    const external = new Map([["somar", { fileName: "ops.lsp" }]]);
    const hits = analyzeLsp(main, { scopedExternal: external });
    assert.ok(hits.some((h) => h.id === "FUN009"));

    const ops = parseFileSymbols(SOMAR).functions.find((f) => f.name === "somar")!;
    const next = applyImportCustomFunction(main, ops);
    assert.match(next, /Definir Funcao somar/);
    assert.match(next, /Funcao somar/);
    const after = analyzeLsp(next, { scopedExternal: external });
    assert.ok(!after.some((h) => h.id === "FUN009"));
  });

  it("findCustomCalls skips builtins", () => {
    const calls = findCustomCalls(`Mensagem(Retorna, "x");\nfoo(vnX);\n`);
    assert.ok(calls.some((c) => c.name === "foo"));
    assert.ok(!calls.some((c) => c.name === "Mensagem"));
  });

  it("importBlock includes LSPDoc", () => {
    const fn = parseFileSymbols(SOMAR).functions[0]!;
    const block = importBlockFor(fn);
    assert.match(block, /\/\*\*/);
    assert.match(block, /Definir Funcao somar/);
  });
});
