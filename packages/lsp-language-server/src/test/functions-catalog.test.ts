import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Worker } from "node:worker_threads";
import { LSP_FUNCTION_CATALOG } from "@lsp-workbench/analyzer";
import { loadFunctionCatalog } from "../functions-catalog";
import type { AnalyzeRequest, AnalyzeResponse } from "../worker-protocol";

const dir = mkdtempSync(join(tmpdir(), "lsp-fn-cat-"));
const valid = join(dir, "functions.json");
writeFileSync(
  valid,
  JSON.stringify({
    $schema: "lsp-workbench-functions/v1",
    functions: {
      fakesoextra: {
        nome: "FakeSoExtra",
        assinatura: "Funcao FakeSoExtra(Alfa Linha);",
        params: [{ tipo: "alfa", saida: false, nome: "Linha" }],
      },
    },
  })
);
const broken = join(dir, "broken.json");
writeFileSync(broken, "{ quebrado");

describe("loadFunctionCatalog (language server)", () => {
  it("arquivo válido → embutido + extra", () => {
    const r = loadFunctionCatalog(valid);
    assert.equal(r.catalog?.length, LSP_FUNCTION_CATALOG.length + 1);
    assert.ok(r.catalog?.some((e) => e.label === "FakeSoExtra" && e.origin === "extra"));
  });

  it("sem path → sem catálogo e sem mensagem", () => {
    assert.deepEqual(loadFunctionCatalog(undefined), { catalog: undefined, message: undefined });
  });

  it("arquivo ausente ou inválido → só o embutido, com mensagem", () => {
    for (const p of [join(dir, "nao-existe.json"), broken]) {
      const r = loadFunctionCatalog(p);
      assert.equal(r.catalog, undefined);
      assert.ok(r.message);
    }
  });

  it("worker aceita o path do catálogo em workerData", async () => {
    const worker = new Worker(join(__dirname, "..", "compiler-worker.js"), {
      workerData: { functionsCatalogPath: valid },
    });
    try {
      const req: AnalyzeRequest = { id: 1, type: "analyze", source: "FakeSoExtra(vaX);\n" };
      const res = await new Promise<AnalyzeResponse>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("timeout")), 10_000);
        worker.on("message", (msg: AnalyzeResponse) => {
          clearTimeout(timer);
          resolve(msg);
        });
        worker.on("error", reject);
        worker.postMessage(req);
      });
      assert.equal(res.id, 1);
      assert.equal(res.error, undefined);
    } finally {
      await worker.terminate();
    }
  });
});
