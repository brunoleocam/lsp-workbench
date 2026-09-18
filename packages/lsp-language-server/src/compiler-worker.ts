/**
 * Worker thread — análise completa via analyzeLsp (paridade com a extensão).
 */
import { parentPort } from "node:worker_threads";
import { analyzeLsp } from "@lsp-workbench/analyzer";
import {
  isAnalyzeRequest,
  type AnalyzeResponse,
  type WorkerDiagnostic,
} from "./worker-protocol";

if (!parentPort) {
  throw new Error("compiler-worker must run as a worker_threads Worker");
}

function toWorkerDiags(
  hits: ReturnType<typeof analyzeLsp>
): WorkerDiagnostic[] {
  return hits.map((h) => ({
    id: h.id,
    message: h.message,
    line: h.line,
    severity: h.severity,
    startCol: h.startCol,
    endCol: h.endCol,
  }));
}

parentPort.on("message", (msg: unknown) => {
  if (!isAnalyzeRequest(msg)) {
    return;
  }
  const { id, source, ignoreIds } = msg;
  try {
    const hits = analyzeLsp(source, { ignoreIds });
    const reply: AnalyzeResponse = { id, diagnostics: toWorkerDiags(hits) };
    parentPort!.postMessage(reply);
  } catch (err) {
    const reply: AnalyzeResponse = {
      id,
      diagnostics: [],
      error: err instanceof Error ? err.message : String(err),
    };
    parentPort!.postMessage(reply);
  }
});
