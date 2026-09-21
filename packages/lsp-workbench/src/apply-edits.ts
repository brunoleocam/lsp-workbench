import * as vscode from "vscode";
import { applySyn009BreakString } from "./quick-fixes";

/** Aplica TextEdits serializáveis via CompletionItem.command (Ctrl+Espaço). */
export const APPLY_TEXT_EDITS_CMD = "lsp-workbench.applyTextEdits";

/**
 * SYN009 via Ctrl+Espaço: args mínimos (uri + linha).
 * Embutir o literal quebrado em command/insertText/docs faz o suggest do Cursor sumir o item.
 */
export const APPLY_SYN009_CMD = "lsp-workbench.applySyn009";

export type SerializedTextEdit = {
  startLine: number;
  startCharacter: number;
  endLine: number;
  endCharacter: number;
  newText: string;
};

export function serializeTextEdit(edit: vscode.TextEdit): SerializedTextEdit {
  return {
    startLine: edit.range.start.line,
    startCharacter: edit.range.start.character,
    endLine: edit.range.end.line,
    endCharacter: edit.range.end.character,
    newText: edit.newText,
  };
}

export function serializeLineReplace(
  document: vscode.TextDocument,
  lineNumber: number,
  newText: string
): SerializedTextEdit {
  const line = document.lineAt(lineNumber);
  return serializeTextEdit(vscode.TextEdit.replace(line.range, newText));
}

export function serializeFullDocumentReplace(
  document: vscode.TextDocument,
  next: string
): SerializedTextEdit {
  const end = document.lineAt(document.lineCount - 1).range.end;
  return {
    startLine: 0,
    startCharacter: 0,
    endLine: end.line,
    endCharacter: end.character,
    newText: next,
  };
}

export async function applySerializedTextEdits(
  uriStr: string,
  edits: SerializedTextEdit[]
): Promise<boolean> {
  if (!uriStr || !edits?.length) return false;
  const uri = vscode.Uri.parse(uriStr);
  const we = new vscode.WorkspaceEdit();
  for (const e of edits) {
    we.replace(
      uri,
      new vscode.Range(e.startLine, e.startCharacter, e.endLine, e.endCharacter),
      e.newText
    );
  }
  return vscode.workspace.applyEdit(we);
}

/** Lê a linha no editor e aplica applySyn009BreakString (sem payload grande no CompletionItem). */
export async function applySyn009OnLine(uriStr: string, lineNumber: number): Promise<boolean> {
  if (!uriStr || lineNumber < 0) return false;
  const uri = vscode.Uri.parse(uriStr);
  let doc = vscode.workspace.textDocuments.find((d) => d.uri.toString() === uriStr);
  if (!doc) {
    doc = await vscode.workspace.openTextDocument(uri);
  }
  if (lineNumber >= doc.lineCount) return false;
  const line = doc.lineAt(lineNumber);
  const fixed = applySyn009BreakString(line.text);
  if (fixed === line.text) return false;
  const we = new vscode.WorkspaceEdit();
  we.replace(uri, line.range, fixed);
  return vscode.workspace.applyEdit(we);
}
