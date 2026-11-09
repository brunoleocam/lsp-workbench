import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import { SENIOR_LSP_LANGUAGE_ID } from "../../language";
import {
  BINARY_RULE_SCHEME,
  editedCopyNotice,
  resolveBinaryRuleFile,
  shouldOpenAsBinaryRule,
} from "../../domain/binary-rule-paths";
import { BinaryRuleFileSystem, isBinaryRuleFile } from "./binary-rule-fs";

export const OPEN_BINARY_RULE_CMD = "lsp.openBinaryRule";

async function openBinaryRule(
  fileUri: vscode.Uri,
  options?: vscode.TextDocumentShowOptions
): Promise<boolean> {
  const fsPath = fileUri.fsPath;
  if (!isBinaryRuleFile(fsPath)) {
    void vscode.window.showWarningMessage(
      `LSP: ${path.basename(fsPath)} não é uma regra .LSP binária do Senior.`
    );
    return false;
  }
  const { readsEditedCopy, writePath } = resolveBinaryRuleFile(fsPath, (p) => fs.existsSync(p));
  const target = vscode.Uri.file(fsPath).with({ scheme: BINARY_RULE_SCHEME });
  const doc = await vscode.workspace.openTextDocument(target);
  await vscode.window.showTextDocument(doc, options);
  if (readsEditedCopy) void vscode.window.showInformationMessage(editedCopyNotice(writePath));
  return true;
}

async function closeTabsOf(uri: vscode.Uri): Promise<void> {
  const key = uri.toString();
  for (const group of vscode.window.tabGroups.all) {
    for (const tab of group.tabs) {
      if (tab.input instanceof vscode.TabInputText && tab.input.uri.toString() === key) {
        try {
          await vscode.window.tabGroups.close(tab);
        } catch {
          /* aba já substituída pelo editor de preview */
        }
      }
    }
  }
}

async function pickFileUri(arg: unknown): Promise<vscode.Uri | undefined> {
  if (arg instanceof vscode.Uri) return arg;
  const active = vscode.window.activeTextEditor?.document.uri;
  if (active?.scheme === "file" && /\.lsp$/i.test(active.fsPath)) return active;
  const picked = await vscode.window.showOpenDialog({
    canSelectMany: false,
    filters: { "Regras Senior": ["LSP", "lsp"] },
  });
  return picked?.[0];
}

/** Esquema `lsp-binario`, abertura automática pelo Explorer (D4) e comando manual. */
export function registerBinaryRules(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider(BINARY_RULE_SCHEME, new BinaryRuleFileSystem(), {
      isCaseSensitive: false,
    })
  );

  const redirecting = new Set<string>();
  const redirectTab = async (tab: vscode.Tab): Promise<void> => {
    if (!(tab.input instanceof vscode.TabInputText)) return;
    const uri = tab.input.uri;
    const autoOpen = vscode.workspace.getConfiguration("lsp").get<boolean>("binary.autoOpen", true);
    if (!shouldOpenAsBinaryRule({ scheme: uri.scheme, fsPath: uri.fsPath, autoOpen }, isBinaryRuleFile)) {
      return;
    }
    const key = uri.toString();
    if (redirecting.has(key)) return;
    redirecting.add(key);
    try {
      const opened = await openBinaryRule(uri, {
        viewColumn: tab.group.viewColumn,
        preview: tab.isPreview,
      });
      if (opened) await closeTabsOf(uri);
    } finally {
      redirecting.delete(key);
    }
  };

  context.subscriptions.push(
    vscode.window.tabGroups.onDidChangeTabs((e) => {
      for (const tab of [...e.opened, ...e.changed]) void redirectTab(tab);
    }),
    vscode.workspace.onDidOpenTextDocument((doc) => {
      if (doc.uri.scheme === BINARY_RULE_SCHEME && doc.languageId !== SENIOR_LSP_LANGUAGE_ID) {
        void vscode.languages.setTextDocumentLanguage(doc, SENIOR_LSP_LANGUAGE_ID);
      }
    }),
    vscode.commands.registerCommand(OPEN_BINARY_RULE_CMD, async (arg?: unknown) => {
      const uri = await pickFileUri(arg);
      if (!uri) return;
      if ((await openBinaryRule(uri)) && uri.scheme === "file") await closeTabsOf(uri);
    })
  );

  for (const group of vscode.window.tabGroups.all) {
    for (const tab of group.tabs) void redirectTab(tab);
  }
}
