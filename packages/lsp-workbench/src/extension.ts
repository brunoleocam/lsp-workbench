import * as vscode from "vscode";
import { formatLsp } from "./formatter";
import { analyzeLsp } from "./diagnostics";
import { createLspCompletionProvider } from "./completion";
import { registerCodeActions } from "./code-actions";
import { registerLanguageFeatures } from "./language-features";
import { registerContextCommands, registerStatusBar } from "./context-commands";
import { getWorkspaceSymbolIndex } from "./workspace-symbol-index";
import { SENIOR_LSP_LANGUAGE_ID } from "./language";
import { APPLY_TEXT_EDITS_CMD, applySerializedTextEdits } from "./apply-edits";
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

const collection = vscode.languages.createDiagnosticCollection("lsp-workbench");

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(collection);

  initSuppressions(context.workspaceState.get<string[]>(SUPPRESSIONS_STATE_KEY), (keys) =>
    context.workspaceState.update(SUPPRESSIONS_STATE_KEY, keys)
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      { language: SENIOR_LSP_LANGUAGE_ID, scheme: "*" },
      createLspCompletionProvider()
    )
  );

  registerCodeActions(context);
  registerLanguageFeatures(context);
  registerContextCommands(context);
  registerStatusBar(context);
  registerSemanticTokens(context);
  registerOutlineProvider(context);
  registerRefactorActions(context);

  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(SENIOR_LSP_LANGUAGE_ID, {
      provideDocumentFormattingEdits(document) {
        const cfg = vscode.workspace.getConfiguration("lsp");
        if (!cfg.get<boolean>("format.enabled", true)) {
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

  const refresh = (doc: vscode.TextDocument) => {
    if (lsState.active) return;
    if (doc.languageId !== SENIOR_LSP_LANGUAGE_ID) {
      return;
    }
    void (async () => {
      const cfg = vscode.workspace.getConfiguration("lsp");
      const globalIgnore = cfg.get<string[]>("diagnostics.ignoreIds", []) ?? [];
      const idx = getWorkspaceSymbolIndex();
      const settings = idx.readSettings();
      const root = idx.workspaceRootFor(doc.uri.fsPath);
      const matched = findMatchingContext(doc.uri.fsPath, root, settings.contexts);
      const ignore = mergeIgnoreIds(globalIgnore, matched?.diagnostics?.ignoreIds);

      const lines = doc.getText().replace(/\r\n/g, "\n").split("\n");
      idx.invalidate(doc.uri);
      let scopedExternal: Map<string, { fileName: string }> | undefined;
      try {
        scopedExternal = await idx.externalMapFor(doc);
      } catch {
        scopedExternal = undefined;
      }
      const hits = filterSuppressedHits(
        doc.uri.toString(),
        lines,
        analyzeLsp(doc.getText(), { ignoreIds: ignore, scopedExternal })
      );
      const diags = hits.map((h) => {
        const severity =
          h.severity === "error"
            ? vscode.DiagnosticSeverity.Error
            : vscode.DiagnosticSeverity.Warning;
        const line = doc.lineAt(h.line);
        const range =
          h.startCol !== undefined && h.endCol !== undefined
            ? new vscode.Range(h.line, h.startCol, h.line, h.endCol)
            : new vscode.Range(h.line, 0, h.line, line.text.length);
        const d = new vscode.Diagnostic(range, `[${h.id}] ${h.message}`, severity);
        d.code = h.id;
        d.source = "LSP Workbench";
        return d;
      });
      collection.set(doc.uri, diags);
    })();
  };

  /** Revalida todos os buffers LSP abertos (peers cruzados — FUN009 / símbolos). */
  const refreshOpenLspDocuments = (changed?: vscode.Uri) => {
    if (lsState.active) return;
    const idx = getWorkspaceSymbolIndex();
    if (changed) idx.invalidate(changed);
    else idx.invalidate();
    for (const d of vscode.workspace.textDocuments) {
      if (d.languageId === SENIOR_LSP_LANGUAGE_ID) refresh(d);
    }
  };

  if (lsState.active) {
    void startLanguageServer(context).then(
      () => {
        /* LS push diagnostics ANL*; suite SYN/RUL continua só in-process (PDR-005). */
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

  context.subscriptions.push(
    vscode.commands.registerCommand(APPLY_TEXT_EDITS_CMD, applySerializedTextEdits)
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
