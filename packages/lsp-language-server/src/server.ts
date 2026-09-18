#!/usr/bin/env node
/**
 * LSP Workbench Language Server (Opção 3 foundation).
 * Diagnósticos via Worker + @lsp-workbench/analyzer; fallback sync in-process.
 */
import { Worker } from "node:worker_threads";
import { join } from "node:path";
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  TextDocumentSyncKind,
  DiagnosticSeverity,
  Diagnostic,
  TextDocumentChangeEvent,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { analyze } from "@lsp-workbench/analyzer";
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  WorkerDiagnostic,
} from "./worker-protocol";

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

/** Diagnostic source for Problems panel. */
const DIAG_SOURCE = "LSP Analyzer";

let nextRequestId = 1;
let worker: Worker | undefined;
let workerFailed = false;
const pending = new Map<
  number,
  { resolve: (d: WorkerDiagnostic[]) => void; reject: (e: Error) => void }
>();

function workerScriptPath(): string {
  return join(__dirname, "compiler-worker.js");
}

function ensureWorker(): Worker | undefined {
  if (workerFailed) return undefined;
  if (worker) return worker;
  try {
    worker = new Worker(workerScriptPath());
    worker.on("message", (msg: AnalyzeResponse) => {
      const entry = pending.get(msg.id);
      if (!entry) return;
      pending.delete(msg.id);
      if (msg.error) {
        entry.reject(new Error(msg.error));
        return;
      }
      entry.resolve(msg.diagnostics);
    });
    worker.on("error", (err) => {
      connection.console.error(`compiler-worker error: ${err.message}`);
      failWorker(err);
    });
    worker.on("exit", (code) => {
      if (code !== 0) {
        connection.console.error(`compiler-worker exited with code ${code}`);
      }
      worker = undefined;
      for (const [, entry] of pending) {
        entry.reject(new Error("worker exited"));
      }
      pending.clear();
    });
    return worker;
  } catch (err) {
    failWorker(err instanceof Error ? err : new Error(String(err)));
    return undefined;
  }
}

function failWorker(err: Error): void {
  workerFailed = true;
  if (worker) {
    void worker.terminate();
    worker = undefined;
  }
  for (const [, entry] of pending) {
    entry.reject(err);
  }
  pending.clear();
  connection.console.warn(
    `Worker unavailable (${err.message}); using in-process analyze()`
  );
}

function analyzeSync(source: string): WorkerDiagnostic[] {
  return analyze(source).diagnostics;
}

function analyzeViaWorker(source: string): Promise<WorkerDiagnostic[]> {
  const w = ensureWorker();
  if (!w) {
    return Promise.resolve(analyzeSync(source));
  }
  const id = nextRequestId++;
  return new Promise<WorkerDiagnostic[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error("analyze timeout"));
    }, 15_000);
    pending.set(id, {
      resolve: (diags) => {
        clearTimeout(timer);
        resolve(diags);
      },
      reject: (e) => {
        clearTimeout(timer);
        reject(e);
      },
    });
    const req: AnalyzeRequest = { id, type: "analyze", source };
    w.postMessage(req);
  });
}

async function runAnalyze(source: string): Promise<WorkerDiagnostic[]> {
  try {
    return await analyzeViaWorker(source);
  } catch (err) {
    connection.console.warn(
      `Worker analyze failed (${err instanceof Error ? err.message : String(err)}); sync fallback`
    );
    workerFailed = true;
    if (worker) {
      void worker.terminate();
      worker = undefined;
    }
    return analyzeSync(source);
  }
}

function toLspDiagnostics(diags: WorkerDiagnostic[], doc: TextDocument): Diagnostic[] {
  return diags.map((d) => {
    const line = Math.max(0, Math.min(d.line, doc.lineCount - 1));
    const text = doc.getText({
      start: { line, character: 0 },
      end: { line, character: Number.MAX_SAFE_INTEGER },
    });
    return {
      severity:
        d.severity === "error"
          ? DiagnosticSeverity.Error
          : DiagnosticSeverity.Warning,
      range: {
        start: { line, character: 0 },
        end: { line, character: text.length },
      },
      message: `[${d.id}] ${d.message}`,
      source: DIAG_SOURCE,
      code: d.id,
    };
  });
}

async function validate(doc: TextDocument): Promise<void> {
  const version = doc.version;
  const diags = await runAnalyze(doc.getText());
  const current = documents.get(doc.uri);
  if (!current || current.version !== version) {
    return;
  }
  connection.sendDiagnostics({
    uri: doc.uri,
    diagnostics: toLspDiagnostics(diags, doc),
  });
}

const validateTimers = new Map<string, ReturnType<typeof setTimeout>>();

function scheduleValidate(doc: TextDocument): void {
  const prev = validateTimers.get(doc.uri);
  if (prev) clearTimeout(prev);
  validateTimers.set(
    doc.uri,
    setTimeout(() => {
      validateTimers.delete(doc.uri);
      void validate(doc);
    }, 200)
  );
}

connection.onInitialize((_params: InitializeParams) => {
  connection.console.log("LSP Workbench Language Server initializing");
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      // Completion rica permanece na extensão até migração completa (PDR-005).
    },
    serverInfo: {
      name: "LSP Workbench Language Server",
      version: "0.1.0",
    },
  };
});

connection.onInitialized(() => {
  ensureWorker();
});

documents.onDidOpen((e: TextDocumentChangeEvent<TextDocument>) => {
  scheduleValidate(e.document);
});

documents.onDidChangeContent((e: TextDocumentChangeEvent<TextDocument>) => {
  scheduleValidate(e.document);
});

documents.onDidClose((e: TextDocumentChangeEvent<TextDocument>) => {
  const t = validateTimers.get(e.document.uri);
  if (t) clearTimeout(t);
  validateTimers.delete(e.document.uri);
  connection.sendDiagnostics({ uri: e.document.uri, diagnostics: [] });
});

documents.listen(connection);
connection.listen();
