/**
 * Mensagens Worker ↔ Language Server (Opção 3).
 */

export type AnalyzeRequest = {
  id: number;
  type: "analyze";
  source: string;
};

export type WorkerDiagnostic = {
  id: string;
  message: string;
  line: number;
  severity: "error" | "warning";
};

export type AnalyzeResponse = {
  id: number;
  diagnostics: WorkerDiagnostic[];
  error?: string;
};

export type WorkerRequest = AnalyzeRequest;
export type WorkerResponse = AnalyzeResponse;

export function isAnalyzeRequest(msg: unknown): msg is AnalyzeRequest {
  if (msg === null || typeof msg !== "object") return false;
  const m = msg as Record<string, unknown>;
  return m.type === "analyze" && typeof m.id === "number" && typeof m.source === "string";
}
