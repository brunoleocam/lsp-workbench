import * as vscode from "vscode";
import { SENIOR_LSP_LANGUAGE_ID } from "./language";
import {
  countBySeverity,
  createSaveHandler,
  formatCompileSummary,
  formatStatusBarText,
} from "./domain/compile-summary";

export const COMPILE_DOCUMENT_CMD = "lsp.compileDocument";

/** Revalida o documento; resolve quando os diagnósticos finais já foram publicados. */
export type RevalidateDocument = (doc: vscode.TextDocument) => Promise<void>;

function isSeniorLsp(doc: vscode.TextDocument | undefined): doc is vscode.TextDocument {
  return doc?.languageId === SENIOR_LSP_LANGUAGE_ID;
}

function countsFor(uri: vscode.Uri) {
  return countBySeverity(vscode.languages.getDiagnostics(uri));
}

export function registerCompileCommands(
  context: vscode.ExtensionContext,
  revalidate: RevalidateDocument
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(COMPILE_DOCUMENT_CMD, async () => {
      const doc = vscode.window.activeTextEditor?.document;
      if (!isSeniorLsp(doc)) {
        void vscode.window.showWarningMessage("LSP: abra um arquivo LSP para compilar.");
        return;
      }
      await revalidate(doc);
      const counts = countsFor(doc.uri);
      const message = `LSP: ${formatCompileSummary(counts)}`;
      if (counts.errors > 0) void vscode.window.showErrorMessage(message);
      else if (counts.warnings > 0) void vscode.window.showWarningMessage(message);
      else void vscode.window.showInformationMessage(message);
    }),
    vscode.workspace.onDidSaveTextDocument(
      createSaveHandler<vscode.TextDocument>({
        languageId: SENIOR_LSP_LANGUAGE_ID,
        compileOnSave: () => vscode.workspace.getConfiguration("lsp").get<boolean>("compileOnSave"),
        revalidate,
      })
    )
  );

  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
  item.command = "workbench.actions.view.problems";
  item.tooltip = "LSP: erros e avisos deste arquivo (abrir Problemas)";
  context.subscriptions.push(item);

  const updateStatus = () => {
    const doc = vscode.window.activeTextEditor?.document;
    if (!isSeniorLsp(doc)) {
      item.hide();
      return;
    }
    item.text = formatStatusBarText(countsFor(doc.uri));
    item.show();
  };

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateStatus),
    vscode.languages.onDidChangeDiagnostics((e) => {
      const active = vscode.window.activeTextEditor?.document.uri.toString();
      if (active && e.uris.some((u) => u.toString() === active)) updateStatus();
    })
  );
  updateStatus();
}
