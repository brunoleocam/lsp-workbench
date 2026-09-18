import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Worker } from "node:worker_threads";
import { join } from "node:path";
import { analyze } from "@lsp-workbench/analyzer";
import type { AnalyzeRequest, AnalyzeResponse } from "../worker-protocol";

const workerPath = join(__dirname, "..", "compiler-worker.js");

describe("analyze path (analyzer + worker)", () => {
  it("sync analyze returns ANL002 for unbalanced braces", () => {
    const { diagnostics } = analyze("Se (1) {\n  x;\n");
    assert.ok(diagnostics.some((d) => d.id === "ANL002"));
  });

  it("worker replies with same shape for unbalanced source", async () => {
    const worker = new Worker(workerPath);
    try {
      const req: AnalyzeRequest = {
        id: 7,
        type: "analyze",
        source: "Se (1) {\n  x;\n",
      };
      const res = await new Promise<AnalyzeResponse>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("timeout")), 10_000);
        worker.on("message", (msg: AnalyzeResponse) => {
          clearTimeout(timer);
          resolve(msg);
        });
        worker.on("error", reject);
        worker.postMessage(req);
      });
      assert.equal(res.id, 7);
      assert.ok(
        res.diagnostics.some((d) => d.id === "ANL002" || d.id === "SYN008"),
        `expected ANL002 or SYN008, got ${res.diagnostics.map((d) => d.id).join(",")}`
      );
      assert.equal(res.error, undefined);
    } finally {
      await worker.terminate();
    }
  });
});
