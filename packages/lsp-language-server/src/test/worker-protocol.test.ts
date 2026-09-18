import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isAnalyzeRequest,
  type AnalyzeRequest,
  type AnalyzeResponse,
} from "../worker-protocol";

describe("worker-protocol message shape", () => {
  it("accepts valid analyze request", () => {
    const req: AnalyzeRequest = { id: 1, type: "analyze", source: "Se (1) {\n}\n" };
    assert.equal(isAnalyzeRequest(req), true);
  });

  it("rejects malformed messages", () => {
    assert.equal(isAnalyzeRequest(null), false);
    assert.equal(isAnalyzeRequest({ type: "analyze" }), false);
    assert.equal(isAnalyzeRequest({ id: 1, type: "format", source: "" }), false);
    assert.equal(isAnalyzeRequest({ id: "1", type: "analyze", source: "" }), false);
  });

  it("response carries id + diagnostics array", () => {
    const res: AnalyzeResponse = {
      id: 42,
      diagnostics: [
        { id: "ANL002", message: "unbalanced", line: 0, severity: "error" },
      ],
    };
    assert.equal(res.id, 42);
    assert.equal(res.diagnostics.length, 1);
    assert.equal(res.diagnostics[0].id, "ANL002");
    assert.equal(res.diagnostics[0].severity, "error");
  });
});
