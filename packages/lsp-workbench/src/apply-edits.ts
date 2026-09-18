import * as vscode from "vscode";

/** Aplica TextEdits serializáveis via CompletionItem.command (Ctrl+Espaço). */
export const APPLY_TEXT_EDITS_CMD = "lsp-workbench.applyTextEdits";

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
