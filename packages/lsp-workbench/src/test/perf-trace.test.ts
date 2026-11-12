import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PerfTrace } from "../domain/perf-trace";

function clock(times: number[]): () => number {
  let i = 0;
  return () => times[Math.min(i++, times.length - 1)];
}

describe("PerfTrace", () => {
  it("registra total e etapas quando passa do limite", () => {
    const lines: string[] = [];
    const trace = new PerfTrace("completion a.lsp", (m) => lines.push(m), clock([0, 120, 900, 950]), 300);
    trace.step("indice");
    trace.step("funcoes");
    trace.end();
    assert.deepEqual(lines, ["completion a.lsp 950ms (indice=120ms, funcoes=780ms, resto=50ms)"]);
  });

  it("não registra nada abaixo do limite", () => {
    const lines: string[] = [];
    const trace = new PerfTrace("completion a.lsp", (m) => lines.push(m), clock([0, 10, 40]), 300);
    trace.step("indice");
    trace.end();
    assert.deepEqual(lines, []);
  });
});
