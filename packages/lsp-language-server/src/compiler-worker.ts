/**
 * Worker thread — analisa source via @lsp-workbench/analyzer.
 */
import { parentPort } from "node:worker_threads";
import { analyze } from "@lsp-workbench/analyzer";
import {
  isAnalyzeRequest,
  type AnalyzeResponse,
} from "./worker-protocol";

if (!parentPort) {
  throw new Error("compiler-worker must run as a worker_threads Worker");
}

parentPort.on("message", (msg: unknown) => {
  if (!isAnalyzeRequest(msg)) {
    return;
  }
  const { id, source } = msg;
  try {
    const { diagnostics } = analyze(source);
    const reply: AnalyzeResponse = { id, diagnostics };
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
