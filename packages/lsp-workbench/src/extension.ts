import * as vscode from "vscode";
import { formatLsp } from "./formatter";
import { analyzeLsp } from "./diagnostics";
import { createLspCompletionProvider } from "./completion";
import { registerCodeActions } from "./code-actions";
import { registerLanguageFeatures } from "./language-features";
import { registerContextCommands, registerStatusBar } from "./context-commands";
import { getWorkspaceSymbolIndex } from "./workspace-symbol-index";
import { SENIOR_LSP_LANGUAGE_ID } from "./language";
import { APPLY_TEXT_EDITS_CMD, applySerializedTextEdits, APPLY_SYN009_CMD, applySyn009OnLine } from "./apply-edits";
import { registerSemanticTokens } from "./adapters/vscode/semantic-tokens-provider";
import { registerOutlineProvider } from "./adapters/vscode/outline-provider";
import { registerRefactorActions } from "./adapters/vscode/refactors-provider";
import { formatEmbeddedSqlInSource } from "./application/format-embedded-sql";
import {
  addSuppression,
  filterSuppressedHits,
  IGNORE_DIAGNOSTIC_CMD,
  initSuppressions,
  SUPPRESSIONS_STATE_KEY,
} from "./suppressions";
import { findMatchingContext, mergeIgnoreIds } from "./scope-config";
import {
  isLanguageServerEnabled,
  startLanguageServer,
  stopLanguageServer,
} from "./language-client";
import { getLocalCatalog } from "./adapters/vscode/local-catalog-loader";
import {
  catalogColumnTypes as columnTypesOf,
  catalogTableColumns as tableColumnsOf,
} from "./domain/local-catalog";
import { registerConfigureWorkspace } from "./configure-workspace";
import { registerGhostModeCommands } from "./ghost-mode-commands";
import { registerReportCommands } from "./report-commands";
import { registerCompileCommands } from "./compile-commands";
import { registerDataDictionaryCommand } from "./data-dictionary-command";
import { registerFunctionsCatalog } from "./functions-catalog-loader";
import { effectiveFunctionCatalog } from "./effective-function-catalog";
import { loadReportAnalyzeOpts } from "./domain/report-project-loader";
import { registerBinaryRules } from "./adapters/vscode/binary-rule-open";
import { isBinaryRuleFileUri } from "./adapters/vscode/binary-rule-fs";
import { documentDiskPath } from "./domain/binary-rule-paths";
import { registerGenerateSeniorRule } from "./adapters/vscode/generate-senior-rule";

const collection = vscode.languages.createDiagnosticCollection("lsp-workbench");

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(collection);

  initSuppressions(context.workspaceState.get<string[]>(SUPPRESSIONS_STATE_KEY), (keys) =>
    context.workspaceState.update(SUPPRESSIONS_STATE_KEY, keys)
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      { language: SENIOR_LSP_LANGUAGE_ID, scheme: "*" },
      createLspCompletionProvider(),
      "."
    )
  );

  registerCodeActions(context);
  registerLanguageFeatures(context);
  registerContextCommands(context);
  registerStatusBar(context);
  registerSemanticTokens(context);
  registerOutlineProvider(context);
  registerRefactorActions(context);
  registerReportCommands(context);
  registerConfigureWorkspace(context);
  registerGhostModeCommands(context);
  registerBinaryRules(context);

  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(SENIOR_LSP_LANGUAGE_ID, {
      provideDocumentFormattingEdits(document) {
        const cfg = vscode.workspace.getConfiguration("lsp");
        if (!cfg.get<boolean>("format.enabled", true) || isBinaryRuleFileUri(document.uri)) {
          return [];
        }
        let text = formatLsp(document.getText(), {
          indentSize: cfg.get<number>("format.indentSize", 2),
          useTabs: cfg.get<boolean>("format.useTabs", false),
          braceStyle: cfg.get<"sameLine" | "nextLine">("format.braceStyle", "sameLine"),
        });
        text = formatEmbeddedSqlInSource(text, {
          enabled: cfg.get<boolean>("format.embeddedSql.enabled", false),
          dialect: cfg.get<"sql" | "oracle" | "sqlserver">("format.embeddedSql.dialect", "sql"),
        });
        const full = new vscode.Range(
          document.positionAt(0),
          document.positionAt(document.getText().length)
        );
        return [vscode.TextEdit.replace(full, text)];
      },
    })
  );

  /** Mutável: se o LS falhar ao subir, volta para diagnostics in-process. */
  const lsState = { active: isLanguageServerEnabled() };
  /** Seq por URI — evita cancelar diagnostics de outros arquivos abertos. */
  const refreshSeqByUri = new Map<string, number>();
  let refreshTimer: ReturnType<typeof setTimeout> | undefined;

  const hitsToDiagnostics = (doc: vscode.TextDocument, hits: ReturnType<typeof analyzeLsp>) => {
    const last = Math.max(0, doc.lineCount - 1);
    return hits.map((h) => {
      const severity =
        h.severity === "error"
          ? vscode.DiagnosticSeverity.Error
          : vscode.DiagnosticSeverity.Warning;
      const lineNo = Math.max(0, Math.min(h.line, last));
      const line = doc.lineAt(lineNo);
      const range =
        h.startCol !== undefined && h.endCol !== undefined
          ? new vscode.Range(lineNo, h.startCol, lineNo, h.endCol)
          : new vscode.Range(lineNo, 0, lineNo, line.text.length);
      const d = new vscode.Diagnostic(range, `[${h.id}] ${h.message}`, severity);
      d.code = h.id;
      d.source = "LSP Workbench";
      return d;
    });
  };

  const refresh = (doc: vscode.TextDocument): Promise<void> => {
    if (lsState.active) return Promise.resolve();
    if (doc.languageId !== SENIOR_LSP_LANGUAGE_ID) {
      return Promise.resolve();
    }
    if (isBinaryRuleFileUri(doc.uri)) {
      collection.delete(doc.uri);
      return Promise.resolve();
    }
    const key = doc.uri.toString();
    const seq = (refreshSeqByUri.get(key) ?? 0) + 1;
    refreshSeqByUri.set(key, seq);

    const cfg = vscode.workspace.getConfiguration("lsp");
    const globalIgnore = cfg.get<string[]>("diagnostics.ignoreIds", []) ?? [];
    const idx = getWorkspaceSymbolIndex();
    const settings = idx.readSettings();
    const docPath = documentDiskPath(doc.uri);
    const root = idx.workspaceRootFor(docPath);
    const matched = findMatchingContext(docPath, root, settings.contexts);
    const ignore = mergeIgnoreIds(globalIgnore, matched?.diagnostics?.ignoreIds);
    const lines = doc.getText().replace(/\r\n/g, "\n").split("\n");
    const localCatalog = getLocalCatalog();
    const catalogTableNames = localCatalog?.tables.map((t) => t.name);
    const catalogColumnTypes = localCatalog ? columnTypesOf(localCatalog) : undefined;
    const catalogTableColumns = localCatalog ? tableColumnsOf(localCatalog) : undefined;
    const reportOpts = loadReportAnalyzeOpts(docPath);

    // 1ª passada síncrona — RUL/FUN/SYN aparecem mesmo se o índice demorar.
    try {
      const quick = filterSuppressedHits(
        key,
        lines,
        analyzeLsp(doc.getText(), {
          ignoreIds: ignore,
          functionCatalog: effectiveFunctionCatalog(),
          catalogTableNames,
          catalogColumnTypes,
          catalogTableColumns,
          reportContext: reportOpts?.reportContext,
          knownGlobals: reportOpts?.knownGlobals,
        })
      );
      collection.set(doc.uri, hitsToDiagnostics(doc, quick));
    } catch (err) {
      console.error("[LSP Workbench] diagnostics sync failed", key, err);
    }

    // 2ª passada — FUN009 / peers (scopedExternal) + SEM001 via Definir dos peers.
    return (async () => {
      try {
        idx.invalidate(doc.uri);
        let scopedExternal: Map<string, { fileName: string }> | undefined;
        let peerGlobals: string[] = [];
        try {
          scopedExternal = await idx.externalMapFor(doc);
          peerGlobals = await idx.peerFileScopeGlobalsFor(doc);
        } catch {
          scopedExternal = undefined;
          peerGlobals = [];
        }
        if (refreshSeqByUri.get(key) !== seq) return;
        const knownGlobals = [
          ...new Set([...(reportOpts?.knownGlobals ?? []), ...peerGlobals]),
        ];
        const hits = filterSuppressedHits(
          key,
          lines,
          analyzeLsp(doc.getText(), {
            ignoreIds: ignore,
            functionCatalog: effectiveFunctionCatalog(),
            scopedExternal,
            catalogTableNames,
            catalogColumnTypes,
            catalogTableColumns,
            reportContext: reportOpts?.reportContext,
            knownGlobals: knownGlobals.length ? knownGlobals : undefined,
          })
        );
        if (refreshSeqByUri.get(key) !== seq) return;
        collection.set(doc.uri, hitsToDiagnostics(doc, hits));
      } catch (err) {
        console.error("[LSP Workbench] diagnostics async failed", key, err);
      }
    })();
  };

  /** Revalida todos os buffers LSP abertos (peers cruzados — FUN009 / símbolos). */
  const refreshOpenLspDocuments = (changed?: vscode.Uri) => {
    if (lsState.active) return;
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      refreshTimer = undefined;
      const idx = getWorkspaceSymbolIndex();
      if (changed) idx.invalidate(changed);
      else idx.invalidate();
      for (const d of vscode.workspace.textDocuments) {
        if (d.languageId === SENIOR_LSP_LANGUAGE_ID) refresh(d);
      }
    }, 200);
  };

  const functionsCatalog = registerFunctionsCatalog(context, (found) => {
    if (lsState.active) {
      void stopLanguageServer().then(() => startLanguageServer(context, found.path));
      return;
    }
    refreshOpenLspDocuments();
  });

  if (lsState.active) {
    void startLanguageServer(context, functionsCatalog.path).then(
      () => {
        /* LS push diagnostics via analyzeLsp (paridade PDR-005). */
      },
      (err: unknown) => {
        lsState.active = false;
        void vscode.window.showErrorMessage(
          `LSP Workbench Language Server failed to start: ${
            err instanceof Error ? err.message : String(err)
          }. Usando diagnostics in-process.`
        );
        refreshOpenLspDocuments();
      }
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand(
      IGNORE_DIAGNOSTIC_CMD,
      (uriStr: string, ruleId: string, lineText: string) => {
        if (!uriStr || !ruleId) return;
        addSuppression(uriStr, ruleId, lineText ?? "");
        const uri = vscode.Uri.parse(uriStr);
        const open = vscode.workspace.textDocuments.find((d) => d.uri.toString() === uriStr);
        if (open) {
          refresh(open);
          return;
        }
        void vscode.workspace.openTextDocument(uri).then(refresh);
      }
    )
  );

  registerCompileCommands(context, refresh);
  registerGenerateSeniorRule(context, refresh);
  registerDataDictionaryCommand(context);

  context.subscriptions.push(
    vscode.commands.registerCommand(APPLY_TEXT_EDITS_CMD, applySerializedTextEdits)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(APPLY_SYN009_CMD, applySyn009OnLine)
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(refresh),
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.languageId !== SENIOR_LSP_LANGUAGE_ID) return;
      refreshOpenLspDocuments(e.document.uri);
    }),
    vscode.workspace.onDidCloseTextDocument((doc) => collection.delete(doc.uri)),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration("lsp")) return;
      if (e.affectsConfiguration("lsp.server.enabled")) {
        void vscode.window.showInformationMessage(
          "lsp.server.enabled mudou — recarregue a janela para aplicar (Reload Window)."
        );
      }
      getWorkspaceSymbolIndex().refreshCandidates();
      refreshOpenLspDocuments();
    }),
    vscode.workspace.onDidCreateFiles(() => {
      getWorkspaceSymbolIndex().refreshCandidates();
      refreshOpenLspDocuments();
    }),
    vscode.workspace.onDidDeleteFiles(() => {
      getWorkspaceSymbolIndex().refreshCandidates();
      refreshOpenLspDocuments();
    })
  );

  refreshOpenLspDocuments();
}

export async function deactivate(): Promise<void> {
  await stopLanguageServer();
  collection.dispose();
}
