/**
 * Adapter VS Code — Outline (DocumentSymbol).
 */

import * as vscode from "vscode";
import { SENIOR_LSP_LANGUAGE_ID } from "../../language";
import { buildOutline } from "../../application/outline";

export function registerOutlineProvider(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(
      { language: SENIOR_LSP_LANGUAGE_ID, scheme: "*" },
      {
        provideDocumentSymbols(document) {
          const items = buildOutline(document.getText());
          return items.map((it) => {
            const pos = new vscode.Position(it.line, 0);
            const range = document.lineAt(it.line).range;
            const kind =
              it.kind === "function"
                ? vscode.SymbolKind.Function
                : vscode.SymbolKind.Variable;
            return new vscode.DocumentSymbol(
              it.name,
              it.detail,
              kind,
              range,
              new vscode.Range(pos, pos)
            );
          });
        },
      }
    )
  );
}
